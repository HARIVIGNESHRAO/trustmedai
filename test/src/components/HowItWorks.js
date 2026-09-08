'use client'
import { useEffect, useRef, useState } from 'react'

const steps = [
  {
    num: '01',
    icon: '📋',
    title: 'Input Health Data',
    desc: 'Upload lab reports, biomarkers, vitals, and medical history in FHIR, HL7, or PDF formats.',
    color: 'var(--cyan)',
  },
  {
    num: '02',
    icon: '🤖',
    title: 'AI Risk Analysis',
    desc: 'Ensemble ML models run simultaneous multi-disease risk prediction with SHAP explanations generated.',
    color: 'var(--purple)',
  },
  {
    num: '03',
    icon: '⛓',
    title: 'Blockchain Logging',
    desc: 'Every prediction is cryptographically signed and written to Hyperledger Fabric for immutable audit.',
    color: 'var(--green)',
  },
  {
    num: '04',
    icon: '🏥',
    title: 'Hospital Matched',
    desc: 'AI matches your risk profile to verified hospitals ranked by specialty, proximity, and quality score.',
    color: 'var(--amber)',
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [activeStep, setActiveStep] = useState(-1)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          // Stagger step reveals
          steps.forEach((_, i) => {
            setTimeout(() => setActiveStep(i), 300 + i * 200)
          })
          observer.unobserve(entries[0].target)
        }
      },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className={`how-section ${visible ? 'section-visible' : ''}`} id="how" ref={ref}>
      <div className="container">
        <div className="how-header">
          <div>
            <div className="section-eyebrow">Process</div>
            <h2 className="section-title">
              How <span className="highlight">TrustMedAI</span> Works
            </h2>
            <p className="section-sub">
              From biomarker input to a verified hospital recommendation in under 3 seconds.
            </p>
          </div>
          <div className="how-timeline-label">
            <span className="timeline-dot" />
            Average processing: <strong>2.4 seconds</strong>
          </div>
        </div>

        {/* Connection line */}
        <div className="steps-connector">
          <div className="connector-line" />
          <div className="connector-pulse" style={{ width: visible ? '100%' : '0%' }} />
        </div>

        <div className="steps-grid">
          {steps.map((s, i) => (
            <div
              className={`step-card ${i <= activeStep ? 'step-revealed' : ''}`}
              key={s.num}
              style={{ '--step-color': s.color }}
            >
              <div className="step-num">{s.num}</div>
              <div className="step-icon-wrap">
                <span className="step-icon">{s.icon}</span>
              </div>
              <h3 className="step-heading">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
              <div className="step-progress">
                <div className="step-progress-fill" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}