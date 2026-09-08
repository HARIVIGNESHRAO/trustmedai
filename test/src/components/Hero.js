'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const diseases = [
  { name: 'Diabetes T2', pct: '72%', cls: 'fill-high', delay: 0 },
  { name: 'Hypertension', pct: '55%', cls: 'fill-med', delay: 100 },
  { name: 'Coronary Artery', pct: '41%', cls: 'fill-med', delay: 200 },
  { name: 'Kidney Disease', pct: '18%', cls: 'fill-low', delay: 300 },
  { name: 'Liver Cirrhosis', pct: '9%', cls: 'fill-low', delay: 400 },
]

export default function Hero() {
  const sectionRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('hero-visible')
            // Animate risk bars
            setTimeout(() => {
              document.querySelectorAll('.risk-bar-fill').forEach((bar) => {
                bar.style.width = bar.dataset.width
              })
            }, 800)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="hero" id="home" ref={sectionRef}>
      {/* Ambient glow orbs */}
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-grid-bg" />

      <div className="hero-inner">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="eyebrow-pulse" />
            Clinically informed AI <span className="version-badge">Private by design</span>
          </div>
          <h1 className="hero-title">
            <span className="hero-title-line">Predict Risk.</span>
            <span className="hero-title-line"><span className="highlight">Explain Every</span></span>
            <span className="hero-title-line">Decision.</span>
          </h1>
          <p className="hero-subtitle">
            TrustMedAI combines explainable AI, multi-disease risk modeling, and
            blockchain-verified hospital recommendations — putting transparent,
            trustworthy predictions at the center of your healthcare journey.
          </p>
          <div className="hero-actions">
            <button className="btn-hero" onClick={() => router.push('/login')}>
              <span className="btn-hero-text">Analyze My Risk</span>
              <span className="btn-hero-arrow">→</span>
            </button>
            <button className="btn-hero-outline" onClick={() => document.getElementById('how')?.scrollIntoView()}>
              <span className="btn-play-ring">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
              </span>
              View Demo
            </button>
          </div>
          <div className="hero-trust">
            {[
              { label: 'HIPAA Compliant', color: 'var(--green)' },
              { label: 'Blockchain Verified', color: 'var(--cyan)' },
              { label: 'XAI Powered', color: 'var(--purple)' },
            ].map((item) => (
              <div className="trust-item" key={item.label}>
                <div className="dot" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                {item.label}
              </div>
            ))}
          </div>
          <p className="hero-note">No credit card · Results in under 3 minutes · Your data stays encrypted</p>
        </div>

        <div className="hero-visual">
          <div className="hero-card-ring" />
          <div className="hero-card-main">
            <div className="card-header">
              <div className="card-title-sm">Risk Assessment Panel</div>
              <div className="card-status">LIVE</div>
            </div>
            <div className="disease-list">
              {diseases.map((d) => (
                <div className="disease-row" key={d.name} style={{ animationDelay: `${d.delay}ms` }}>
                  <div className="disease-name">{d.name}</div>
                  <div className="risk-bar-bg">
                    <div className={`risk-bar-fill ${d.cls}`} style={{ width: 0 }} data-width={d.pct} />
                  </div>
                  <div className="risk-pct">{d.pct}</div>
                </div>
              ))}
            </div>
            <div className="card-footer">
              <div className="blockchain-badge">
                <span className="chain-icon">⛓</span> Block #18,492,334
              </div>
              <div className="explainability-score">
                <span className="expl-label">XAI Score</span>
                <span className="expl-val">94.7%</span>
              </div>
            </div>
          </div>
          <div className="float-card float-card-1">
            <div className="float-label">Top Risk Factor</div>
            <div className="float-val amber">HbA1c: 8.2 mmol/L</div>
          </div>
          <div className="float-card float-card-2">
            <div className="float-label">Best Match Hospital</div>
            <div className="float-val green">AIIMS Delhi · 96% ✓</div>
          </div>
        </div>
      </div>
    </section>
  )
}
