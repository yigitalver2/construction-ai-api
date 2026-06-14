"""
MockDetector - a stand-in model so the whole pipeline works today.

It produces realistic-looking DACL10K damage detections WITHOUT loading any
ML model, so upload -> analyze -> search -> analytics all light up with real
data. Results are deterministic per file (seeded by the filename) so the same
photo always gets the same labels - handy for demos and testing.

When the trained model is ready, set DETECTOR_BACKEND=sam3 and this file is no
longer used. Nothing else changes.
"""
import hashlib
import os
import random

from app.services.detector import (
    DAMAGE_CLASSES,
    BaseDetector,
    DetectedClass,
    DetectionResult,
)


class MockDetector(BaseDetector):
    """Fake detector that mimics SAM3 output shape with random-but-stable data."""

    backend_name = "mock"

    def analyze(self, image_path: str) -> DetectionResult:
        # Seed the RNG from the filename so results are stable per image.
        seed = int(hashlib.md5(os.path.basename(image_path).encode()).hexdigest(), 16)
        rng = random.Random(seed)

        # Pick 1-3 damage classes for this image.
        num_classes = rng.randint(1, 3)
        labels = rng.sample(DAMAGE_CLASSES, num_classes)

        classes = []
        for label in labels:
            classes.append(
                DetectedClass(
                    label=label,
                    coverage=round(rng.uniform(0.02, 0.35), 4),
                    confidence=round(rng.uniform(0.55, 0.98), 4),
                )
            )

        return DetectionResult(classes=classes, backend=self.backend_name)
