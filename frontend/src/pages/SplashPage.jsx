import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashPage.css';

/* ── inline icon set (stroke-based, no emoji) ─────────────────────────── */
const Icon = ({ path, fill }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {fill ? <g fill="currentColor" stroke="none">{path}</g> : path}
  </svg>
);

const icons = {
  model: <><path d="M12 2a3 3 0 0 0-3 3 3 3 0 0 0-3 5 3 3 0 0 0 0 4 3 3 0 0 0 3 5 3 3 0 0 0 6 0 3 3 0 0 0 3-5 3 3 0 0 0 0-4 3 3 0 0 0-3-5 3 3 0 0 0-3-3Z" /><path d="M12 5v14M9 10h6M8 14h8" /></>,
  tune: <><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" /><circle cx="4" cy="12" r="2" /><circle cx="12" cy="6" r="2" /><circle cx="20" cy="14" r="2" /></>,
  data: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" /></>,
  chart: <><path d="M3 3v18h18" /><path d="M7 15l3-4 3 2 5-7" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5M3 18l9 5 9-5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  mask: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 14c3-4 6-4 9 0s6 4 9 0" /><circle cx="8.5" cy="8" r="1.2" /></>,
  report: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></>,
  pulse: <><path d="M3 12h4l2 5 4-12 2 7h6" /></>,
};

/* ── animated count-up number ─────────────────────────────────────────── */
const CountUp = ({ value, suffix = '', prefix = '', decimals = 0, active }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf; const start = performance.now(); const dur = 1400;
    const tick = (t) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, value]);
  return <>{prefix}{n.toFixed(decimals)}{suffix}</>;
};

const DAMAGE_CLASSES = [
  'Crack', 'Spalling', 'Rust', 'Cavity', 'Exposed Rebars', 'Efflorescence',
  'Weathering', 'Rockpocket', 'Hollowareas', 'Restformwork', 'Wetspot',
  'Bearing', 'ExpansionJoint', 'Drainage', 'PEquipment', 'Joint Tape',
  'Graffiti', 'Cracked Paint', 'Alligator Crack',
];

const SplashPage = () => {
  const navigate = useNavigate();
  const [statsActive, setStatsActive] = useState(false);

  // scroll reveal + stats trigger
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-revealed');
          if (e.target.dataset.reveal === 'stats') setStatsActive(true);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // subtle parallax on hero glow following the pointer
  const heroRef = useRef(null);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (ev) => {
      const r = el.getBoundingClientRect();
      const x = ((ev.clientX - r.left) / r.width - 0.5) * 2;
      const y = ((ev.clientY - r.top) / r.height - 0.5) * 2;
      el.style.setProperty('--px', x.toFixed(3));
      el.style.setProperty('--py', y.toFixed(3));
    };
    el.addEventListener('pointermove', onMove);
    return () => el.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div className="splash">
      <div className="splash-noise" aria-hidden="true" />

      {/* Nav */}
      <nav className="splash-nav">
        <div className="splash-logo">
          <span className="splash-logo-mark">
            <Icon path={icons.mask} />
          </span>
          Detect<span className="splash-accent">IQ</span>
        </div>
        <div className="splash-nav-links">
          <a href="#model">Model</a>
          <a href="#features">Platform</a>
          <a href="https://github.com/AI-Object-Dedection/sam3" target="_blank" rel="noreferrer">Repo</a>
          <button className="splash-nav-cta" onClick={() => navigate('/login')}>Launch app</button>
        </div>
      </nav>

      {/* Hero */}
      <header className="splash-hero" ref={heroRef}>
        <div className="splash-aurora" aria-hidden="true" />
        <div className="splash-grid" aria-hidden="true" />

        <div className="splash-hero-copy">
          <div className="splash-badge">
            <span className="splash-dot" />
            Fine-tuned SAM&nbsp;3 · DACL10K
          </div>
          <h1 className="splash-title">
            Find structural damage
            <br />
            <span className="splash-gradient">before it finds you.</span>
          </h1>
          <p className="splash-subtitle">
            DetectIQ runs pixel-level segmentation over bridge &amp; building
            inspection photos — localizing cracks, spalling and corrosion across
            19 damage classes, then writes the report for you.
          </p>
          <div className="splash-actions">
            <button className="splash-btn primary" onClick={() => navigate('/login')}>
              Get started
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
            <a className="splash-btn ghost" href="https://github.com/AI-Object-Dedection/sam3" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.34 1.12 2.91.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.35 4.81-4.58 5.06.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" /></svg>
              Training repo
            </a>
          </div>
          <div className="splash-trust">
            <span><Icon path={icons.pulse} /> 0.56 mean IoU</span>
            <span><Icon path={icons.layers} /> SAM 3 · 842M params</span>
            <span><Icon path={icons.tune} /> LoRA · 0.25% trained</span>
          </div>
        </div>

        {/* Product visual */}
        <div className="splash-hero-visual" data-reveal="visual">
          <div className="splash-scanner">
            <div className="splash-scanner-top">
              <span className="splash-scanner-dots"><i /><i /><i /></span>
              <span className="splash-scanner-label">segmentation · live</span>
            </div>
            <div className="splash-canvas">
              <svg viewBox="0 0 400 260" className="splash-canvas-svg" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <linearGradient id="concrete" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#3b3f4a" />
                    <stop offset="1" stopColor="#23262e" />
                  </linearGradient>
                </defs>
                <rect width="400" height="260" fill="url(#concrete)" />
                {/* concrete texture lines */}
                <g stroke="#000" strokeOpacity="0.12">
                  <path d="M0 70 H400 M0 150 H400 M0 210 H400 M120 0 V260 M280 0 V260" />
                </g>
                {/* crack */}
                <path className="seg-crack" d="M60 40 Q110 90 95 130 T140 210" fill="none" stroke="#f97316" strokeWidth="3" />
                {/* spalling mask */}
                <path className="seg-blob seg-spall" d="M250 60 q35 -10 50 20 t-5 50 q-30 25 -60 5 t15 -75Z" />
                {/* rust mask */}
                <path className="seg-blob seg-rust" d="M210 170 q25 -15 45 5 t-5 40 q-25 15 -45 -5 t5 -40Z" />
                <g className="splash-scanline"><rect width="400" height="3" fill="#a5b4fc" fillOpacity="0.9" /></g>
              </svg>
              {/* floating labels */}
              <span className="seg-tag tag-crack">Crack · 0.92</span>
              <span className="seg-tag tag-spall">Spalling · 0.87</span>
              <span className="seg-tag tag-rust">Rust · 0.79</span>
            </div>
            <div className="splash-scanner-foot">
              <span><b>3</b> regions</span>
              <span className="sep" />
              <span>inference <b>1.2s</b></span>
              <span className="sep" />
              <span className="ok">report ready</span>
            </div>
          </div>
          <div className="splash-float chip-a"><Icon path={icons.search} /> Ask in plain English</div>
          <div className="splash-float chip-b"><Icon path={icons.report} /> Auto PDF export</div>
        </div>
      </header>

      {/* Marquee */}
      <div className="splash-marquee" aria-hidden="true">
        <div className="splash-marquee-track">
          {[...DAMAGE_CLASSES, ...DAMAGE_CLASSES].map((c, i) => (
            <span key={i} className="splash-chip">{c}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <section className="splash-stats" data-reveal="stats">
        <div className="splash-stat">
          <span className="splash-stat-value"><CountUp value={19} active={statsActive} /></span>
          <span className="splash-stat-label">Damage classes</span>
        </div>
        <div className="splash-stat">
          <span className="splash-stat-value"><CountUp value={10} suffix="K" active={statsActive} /></span>
          <span className="splash-stat-label">Training images</span>
        </div>
        <div className="splash-stat">
          <span className="splash-stat-value"><CountUp value={0.56} decimals={2} active={statsActive} /></span>
          <span className="splash-stat-label">Mean IoU</span>
        </div>
        <div className="splash-stat">
          <span className="splash-stat-value"><CountUp value={2.1} decimals={1} suffix="M" active={statsActive} /></span>
          <span className="splash-stat-label">LoRA params · 0.25%</span>
        </div>
      </section>

      {/* Model & training */}
      <section className="splash-section" id="model">
        <div className="splash-section-head" data-reveal="head">
          <span className="splash-eyebrow">Under the hood</span>
          <h2 className="splash-section-title">A 842M-param model, tuned for concrete.</h2>
          <p className="splash-section-lead">
            We adapted Segment Anything 3 to structural inspection with a
            lightweight LoRA adapter — heavyweight understanding, featherweight footprint.
          </p>
        </div>
        <div className="splash-cards">
          {[
            { i: 'model', k: 'Base model', v: 'facebook/sam3', s: 'Segment Anything Model 3 — 842M parameters' },
            { i: 'tune', k: 'Fine-tuning', v: 'LoRA adapter', s: '2.1M trainable params · 0.25% of the base' },
            { i: 'data', k: 'Dataset', v: 'DACL10K', s: '~10,000 inspection images · 19 annotated classes' },
            { i: 'gear', k: 'Training', v: 'BCE + Dice loss', s: 'Cosine warmup · NVIDIA A100 40GB (Colab Pro+)' },
            { i: 'chart', k: 'Performance', v: 'Val loss 0.2662', s: 'Mean IoU 0.5626 across all 19 classes' },
            { i: 'layers', k: 'Coverage', v: 'Crack · Spalling · Rust', s: 'Cavity, ExposedRebars, Efflorescence +13 more' },
          ].map((c, idx) => (
            <article className="splash-card" data-reveal="card" style={{ '--d': `${idx * 60}ms` }} key={c.k}>
              <span className="splash-card-icon"><Icon path={icons[c.i]} /></span>
              <h3>{c.k}</h3>
              <p className="splash-card-value">{c.v}</p>
              <p className="splash-card-sub">{c.s}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="splash-section" id="features">
        <div className="splash-section-head" data-reveal="head">
          <span className="splash-eyebrow">The platform</span>
          <h2 className="splash-section-title">From a photo to a signed-off report.</h2>
        </div>
        <div className="splash-features">
          {[
            { i: 'search', t: 'AI search', d: 'Natural-language search over your photos — query in plain English or Turkish, powered by GPT-4o.' },
            { i: 'mask', t: 'Segmentation masks', d: 'Pixel-level damage localization with per-class coverage and confidence scores.' },
            { i: 'report', t: 'PDF reports', d: 'Export inspection reports with original photos, overlays and statistics in one click.' },
            { i: 'chart', t: 'Analytics', d: 'Damage distribution and upload timelines to monitor a site over time.' },
          ].map((f, idx) => (
            <div className="splash-feature" data-reveal="card" style={{ '--d': `${idx * 60}ms` }} key={f.t}>
              <span className="splash-feature-icon"><Icon path={icons[f.i]} /></span>
              <div>
                <strong>{f.t}</strong>
                <p>{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="splash-cta" data-reveal="cta">
        <div className="splash-cta-inner">
          <h2>Ready to inspect smarter?</h2>
          <p>Upload a photo and watch DetectIQ map the damage in seconds.</p>
          <button className="splash-btn primary lg" onClick={() => navigate('/login')}>
            Launch DetectIQ
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="splash-footer">
        <div className="splash-footer-top">
          <div className="splash-logo sm">
            <span className="splash-logo-mark"><Icon path={icons.mask} /></span>
            Detect<span className="splash-accent">IQ</span>
          </div>
          <div className="splash-footer-links">
            <a href="https://github.com/AI-Object-Dedection/sam3" target="_blank" rel="noreferrer">Training repo</a>
            <a href="https://yigitalver.com" target="_blank" rel="noreferrer">yigitalver.com</a>
            <a href="https://tarikdeveci-portfolio.vercel.app" target="_blank" rel="noreferrer">tarikdeveci.dev</a>
          </div>
        </div>
        <div className="splash-footer-bottom">
          <span>© {new Date().getFullYear()} DetectIQ — Infrastructure inspection, automated.</span>
          <span>
            Built by{' '}
            <a href="https://yigitalver.com" target="_blank" rel="noreferrer">Yiğit Alver</a>
            {' & '}
            <a href="https://tarikdeveci-portfolio.vercel.app" target="_blank" rel="noreferrer">Tarık Deveci</a>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default SplashPage;
