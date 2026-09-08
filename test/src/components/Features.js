'use client'
import { useState, useEffect, useRef } from 'react'

const features = [
  {
    icon: '🧠',
    title: 'Explainable AI (XAI)',
    desc: 'SHAP values and LIME explanations reveal exactly which biomarkers drove your risk score — no black-box decisions.',
    color: '#7B61FF',
  },
  {
    icon: '🔬',
    title: 'Multi-Disease Prediction',
    desc: 'Simultaneous risk assessment across 15+ diseases including diabetes, cardiovascular, and renal conditions.',
    color: '#00E5FF',
  },
  {
    icon: '⛓',
    title: 'Blockchain Verification',
    desc: 'Hospital credentials and prediction logs are cryptographically anchored on Hyperledger Fabric.',
    color: '#4FFFB0',
  },
  {
    icon: '🏥',
    title: 'Intelligent Hospital Matching',
    desc: 'AI-powered ranking matches your disease profile to the most capable and highest-rated facilities.',
    color: '#FFB547',
  },
]

const vizData = [
  [
    { feat: 'HbA1c Level', val: '+0.42', width: '42%', type: 'positive' },
    { feat: 'BMI', val: '+0.28', width: '28%', type: 'positive' },
    { feat: 'Fasting Glucose', val: '+0.18', width: '18%', type: 'positive' },
    { feat: 'Physical Activity', val: '−0.24', width: '24%', type: 'negative' },
    { feat: 'Diet Score', val: '−0.16', width: '16%', type: 'negative' },
  ],
  [
    { feat: 'Blood Pressure', val: '+0.38', width: '38%', type: 'positive' },
    { feat: 'Cholesterol', val: '+0.31', width: '31%', type: 'positive' },
    { feat: 'Heart Rate', val: '+0.14', width: '14%', type: 'positive' },
    { feat: 'Exercise Freq.', val: '−0.29', width: '29%', type: 'negative' },
    { feat: 'Sleep Quality', val: '−0.11', width: '11%', type: 'negative' },
  ],
  [
    { feat: 'Tx Hash', val: '0x7f3a...', width: '0%', type: 'positive' },
    { feat: 'Block Height', val: '#18.4M', width: '0%', type: 'positive' },
    { feat: 'Consensus', val: 'Raft', width: '0%', type: 'positive' },
    { feat: 'Peers Active', val: '12/12', width: '0%', type: 'negative' },
    { feat: 'Latency', val: '< 80ms', width: '0%', type: 'negative' },
  ],
  [
    { feat: 'Specialty Match', val: '+0.44', width: '44%', type: 'positive' },
    { feat: 'Quality Score', val: '+0.36', width: '36%', type: 'positive' },
    { feat: 'Proximity', val: '+0.22', width: '22%', type: 'positive' },
    { feat: 'Wait Time', val: '−0.18', width: '18%', type: 'negative' },
    { feat: 'Cost Index', val: '−0.12', width: '12%', type: 'negative' },
  ],
]

const vizTitles = [
  'SHAP Explanation — Diabetes Risk',
  'SHAP Explanation — Cardiovascular',
  'Blockchain Node Status',
  'Hospital Ranking Factors',
]

export default function Features() {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          observer.unobserve(entries[0].target)
        }
      },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const shapRows = vizData[active]
  const isBlockchain = active === 2

  return (
    <section id="features" ref={ref} className={visible ? 'section-visible' : ''}>
      <div className="container features-grid">
        <div>
          <div className="section-eyebrow">Core Capabilities</div>
          <h2 className="section-title">
            Built on Three Pillars<br />of <span className="highlight">Trust</span>
          </h2>
          <p className="section-sub">
            Every prediction is explainable, every hospital is verified, and every record is immutable on-chain.
          </p>
          <div className="features-list">
            {features.map((f, i) => (
              <div
                key={i}
                className={`feature-item${active === i ? ' active' : ''}`}
                onClick={() => setActive(i)}
                style={{
                  '--feature-accent': f.color,
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div className="feature-icon-wrap">{f.icon}</div>
                <div className="feature-text">
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
                <div className="feature-arrow">→</div>
              </div>
            ))}
          </div>
        </div>

        <div className="features-viz">
          <div className="viz-panel" style={{ '--viz-accent': features[active].color }}>
            <div className="viz-topbar">
              <div className="viz-dot vd-r" />
              <div className="viz-dot vd-y" />
              <div className="viz-dot vd-g" />
              <div className="viz-title-bar">{vizTitles[active]}</div>
            </div>
            <div className="viz-body">
              <div className="shap-title">
                {isBlockchain ? 'Node Information' : 'Feature Contribution to Prediction'}
              </div>
              <div className="shap-rows">
                {shapRows.map((r, i) => (
                  <div className="shap-row" key={`${active}-${i}`} style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="shap-feat">{r.feat}</div>
                    {isBlockchain ? (
                      <div className="shap-blockchain-val">{r.val}</div>
                    ) : (
                      <>
                        <div className="shap-bar-container">
                          <div className="shap-zero" />
                          <div
                            className={`shap-bar shap-${r.type}`}
                            style={{ width: r.width }}
                          />
                        </div>
                        <div
                          className="shap-val"
                          style={r.type === 'negative' ? { color: 'var(--cyan)' } : {}}
                        >
                          {r.val}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="viz-confidence">
                <span className="viz-confidence-label">Model Confidence</span>
                <div className="viz-confidence-bar">
                  <div
                    className="viz-confidence-fill"
                    style={{ width: isBlockchain ? '100%' : '94.7%' }}
                  />
                </div>
                <span className="viz-confidence-val">{isBlockchain ? '100%' : '94.7%'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}