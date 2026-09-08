'use client'
import { useEffect, useRef, useState } from 'react'

export default function StatsBar() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true)
            // Animate counters
            const els = ref.current.querySelectorAll('[data-target]')
            els.forEach((el) => {
              const target = parseInt(el.dataset.target)
              const suffix = el.dataset.suffix || ''
              const duration = 2000
              const startTime = performance.now()
              const animate = (now) => {
                const elapsed = now - startTime
                const progress = Math.min(elapsed / duration, 1)
                const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
                el.textContent = Math.floor(eased * target) + suffix
                if (progress < 1) requestAnimationFrame(animate)
              }
              requestAnimationFrame(animate)
            })
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const stats = [
    { value: '15', suffix: '+', label: 'Disease Models', icon: '🧬' },
    { value: '98.3', suffix: '%', label: 'Prediction Accuracy', icon: '🎯', noAnimate: true },
    { value: '2400', suffix: '+', label: 'Verified Hospitals', icon: '🏥' },
    { value: '0', suffix: '', label: 'Data Breaches', icon: '🔒', noAnimate: true },
  ]

  return (
    <div className={`stats-bar ${visible ? 'stats-visible' : ''}`} ref={ref}>
      <div className="stats-inner">
        {stats.map((s, i) => (
          <div className="stat-item" key={i} style={{ animationDelay: `${i * 100}ms` }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-num" {...(!s.noAnimate ? { 'data-target': s.value, 'data-suffix': s.suffix } : {})}>
              {s.noAnimate ? `${s.value}${s.suffix}` : `0${s.suffix}`}
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}