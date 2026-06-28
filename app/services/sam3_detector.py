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
        # --- TEMP DEBUG (remove later): verify GPU/CUDA visibility at load time ---
        print(f"[DEBUG] torch version: {torch.__version__}")
        print(f"[DEBUG] CUDA available: {torch.cuda.is_available()}")
        if torch.cuda.is_available():
            print(f"[DEBUG] CUDA device: {torch.cuda.get_device_name(0)}")
        else:
            print(f"[DEBUG] CUDA not available, reason check needed")
        # --- END TEMP DEBUG ---
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

        # --- TEMP DEBUG (remove later): flush=True so each line shows even if it
        # hangs on the next step (uvicorn/Docker stdout is otherwise buffered). ---
        print(f"[DEBUG] target device = {device}", flush=True)
        print(f"[DEBUG] Loading processor {settings.SAM3_MODEL_NAME} ...", flush=True)
        processor = Sam3Processor.from_pretrained(settings.SAM3_MODEL_NAME, token=token)

        print("[DEBUG] Processor loaded. Starting Sam3Model.from_pretrained ...", flush=True)
        base_model = Sam3Model.from_pretrained(settings.SAM3_MODEL_NAME, token=token)

        print("[DEBUG] Base model loaded (CPU). Moving base model to device ...", flush=True)
        base_model = base_model.to(device)

        print(f"[DEBUG] Base on {device}. Loading PeftModel adapter from {ckpt} ...", flush=True)
        # Load the base model first, then stack the trained LoRA adapter on top.
        model = PeftModel.from_pretrained(base_model, ckpt)

        print("[DEBUG] PeftModel loaded. Moving full model to device ...", flush=True)
        model = model.to(device)

        print("[DEBUG] Model on device. Calling eval() ...", flush=True)
        model.eval()  # adapter_config has inference_mode=true, but make it explicit
        print("[DEBUG] Model fully ready.", flush=True)
        # --- END TEMP DEBUG ---

        Sam3Detector._processor = processor
        Sam3Detector._model = model
        Sam3Detector._device = device
        print(f"[sam3] Model ready on {device}.")

    def analyze(self, image_path: str) -> DetectionResult:
        import time
        import torch
        from PIL import Image

        self._load()

        model = Sam3Detector._model
        processor = Sam3Detector._processor
        device = Sam3Detector._device

        # --- TEMP DEBUG (remove later): time each step of the forward loop ---
        print(f"[DEBUG] analyze() start: {image_path}", flush=True)
        if image_path.startswith(("http://", "https://")):
            import urllib.request, io
            with urllib.request.urlopen(image_path) as resp:
                gorsel = Image.open(io.BytesIO(resp.read())).convert("RGB")
        else:
            gorsel = Image.open(image_path).convert("RGB")

        # Görseli bir kez işle — tüm sınıflar için aynı pixel_values
        image_inputs = processor.image_processor(images=gorsel, return_tensors="pt")
        pixel_values = image_inputs["pixel_values"].to(device)
        print(f"[DEBUG] image preprocessed, pixel_values shape={tuple(pixel_values.shape)}", flush=True)

        classes = []
        detected_masks = {}  # label -> (H, W) bool mask for visualization

        model.eval()
        with torch.no_grad():
            for i, label in enumerate(DAMAGE_CLASSES):
                t0 = time.time()
                print(f"[DEBUG] [{i+1}/{len(DAMAGE_CLASSES)}] '{label}' forward start ...", flush=True)
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
                if device == "cuda":
                    torch.cuda.synchronize()
                print(f"[DEBUG] [{i+1}/{len(DAMAGE_CLASSES)}] '{label}' forward done in {time.time()-t0:.2f}s", flush=True)

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
                detected_masks[label] = mask

        mask_url = None
        if detected_masks:
            mask_url = self._render_and_upload(gorsel, detected_masks, classes)

        return DetectionResult(classes=classes, backend=self.backend_name, mask_url=mask_url)

    # Color palette — one distinct color per damage class
    _CLASS_COLORS = {
        "Crack":         (220,  20,  60),
        "ACrack":        (255, 127,   0),
        "Spalling":      (255, 215,   0),
        "Efflorescence": (144, 238, 144),
        "ExposedRebars": (  0, 160,   0),
        "Cavity":        (  0, 210, 100),
        "Restformwork":  (  0, 206, 209),
        "Rockpocket":    (188, 143, 143),
        "Hollowareas":   (135, 206, 235),
        "Rust":          ( 65, 105, 225),
        "Weathering":    ( 75,   0, 130),
        "Graffiti":      (148,   0, 211),
        "Wetspot":       (255,  20, 147),
        "Bearing":       (139,   0,   0),
        "Drainage":      (101,  67,  33),
        "EJoint":        (128, 128, 128),
        "JTape":         (192, 192, 192),
        "PEquipment":    (255, 182, 193),
        "WConccor":      (173, 255,  47),
    }

    def _render_and_upload(self, original_image, detected_masks: dict, classes) -> str:
        """Build side-by-side visualization (original | colored mask + legend) and upload."""
        import io
        from PIL import Image, ImageDraw, ImageFont

        SIZE = 512  # each panel is 512×512 to keep the upload small

        # --- left panel: original resized ---
        left = original_image.resize((SIZE, SIZE), Image.LANCZOS)

        # --- right panel: colored segmentation mask ---
        mask_h, mask_w = next(iter(detected_masks.values())).shape
        composite = np.zeros((mask_h, mask_w, 3), dtype=np.uint8)
        for label, mask in detected_masks.items():
            color = self._CLASS_COLORS.get(label, (200, 200, 200))
            composite[mask] = color
        right = Image.fromarray(composite).resize((SIZE, SIZE), Image.NEAREST)

        # --- legend (drawn on the right panel) ---
        draw = ImageDraw.Draw(right)
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 13)
            font_small = font
        except Exception:
            font = ImageFont.load_default()
            font_small = font

        legend_x, legend_y = SIZE - 185, SIZE - len(classes) * 18 - 10
        # semi-transparent legend background
        overlay = Image.new("RGBA", right.size, (0, 0, 0, 0))
        bg = ImageDraw.Draw(overlay)
        bg.rectangle(
            [legend_x - 4, legend_y - 4, SIZE - 2, SIZE - 2],
            fill=(0, 0, 0, 140),
        )
        right = right.convert("RGBA")
        right = Image.alpha_composite(right, overlay).convert("RGB")
        draw = ImageDraw.Draw(right)

        for i, dc in enumerate(sorted(classes, key=lambda c: c.coverage, reverse=True)):
            color = self._CLASS_COLORS.get(dc.label, (200, 200, 200))
            y = legend_y + i * 18
            draw.rectangle([legend_x, y + 2, legend_x + 12, y + 14], fill=color)
            draw.text(
                (legend_x + 16, y),
                f"{dc.label} (%{dc.coverage * 100:.1f})",
                fill=(255, 255, 255),
                font=font_small,
            )

        # --- combine side by side ---
        canvas = Image.new("RGB", (SIZE * 2, SIZE), (30, 30, 30))
        canvas.paste(left, (0, 0))
        canvas.paste(right, (SIZE, 0))

        # add panel titles
        title_draw = ImageDraw.Draw(canvas)
        title_draw.text((SIZE // 2 - 55, 6), "Orijinal Gorsel", fill=(255, 255, 255), font=font)
        title_draw.text((SIZE + SIZE // 2 - 80, 6), "Tespit Edilen Hasar Turleri", fill=(255, 255, 255), font=font)

        # --- upload to Cloudinary ---
        from app.services.storage import upload_image
        buf = io.BytesIO()
        canvas.save(buf, format="JPEG", quality=88)
        buf.seek(0)

        unique_name = f"mask_{id(detected_masks)}.jpg"
        return upload_image(buf.read(), unique_name)
