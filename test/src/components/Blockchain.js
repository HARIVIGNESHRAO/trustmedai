'use client'
import { useEffect, useRef, useState } from 'react'

const chainFeatures = [
  {
    icon: '🔐',
    title: 'Zero-Knowledge Proof Privacy',
    desc: 'Patient data verified without exposure using ZK-SNARK proofs on Hyperledger.',
  },
  {
    icon: '📜',
    title: 'Smart Contract Automation',
    desc: 'Hospital credential validation and recommendation triggers governed by auditable smart contracts.',
  },
  {
    icon: '🔗',
    title: 'Interoperable Health Chain',
    desc: 'Connects with national health registries and EHR systems via FHIR R4 bridge.',
  },
]

const blocks = [
  {
    id: 'BLOCK #18,492,334',
    verified: true,
    hash: '0x7f3a9b2c4e1d8f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2',
    meta: 'Prediction: Diabetes 72% · Patient: anon_4f8e2d',
    time: '2.3s ago',
  },
  {
    id: 'BLOCK #18,492,333',
    verified: true,
    hash: '0x3c7e0f2a5b8d1e4f7a0b3c6d9e2f5a8b1c4d7e0f3a6b9c2d5e8f1a4b7c0d3e6',
    meta: 'Hospital Rec: AIIMS Delhi (96.2% match)',
    time: '8.1s ago',
  },
  {
    id: 'BLOCK #18,492,332',
    verified: false,
    hash: 'computing… 0x1a4d7f0c3e6b9d2f5a8c…',
    meta: 'Patient biomarker upload · Validating consent SC-0x4f2b…',
    time: 'now',
  },
]

export default function Blockchain() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [activeBlock, setActiveBlock] = useState(-1)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          blocks.forEach((_, i) => {
            setTimeout(() => setActiveBlock(i), 400 + i * 300)
          })
          observer.unobserve(entries[0].target)
        }
      },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      className={`blockchain-section ${visible ? 'section-visible' : ''}`}
      id="blockchain"
      ref={ref}
    >
      <div className="container blockchain-grid">
        <div>
          <div className="section-eyebrow">Verification Layer</div>
          <h2 className="section-title">
            Every Record,<br />
            <span className="highlight">Immutably Verified</span>
          </h2>
          <p className="section-sub">
            Hyperledger Fabric anchors prediction logs, hospital credentials, and patient records —
            creating a tamper-proof healthcare audit chain.
          </p>
          <div className="chain-features-list">
            {chainFeatures.map((f, i) => (
              <div className="chain-feature" key={i} style={{ animationDelay: `${i * 100}ms` }}>
                <div className="chain-feature-icon">{f.icon}</div>
                <div>
                  <h5>{f.title}</h5>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chain-visual">
          <div className="chain-visual-header">
            <div className="chain-block-label">HYPERLEDGER FABRIC · LIVE CHAIN</div>
            <div className="chain-live-indicator">
              <span className="chain-live-dot" />
              LIVE
            </div>
          </div>

          {blocks.map((b, i) => (
            <div key={i}>
              <div
                className={`chain-block ${b.verified ? 'verified' : 'pending'} ${i <= activeBlock ? 'block-revealed' : ''}`}
              >
                <div className="chain-block-top">
                  <span className="block-id">{b.id}</span>
                  <span className={`block-status ${b.verified ? '' : 'pending-status'}`}>
                    {b.verified ? '✓ VERIFIED' : '⚙ PENDING'}
                  </span>
                </div>
                <div className="block-hash">{b.hash}</div>
                <div className="block-meta-row">
                  <span className="block-meta">{b.meta}</span>
                  <span className="block-time">{b.time}</span>
                </div>
              </div>
              {i < blocks.length - 1 && (
                <div className="chain-arrow">
                  <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
                    <path d="M8 0v20M2 14l6 6 6-6" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}

          <div className="chain-status">
            <div className="chain-status-left">
              <span className="status-live">● NETWORK HEALTHY</span>
              <span className="status-peers">3 PEERS · 12 ORDERERS</span>
            </div>
            <div className="chain-throughput">
              <span className="throughput-label">Throughput</span>
              <span className="throughput-val">1,247 tx/s</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}