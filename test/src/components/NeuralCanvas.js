'use client'
import { useEffect, useRef } from 'react'

export default function NeuralCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let nodes = [], W, H, rafId, mouse = { x: -1000, y: -1000 }

    function resize() {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight * 3
    }

    function initNodes() {
      nodes = Array.from({ length: 80 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 0.5,
        pulse: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.7 ? 270 : 186,
      }))
    }

    function drawECG(t) {
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(0,229,255,0.12)'
      ctx.lineWidth = 1
      const y0 = H * 0.17
      for (let x = 0; x < W; x += 4) {
        const phase = ((x / W) * 6 - t * 0.5) % (Math.PI * 2)
        let y = y0
        if (phase > 0 && phase < 0.15) y = y0 - 60 * Math.sin((phase / 0.15) * Math.PI)
        else if (phase > 0.15 && phase < 0.3) y = y0 + 15 * Math.sin(((phase - 0.15) / 0.15) * Math.PI)
        else y = y0 + Math.sin(phase * 2) * 4
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    function animate(t) {
      ctx.clearRect(0, 0, W, H)

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 160) {
            const alpha = (1 - d / 160) * 0.15
            ctx.beginPath()
            ctx.strokeStyle = `rgba(0,229,255,${alpha})`
            ctx.lineWidth = 0.4
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      nodes.forEach(n => {
        n.pulse += 0.03
        const g = 0.5 + 0.5 * Math.sin(n.pulse)

        // Mouse interaction
        const dx = n.x - mouse.x
        const dy = n.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          const force = (1 - dist / 200) * 0.5
          n.vx += (dx / dist) * force
          n.vy += (dy / dist) * force
        }

        // Glow
        const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4)
        gradient.addColorStop(0, `hsla(${n.hue}, 100%, 60%, ${0.6 + g * 0.4})`)
        gradient.addColorStop(1, `hsla(${n.hue}, 100%, 60%, 0)`)
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r + g * 1, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${n.hue}, 100%, 70%, ${0.5 + g * 0.5})`
        ctx.fill()

        n.x += n.vx
        n.y += n.vy
        n.vx *= 0.99
        n.vy *= 0.99
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
      })

      drawECG(t * 0.001)
      rafId = requestAnimationFrame(animate)
    }

    function onMouseMove(e) {
      mouse.x = e.clientX
      mouse.y = e.clientY + window.scrollY
    }

    resize()
    initNodes()
    rafId = requestAnimationFrame(animate)
    window.addEventListener('resize', () => { resize(); initNodes() })
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.35,
      }}
    />
  )
}