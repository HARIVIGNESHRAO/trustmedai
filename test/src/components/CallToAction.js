'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CallToAction() {
  const ref = useRef(null)
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          observer.unobserve(entries[0].target)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className={`cta-section ${visible ? 'cta-visible' : ''}`} ref={ref}>
      <div className="cta-glow" />
      <div className="cta-glow cta-glow-2" />

      <div className="cta-badge">
        <span className="cta-badge-dot" />
        Get Started Today
      </div>

      <h2 className="section-title cta-title">
        Healthcare Decisions Deserve<br />
        <span className="highlight">Full Transparency</span>
      </h2>

      <p className="section-sub cta-sub">
        Join thousands of patients and clinicians using TrustMedAI to predict, understand, and act
        on health risks with full blockchain accountability.
      </p>

      <div className="cta-stats">
        {[
          { val: '50,000+', label: 'Patients Served' },
          { val: '200+', label: 'Clinicians Trust Us' },
          { val: '99.9%', label: 'Uptime' },
        ].map((s, i) => (
          <div className="cta-stat" key={i}>
            <div className="cta-stat-val">{s.val}</div>
            <div className="cta-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="cta-actions">
        <button className="btn-hero btn-cta-main" onClick={() => router.push('/login')}>
          Start Free Assessment
          <span className="btn-hero-arrow">→</span>
        </button>
        <button className="btn-hero-outline" onClick={() => document.getElementById('features')?.scrollIntoView()}>For Clinicians →</button>
      </div>

      <div className="cta-trust-row">
        <span>🔒 HIPAA Compliant</span>
        <span>⛓ Blockchain Verified</span>
        <span>🧠 XAI Powered</span>
        <span>📱 Works on All Devices</span>
      </div>
    </section>
  )
}
