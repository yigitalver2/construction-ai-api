"""
Detector interface - the seam where the AI model plugs in.

This module defines the contract that every detector must follow and a
factory that picks the active backend from settings. The rest of the app
(upload flow, re-analyze endpoint) only ever talks to this interface, so
swapping the mock detector for the trained SAM3 model is a one-line config
change (DETECTOR_BACKEND=sam3).

Detection result -> Photo fields mapping:
    result.category          -> photo.category          (main detected class)
    result.confidence        -> photo.confidence        (0..1)
    result.detected_objects  -> photo.detected_objects  (JSON string)
    result.description       -> photo.description        (human summary)
"""
import json
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional

# DACL10K bridge-damage classes, in the exact order used by the SAM3 model
# (see SAM3/src/dataset.py DACL10K_CLASSES). The mock detector and the real
# SAM3 detector both produce labels from this list, so search/analytics behave
# identically before and after the model is connected.
DAMAGE_CLASSES = [
    # Concrete damage
    "Crack",
    "ACrack",
    "Spalling",
    "Efflorescence",
    "ExposedRebars",
    "Cavity",
    "Restformwork",
    "Rockpocket",
    "Hollowareas",
    # General damage
    "Rust",
    "Weathering",
    "Graffiti",
    "Wetspot",
    # Bridge components
    "Bearing",
    "Drainage",
    "EJoint",
    "JTape",
    "PEquipment",
    "WConccor",
]


@dataclass
class DetectedClass:
    """A single damage class found in an image."""
    label: str
    coverage: float      # fraction of pixels covered by this class (0..1)
    confidence: float    # model confidence for this class (0..1)


@dataclass
class DetectionResult:
    """
    Backend-agnostic result of analyzing one image.

    Whatever model produces it (mock or SAM3), the shape is the same so the
    database-update glue in analysis_service never has to change.
    """
    classes: List[DetectedClass] = field(default_factory=list)
    backend: str = "unknown"

    @property
    def category(self) -> Optional[str]:
        """Main detected class = the one covering the most area."""
        if not self.classes:
            return None
        return max(self.classes, key=lambda c: c.coverage).label

    @property
    def confidence(self) -> Optional[float]:
        """Overall confidence = confidence of the main detected class."""
        if not self.classes:
            return None
        return round(max(self.classes, key=lambda c: c.coverage).confidence, 4)

    @property
    def overall_damage(self) -> float:
        """Total fraction of the image flagged as any damage (0..1)."""
        if not self.classes:
            return 0.0
        return round(min(1.0, sum(c.coverage for c in self.classes)), 4)

    def description(self) -> Optional[str]:
        """Short human-readable summary, e.g. 'Crack (12%), Rust (4%)'."""
        if not self.classes:
            return "No damage detected"
        parts = [
            f"{c.label} ({c.coverage * 100:.0f}%)"
            for c in sorted(self.classes, key=lambda c: c.coverage, reverse=True)
        ]
        return "Detected: " + ", ".join(parts)

    def detected_objects_json(self) -> str:
        """Serialize for the Photo.detected_objects Text column."""
        payload = {
            "backend": self.backend,
            "overall_damage": self.overall_damage,
            "classes": [
                {
                    "label": c.label,
                    "coverage": round(c.coverage, 4),
                    "confidence": round(c.confidence, 4),
                }
                for c in sorted(self.classes, key=lambda c: c.coverage, reverse=True)
            ],
        }
        return json.dumps(payload, ensure_ascii=False)


class BaseDetector(ABC):
    """Contract every detector implements."""

    backend_name: str = "base"

    @abstractmethod
    def analyze(self, image_path: str) -> DetectionResult:
        """Run detection on one image file and return a DetectionResult."""
        raise NotImplementedError


def get_detector() -> BaseDetector:
    """
    Return the active detector based on settings.DETECTOR_BACKEND.

    Imports are done lazily so that the heavy SAM3 dependencies
    (torch/transformers/peft) are only imported when DETECTOR_BACKEND=sam3.
    With the default "mock" backend the app needs zero ML dependencies.
    """
    from app.core.config import settings

    backend = (settings.DETECTOR_BACKEND or "mock").lower()

    if backend == "sam3":
        from app.services.sam3_detector import Sam3Detector
        return Sam3Detector()

    from app.services.mock_detector import MockDetector
    return MockDetector()
