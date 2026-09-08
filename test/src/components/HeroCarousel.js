'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const slides = [
  {
    image: '/images/slide-ai-healthcare.png',
    eyebrow: 'AI-Powered Diagnostics',
    title: ['Predict Disease Risk', 'With Neural Precision'],
    subtitle: 'Our deep learning models analyze 50+ biomarkers simultaneously, delivering explainable risk scores across 15 disease categories with 98.3% accuracy.',
    stats: [
      { value: '98.3%', label: 'Accuracy' },
      { value: '15+', label: 'Diseases' },
      { value: '<2s', label: 'Analysis' },
    ],
    accentColor: 'var(--cyan)',
    gradientAngle: '135deg',
  },
  {
    image: '/images/slide-blockchain.png',
    eyebrow: 'Blockchain Verified',
    title: ['Immutable Records,', 'Absolute Trust'],
    subtitle: 'Every prediction, every hospital credential, and every patient interaction is cryptographically anchored on Hyperledger Fabric — zero data breaches, forever.',
    stats: [
      { value: '0', label: 'Breaches' },
      { value: '18M+', label: 'Blocks' },
      { value: '256-bit', label: 'Encryption' },
    ],
    accentColor: 'var(--green)',
    gradientAngle: '225deg',
  },
  {
    image: '/images/slide-hospital.png',
    eyebrow: 'Smart Hospital Matching',
    title: ['Find the Best Care,', 'Anywhere in India'],
    subtitle: 'AI-ranked hospital recommendations match your specific disease profile to the highest-rated, most specialized facilities across 2,400+ verified institutions.',
    stats: [
      { value: '2400+', label: 'Hospitals' },
      { value: '96%', label: 'Match Rate' },
      { value: '24/7', label: 'Available' },
    ],
    accentColor: 'var(--amber)',
    gradientAngle: '315deg',
  },
]

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 11) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  animationDelay: `${(i % 10) * 0.45}s`,
  animationDuration: `${3 + (i % 5) * 0.7}s`,
  width: `${2 + (i % 3)}px`,
  height: `${2 + (i % 3)}px`,
}))

export default function HeroCarousel() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [direction, setDirection] = useState(1)
  const DURATION = 6000

  const goTo = useCallback((index, dir = 1) => {
    if (isTransitioning) return
    setDirection(dir)
    setIsTransitioning(true)
    setProgress(0)
    setTimeout(() => {
      setCurrent(index)
      setIsTransitioning(false)
    }, 600)
  }, [isTransitioning])

  const goNext = useCallback(() => {
    goTo((current + 1) % slides.length, 1)
  }, [current, goTo])

  const goPrev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length, -1)
  }, [current, goTo])

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          goNext()
          return 0
        }
        return p + (100 / (DURATION / 50))
      })
    }, 50)

    return () => clearInterval(interval)
  }, [goNext])

  const slide = slides[current]

  return (
    <section className="hero-carousel" id="hero-carousel">
      {slides.map((s, i) => (
        <div
          key={i}
          className={`carousel-bg ${i === current ? 'active' : ''} ${isTransitioning && i === current ? 'exiting' : ''}`}
          style={{ backgroundImage: `url(${s.image})` }}
        />
      ))}

      <div className="carousel-overlay" />

      <div className="carousel-particles">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="carousel-particle"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.animationDelay,
              animationDuration: particle.animationDuration,
              width: particle.width,
              height: particle.height,
            }}
          />
        ))}
      </div>

      <div className={`carousel-content ${isTransitioning ? 'transitioning' : ''}`}>
        <div className="carousel-content-inner">
          <div className="carousel-text-side">
            <div className="carousel-eyebrow">
              <span className="carousel-eyebrow-line" />
              <span className="carousel-eyebrow-dot" style={{ background: slide.accentColor }} />
              {slide.eyebrow}
            </div>

            <h1 className="carousel-title">
              {slide.title.map((line, i) => (
                <span key={i} className="carousel-title-line">
                  {i === 0 ? <span className="carousel-title-highlight">{line}</span> : line}
                </span>
              ))}
            </h1>

            <p className="carousel-subtitle">{slide.subtitle}</p>

            <div className="carousel-stats-row">
              {slide.stats.map((stat, i) => (
                <div key={i} className="carousel-stat">
                  <div className="carousel-stat-value" style={{ color: slide.accentColor }}>
                    {stat.value}
                  </div>
                  <div className="carousel-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="carousel-actions">
              <button className="btn-carousel-primary" onClick={() => router.push('/login')}>
                Get Started Free
                <span className="btn-arrow">→</span>
              </button>
              <button className="btn-carousel-ghost" onClick={() => document.getElementById('how')?.scrollIntoView()}>
                <span className="btn-play-icon">▶</span>
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="carousel-nav">
        <button className="carousel-arrow carousel-arrow-prev" onClick={goPrev} aria-label="Previous slide">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="carousel-indicators">
          {slides.map((s, i) => (
            <button
              key={i}
              className={`carousel-indicator ${i === current ? 'active' : ''}`}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              aria-label={`Go to slide ${i + 1}`}
            >
              <div
                className="carousel-indicator-fill"
                style={{
                  width: i === current ? `${progress}%` : i < current ? '100%' : '0%',
                  background: slide.accentColor,
                }}
              />
            </button>
          ))}
        </div>

        <button className="carousel-arrow carousel-arrow-next" onClick={goNext} aria-label="Next slide">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="carousel-counter">
        <span className="carousel-counter-current">{String(current + 1).padStart(2, '0')}</span>
        <span className="carousel-counter-sep">/</span>
        <span className="carousel-counter-total">{String(slides.length).padStart(2, '0')}</span>
      </div>

      <div className="carousel-scroll-hint">
        <div className="scroll-mouse">
          <div className="scroll-wheel" />
        </div>
        <span>Scroll to explore</span>
      </div>
    </section>
  )
}
