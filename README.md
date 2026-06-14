---
title: AI Object Detection API
emoji: 🌉
colorFrom: indigo
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# AI Object Detection — Backend (FastAPI + SAM3)

FastAPI backend for the AI Object Detection site. Runs on a Hugging Face
Docker Space and serves the React frontend (hosted on Vercel).

It boots with a built-in **mock** detector, so the API works the moment the
Space is up. To connect the trained **SAM3** bridge-damage model, set the
Space variables below.

## Space variables / secrets (Settings → Variables and secrets)

| Name | Value |
|------|-------|
| `PUBLIC_BASE_URL` | This Space's URL, e.g. `https://<user>-<space>.hf.space` |
| `FRONTEND_ORIGIN` | The Vercel frontend URL, e.g. `https://<app>.vercel.app` |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `SECRET_KEY` | A long random string |

### To switch from mock to the trained model

1. Add the LoRA checkpoint (`adapter_config.json` + `adapter_model.safetensors`)
   to this Space at `/app/sam3_checkpoint` (default `SAM3_CHECKPOINT`).
2. Add `HF_TOKEN` (a Hugging Face token with access to `facebook/sam3`).
3. Set `DETECTOR_BACKEND=sam3`.

Note: the free CPU tier runs the model slowly (analysis happens in the
background after upload) and the filesystem resets on restart — use a hosted
database (Neon) for persistent data.
