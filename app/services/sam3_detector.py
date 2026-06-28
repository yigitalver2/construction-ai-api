"""
Sam3Detector - connects the trained SAM3 LoRA model to the site.

Uses the SAM3 repo's own inference approach: each damage class is queried
separately as a text prompt, and the model returns a segmentation mask per class.
"""
import os
import sys

import numpy as np

from app.core.config import settings
from app.services.detector import (
    DAMAGE_CLASSES,
    BaseDetector,
    DetectedClass,
    DetectionResult,
)


class Sam3Detector(BaseDetector):
    backend_name = "sam3"

    _model = None
    _processor = None
    _device = None

    def __init__(self):
        self.min_coverage = settings.SAM3_MIN_COVERAGE
        self.threshold = settings.DAMAGE_CONFIDENCE_THRESHOLD

    def _checkpoint_path(self) -> str:
        ckpt = settings.SAM3_CHECKPOINT
        if os.path.isabs(ckpt):
            return ckpt
        return os.path.join(settings.SAM3_REPO_PATH, ckpt)

    def _load(self):
        if Sam3Detector._model is not None:
            return

        import torch
        # Sam3Model = static-image segmentation head (returns Sam3ImageSegmentationOutput
        # with .semantic_seg). AutoModel.from_pretrained("facebook/sam3") instead resolves
        # to Sam3VideoModel, whose forward() requires an inference_session we don't have.
        # The LoRA adapter was trained on Sam3Model (see adapter_config base_model_class).
        from transformers import Sam3Model, Sam3Processor
        from peft import PeftModel

        repo = settings.SAM3_REPO_PATH
        if repo not in sys.path:
            sys.path.insert(0, repo)

        token = os.environ.get("HF_TOKEN")
        ckpt = self._checkpoint_path()

        device = "cuda" if torch.cuda.is_available() else "cpu"

        print(f"[sam3] Loading base model {settings.SAM3_MODEL_NAME} (Sam3Model) ...")
        processor = Sam3Processor.from_pretrained(settings.SAM3_MODEL_NAME, token=token)
        base_model = Sam3Model.from_pretrained(settings.SAM3_MODEL_NAME, token=token)

        print(f"[sam3] Applying LoRA adapter from {ckpt} ...")
        # Load the base model first, then stack the trained LoRA adapter on top.
        model = PeftModel.from_pretrained(base_model, ckpt)
        model.to(device)
        model.eval()  # adapter_config has inference_mode=true, but make it explicit

        Sam3Detector._processor = processor
        Sam3Detector._model = model
        Sam3Detector._device = device
        print(f"[sam3] Model ready on {device}.")

    def analyze(self, image_path: str) -> DetectionResult:
        import torch
        from PIL import Image

        self._load()

        model = Sam3Detector._model
        processor = Sam3Detector._processor
        device = Sam3Detector._device

        gorsel = Image.open(image_path).convert("RGB")

        # Görseli bir kez işle — tüm sınıflar için aynı pixel_values
        image_inputs = processor.image_processor(images=gorsel, return_tensors="pt")
        pixel_values = image_inputs["pixel_values"].to(device)

        classes = []

        model.eval()
        with torch.no_grad():
            for label in DAMAGE_CLASSES:
                text_inputs = processor.tokenizer(
                    label,
                    return_tensors="pt",
                    padding=True,
                    truncation=True,
                )

                outputs = model(
                    pixel_values=pixel_values,
                    input_ids=text_inputs["input_ids"].to(device),
                    attention_mask=text_inputs["attention_mask"].to(device),
                )

                # semantic_seg: (1, 1, H, W) logits
                logits = outputs.semantic_seg.squeeze()
                prob = logits.sigmoid().cpu().numpy()  # (H, W)

                mask = prob > self.threshold
                coverage = float(mask.sum()) / (prob.shape[0] * prob.shape[1])

                if coverage < self.min_coverage:
                    continue

                confidence = float(prob[mask].mean()) if mask.any() else 0.0
                classes.append(
                    DetectedClass(
                        label=label,
                        coverage=round(coverage, 4),
                        confidence=round(confidence, 4),
                    )
                )

        return DetectionResult(classes=classes, backend=self.backend_name)
