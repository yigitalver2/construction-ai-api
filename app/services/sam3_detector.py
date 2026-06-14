"""
Sam3Detector - connects the trained SAM3 LoRA model to the site.

To go live you only need to:
    1) Install the ML deps: pip install torch transformers peft pillow numpy
    2) Make sure the trained LoRA checkpoint exists at SAM3_CHECKPOINT path
    3) Set env vars:
         DETECTOR_BACKEND=sam3
         SAM3_REPO_PATH=/path/to/SAM3
         SAM3_CHECKPOINT=checkpoints/mc_epoch_1_lora  (relative to SAM3_REPO_PATH)
         SAM3_MODEL_NAME=facebook/sam3

Heavy imports (torch/transformers/peft) happen lazily inside _load(), so when
DETECTOR_BACKEND=mock the site runs with zero ML dependencies.
"""
import os
import sys

from app.core.config import settings
from app.services.detector import (
    DAMAGE_CLASSES,
    BaseDetector,
    DetectedClass,
    DetectionResult,
)


class Sam3Detector(BaseDetector):
    """Runs the fine-tuned SAM3 model and maps its masks to DetectionResult."""

    backend_name = "sam3"

    # Loaded once and reused across requests (model load is expensive).
    _model = None
    _processor = None

    def __init__(self):
        self.min_coverage = settings.SAM3_MIN_COVERAGE
        self.threshold = settings.DAMAGE_CONFIDENCE_THRESHOLD

    def _checkpoint_path(self) -> str:
        """Resolve the LoRA checkpoint path (relative paths are under the SAM3 repo)."""
        ckpt = settings.SAM3_CHECKPOINT
        if os.path.isabs(ckpt):
            return ckpt
        return os.path.join(settings.SAM3_REPO_PATH, ckpt)

    def _load(self):
        """
        Load the base SAM3 model + processor and apply the trained LoRA adapter.

        Runs only once; subsequent calls reuse the cached model.
        """
        if Sam3Detector._model is not None:
            return

        import torch
        from transformers import AutoProcessor, AutoModelForSemanticSegmentation
        from peft import PeftModel

        # Add SAM3 repo to sys.path so its internal imports work.
        repo = settings.SAM3_REPO_PATH
        if repo not in sys.path:
            sys.path.insert(0, repo)

        ckpt = self._checkpoint_path()
        print(f"[sam3] Loading base model {settings.SAM3_MODEL_NAME} ...")
        processor = AutoProcessor.from_pretrained(settings.SAM3_MODEL_NAME)
        base_model = AutoModelForSemanticSegmentation.from_pretrained(
            settings.SAM3_MODEL_NAME
        )

        print(f"[sam3] Applying LoRA adapter from {ckpt} ...")
        model = PeftModel.from_pretrained(base_model, ckpt)
        model.eval()

        Sam3Detector._processor = processor
        Sam3Detector._model = model
        print("[sam3] Model ready.")

    def analyze(self, image_path: str) -> DetectionResult:
        import torch
        import numpy as np
        from PIL import Image

        self._load()

        image = Image.open(image_path).convert("RGB")
        inputs = Sam3Detector._processor(images=image, return_tensors="pt")

        with torch.no_grad():
            outputs = Sam3Detector._model(**inputs)

        # outputs.logits: (1, num_classes, H, W)
        logits = outputs.logits[0]  # (num_classes, H, W)
        probs = torch.sigmoid(logits).numpy()  # (num_classes, H, W)

        total_pixels = probs.shape[1] * probs.shape[2]
        classes = []

        for idx, label in enumerate(DAMAGE_CLASSES):
            if idx >= probs.shape[0]:
                break
            class_prob = probs[idx]  # (H, W)
            mask = class_prob > self.threshold
            coverage = float(mask.sum()) / total_pixels
            if coverage < self.min_coverage:
                continue
            confidence = float(class_prob[mask].mean()) if mask.any() else 0.0
            classes.append(
                DetectedClass(
                    label=label,
                    coverage=round(coverage, 4),
                    confidence=round(confidence, 4),
                )
            )

        return DetectionResult(classes=classes, backend=self.backend_name)
