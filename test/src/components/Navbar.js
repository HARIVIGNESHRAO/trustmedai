'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero-carousel')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sectionIds = ['hero-carousel', 'features', 'how', 'diseases', 'hospitals', 'blockchain']
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActiveSection(visible.target.id)
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.2, 0.5] }
    )
    sectionIds.forEach((id) => {
      const section = document.getElementById(id)
      if (section) observer.observe(section)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
      <a className="nav-logo" href="#">
        <div className="logo-icon"></div>
        Trust<span>Med</span>AI
      </a>

      <button
        className={`nav-hamburger ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      <ul className={`nav-links ${mobileOpen ? 'mobile-open' : ''}`}>
        {[
          ['#hero-carousel', 'Home'],
          ['#features', 'Features'],
          ['#how', 'How It Works'],
          ['#diseases', 'Diseases'],
          ['#hospitals', 'Hospitals'],
          ['#blockchain', 'Blockchain'],
        ].map(([href, label]) => (
          <li key={href}>
            <a
              href={href}
              className={activeSection === href.slice(1) ? 'active' : ''}
              onClick={() => setMobileOpen(false)}
            >{label}</a>
          </li>
        ))}
      </ul>

      <div className="nav-cta">
        <button className="btn-ghost" onClick={() => router.push('/login')}>Sign In</button>
        <button className="btn-primary" onClick={() => router.push('/login')}>Get Started</button>
      </div>
    </nav>
  )
}
