'use client'
import { useEffect, useRef, useState } from 'react'

const diseases = [
  {
    emoji: '🩸',
    title: 'Type 2 Diabetes',
    desc: 'HbA1c, fasting glucose, insulin resistance, and 22 metabolic biomarkers analyzed.',
    tag: 'XGBoost · 97.2% AUC',
    accuracy: 97.2,
    color: '#FF6B6B',
  },
  {
    emoji: '❤️',
    title: 'Cardiovascular Disease',
    desc: 'Framingham-plus risk model with echocardiogram integration and ECG pattern recognition.',
    tag: 'Random Forest · 95.8% AUC',
    accuracy: 95.8,
    color: '#FF4F6B',
  },
  {
    emoji: '🫁',
    title: 'Chronic Kidney Disease',
    desc: 'eGFR trajectory modeling, proteinuria patterns, and creatinine time-series analysis.',
    tag: 'LightGBM · 96.1% AUC',
    accuracy: 96.1,
    color: '#4FFFB0',
  },
  {
    emoji: '🧠',
    title: 'Neurological Disorders',
    desc: "Parkinson's, Alzheimer's, and stroke risk from cognitive and biofluid markers.",
    tag: 'Deep Neural Net · 93.4% AUC',
    accuracy: 93.4,
    color: '#7B61FF',
  },
  {
    emoji: '🫀',
    title: 'Hypertension',
    desc: 'Blood pressure trajectory, arterial stiffness, and lifestyle factor interaction modeling.',
    tag: 'SVM Ensemble · 94.9% AUC',
    accuracy: 94.9,
    color: '#FFB547',
  },
  {
    emoji: '🔬',
    title: '+ 10 More Conditions',
    desc: 'Liver cirrhosis, COPD, thyroid disorders, anemia, osteoporosis, and more — continuously expanding.',
    tag: 'Multi-Label Classifier',
    accuracy: 95.0,
    color: '#00E5FF',
  },
]

export default function Diseases() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          observer.unobserve(entries[0].target)
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="diseases" ref={ref} className={visible ? 'section-visible' : ''}>
      <div className="container">
        <div className="diseases-header">
          <div>
            <div className="section-eyebrow">Disease Coverage</div>
            <h2 className="section-title">
              15+ Conditions,<br />One <span className="highlight">Platform</span>
            </h2>
            <p className="section-sub">
              Comprehensive multi-disease risk modeling using validated clinical datasets and ensemble methods.
            </p>
          </div>
          <div className="diseases-total-badge">
            <span className="diseases-total-num">15+</span>
            <span className="diseases-total-label">Disease Models Active</span>
          </div>
        </div>
        <div className="diseases-grid">
          {diseases.map((d, i) => (
            <div
              className="disease-card"
              key={i}
              style={{
                '--card-color': d.color,
                animationDelay: `${i * 80}ms`,
              }}
            >
              <div className="disease-card-glow" />
              <div className="disease-card-content">
                <div className="disease-card-top">
                  <span className="disease-emoji">{d.emoji}</span>
                  <div className="disease-accuracy">
                    <svg width="36" height="36" viewBox="0 0 36 36">
                      <circle
                        cx="18" cy="18" r="15"
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="3"
                      />
                      <circle
                        cx="18" cy="18" r="15"
                        fill="none"
                        stroke={d.color}
                        strokeWidth="3"
                        strokeDasharray={`${(d.accuracy / 100) * 94.2} 94.2`}
                        strokeLinecap="round"
                        transform="rotate(-90 18 18)"
                        style={{ transition: 'stroke-dasharray 1.5s ease' }}
                      />
                    </svg>
                    <span className="accuracy-text">{d.accuracy}%</span>
                  </div>
                </div>
                <h4>{d.title}</h4>
                <p>{d.desc}</p>
                <span className="disease-tag">{d.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}