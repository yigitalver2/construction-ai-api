import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashPage.css';

const SplashPage = () => {
  const navigate = useNavigate();

  return (
    <div className="splash">
      {/* Built by bar */}
      <div className="splash-built-by">
        Built by{' '}
        <a href="https://yigitalver.com" target="_blank" rel="noreferrer">Yiğit Alver</a>
        {' '}&amp;{' '}
        <a href="https://tarikdeveci-portfolio.vercel.app" target="_blank" rel="noreferrer">Tarık Deveci</a>
      </div>

      {/* Hero */}
      <header className="splash-hero">
        <div className="splash-badge">AI-Powered Infrastructure Inspection</div>
        <h1 className="splash-title">
          Detect<span className="splash-accent">IQ</span>
        </h1>
        <p className="splash-subtitle">
          Automated structural damage segmentation using a fine-tuned SAM3 model
          trained on the DACL10K bridge inspection dataset.
        </p>
        <div className="splash-actions">
          <button className="splash-btn primary" onClick={() => navigate('/login')}>
            Get Started
          </button>
          <a
            className="splash-btn secondary"
            href="https://github.com/AI-Object-Dedection/sam3"
            target="_blank"
            rel="noreferrer"
          >
            View Training Repo
          </a>
        </div>
      </header>

      {/* Stats row */}
      <section className="splash-stats">
        <div className="splash-stat">
          <span className="splash-stat-value">19</span>
          <span className="splash-stat-label">Damage Classes</span>
        </div>
        <div className="splash-stat">
          <span className="splash-stat-value">~10K</span>
          <span className="splash-stat-label">Training Images</span>
        </div>
        <div className="splash-stat">
          <span className="splash-stat-value">0.56</span>
          <span className="splash-stat-label">Mean IoU</span>
        </div>
        <div className="splash-stat">
          <span className="splash-stat-value">0.25%</span>
          <span className="splash-stat-label">Trainable Params (LoRA)</span>
        </div>
      </section>

      {/* Technical details */}
      <section className="splash-section">
        <h2 className="splash-section-title">Model &amp; Training</h2>
        <div className="splash-cards">
          <div className="splash-card">
            <div className="splash-card-icon">🧠</div>
            <h3>Base Model</h3>
            <p><code>facebook/sam3</code></p>
            <p className="splash-card-sub">Segment Anything Model 3 — 842M parameters</p>
          </div>
          <div className="splash-card">
            <div className="splash-card-icon">🔧</div>
            <h3>Fine-Tuning</h3>
            <p>LoRA Adapter</p>
            <p className="splash-card-sub">2.1M trainable params (0.25% of base model)</p>
          </div>
          <div className="splash-card">
            <div className="splash-card-icon">📊</div>
            <h3>Dataset</h3>
            <p>DACL10K</p>
            <p className="splash-card-sub">~10,000 bridge inspection images, 19 annotated damage classes</p>
          </div>
          <div className="splash-card">
            <div className="splash-card-icon">⚙️</div>
            <h3>Training Setup</h3>
            <p>BCE + Dice Loss</p>
            <p className="splash-card-sub">Cosine warmup · NVIDIA A100 40GB (Colab Pro+)</p>
          </div>
          <div className="splash-card">
            <div className="splash-card-icon">📈</div>
            <h3>Performance</h3>
            <p>Val Loss: 0.2662</p>
            <p className="splash-card-sub">Mean IoU: 0.5626 across all 19 damage classes</p>
          </div>
          <div className="splash-card">
            <div className="splash-card-icon">🏗️</div>
            <h3>Damage Classes</h3>
            <p>Crack, Spalling, Rust…</p>
            <p className="splash-card-sub">Cavity, ExposedRebars, Efflorescence, Weathering +12 more</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="splash-section">
        <h2 className="splash-section-title">Platform Features</h2>
        <div className="splash-features">
          <div className="splash-feature">
            <span className="splash-feature-icon">🔍</span>
            <div>
              <strong>AI Search</strong>
              <p>Natural-language search powered by GPT-4o — query your photos in plain English or Turkish.</p>
            </div>
          </div>
          <div className="splash-feature">
            <span className="splash-feature-icon">🗺️</span>
            <div>
              <strong>Segmentation Masks</strong>
              <p>Pixel-level damage localization with per-class coverage and confidence scores.</p>
            </div>
          </div>
          <div className="splash-feature">
            <span className="splash-feature-icon">📄</span>
            <div>
              <strong>PDF Reports</strong>
              <p>Export detailed inspection reports with original photos, segmentation overlays, and statistics.</p>
            </div>
          </div>
          <div className="splash-feature">
            <span className="splash-feature-icon">📊</span>
            <div>
              <strong>Analytics Dashboard</strong>
              <p>Damage distribution charts and upload timelines for site monitoring over time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="splash-footer">
        <p>
          Training repository:{' '}
          <a href="https://github.com/AI-Object-Dedection/sam3" target="_blank" rel="noreferrer">
            github.com/AI-Object-Dedection/sam3
          </a>
        </p>
        <p>
          <a href="https://yigitalver.com" target="_blank" rel="noreferrer">yigitalver.com</a>
          {' · '}
          <a href="https://tarikdeveci-portfolio.vercel.app" target="_blank" rel="noreferrer">tarikdeveci-portfolio.vercel.app</a>
        </p>
      </footer>
    </div>
  );
};

export default SplashPage;
