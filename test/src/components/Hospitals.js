'use client'
import { useEffect, useRef, useState } from 'react'

const hospitals = [
  {
    rank: '#1',
    badge: 'BEST MATCH',
    name: 'AIIMS New Delhi',
    loc: 'Ansari Nagar, New Delhi',
    rating: '4.9',
    dist: '12 km',
    wait: '3 days',
    match: 96,
    specialties: ['Endocrinology', 'Cardiology', 'Nephrology'],
    color: 'var(--cyan)',
  },
  {
    rank: '#2',
    badge: 'EXCELLENT',
    name: 'Apollo Hospitals',
    loc: 'Indraprastha, Delhi',
    rating: '4.7',
    dist: '8 km',
    wait: '1 day',
    match: 89,
    specialties: ['Oncology', 'Cardiac Surgery', 'Neurology'],
    color: 'var(--green)',
  },
  {
    rank: '#3',
    badge: 'GOOD MATCH',
    name: 'Fortis Healthcare',
    loc: 'Shalimar Bagh, Delhi',
    rating: '4.5',
    dist: '18 km',
    wait: '2 days',
    match: 81,
    specialties: ['Orthopedics', 'Gastro', 'Pulmonology'],
    color: 'var(--amber)',
  },
]

export default function Hospitals() {
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
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      className={`hospital-section ${visible ? 'section-visible' : ''}`}
      id="hospitals"
      ref={ref}
    >
      <div className="container">
        <div className="section-eyebrow">Smart Matching</div>
        <h2 className="section-title">
          Your Ideal Hospital,<br />
          <span className="highlight">Intelligently Found</span>
        </h2>
        <p className="section-sub">
          AI-ranked hospitals based on your disease risk profile, specialization, distance, and
          blockchain-verified quality scores.
        </p>
        <div className="hospital-cards">
          {hospitals.map((h, i) => (
            <div
              className="hosp-card"
              key={i}
              style={{
                '--hosp-color': h.color,
                animationDelay: `${i * 120}ms`,
              }}
            >
              <div className="hosp-card-header">
                <div className="hosp-rank-badge" style={{ background: h.color, color: 'var(--navy)' }}>
                  {h.rank}
                </div>
                <span className="hosp-badge">{h.badge}</span>
              </div>
              <div className="hosp-name">{h.name}</div>
              <div className="hosp-location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--slate)" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {h.loc}
              </div>

              <div className="hosp-specialties">
                {h.specialties.map((s) => (
                  <span className="hosp-specialty-tag" key={s}>{s}</span>
                ))}
              </div>

              <div className="hosp-stats">
                <div className="hosp-stat">
                  <div className="hosp-stat-val">{h.rating}<span className="star">★</span></div>
                  <div className="hosp-stat-key">Rating</div>
                </div>
                <div className="hosp-stat">
                  <div className="hosp-stat-val">{h.dist}</div>
                  <div className="hosp-stat-key">Distance</div>
                </div>
                <div className="hosp-stat">
                  <div className="hosp-stat-val">{h.wait}</div>
                  <div className="hosp-stat-key">Wait Time</div>
                </div>
              </div>

              <div className="hosp-match">
                <span className="match-label">Specialty Fit</span>
                <div className="match-bar">
                  <div
                    className="match-fill"
                    style={{
                      width: visible ? `${h.match}%` : '0%',
                      background: `linear-gradient(90deg, ${h.color}, var(--purple))`,
                    }}
                  />
                </div>
                <span className="match-pct" style={{ color: h.color }}>{h.match}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}