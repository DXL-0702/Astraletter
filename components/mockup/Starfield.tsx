"use client"

import { useMemo } from "react"

function mulberry32(a: number) {
  let s = a
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), s | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rnd = mulberry32(177)

const STARS = Array.from({ length: 140 }, (_, i) => {
  const colorRoll = rnd()
  let color = "var(--ink)"
  if (colorRoll > 0.88) color = "var(--accent)"
  else if (colorRoll > 0.74) color = "var(--magic)"
  else if (colorRoll > 0.66) color = "var(--primary)"

  return {
    id: i,
    left: rnd() * 100,
    top: rnd() * 100,
    size: rnd() * 2.2 + 0.8,
    opacity: rnd() * 0.55 + 0.25,
    delay: rnd() * 5,
    duration: 3 + rnd() * 4,
    color,
  }
})

const NEBULAE = [
  { left: "18%", top: "22%", size: "36vw", color: "oklch(0.22 0.10 270 / 0.22)" },
  { left: "72%", top: "68%", size: "30vw", color: "oklch(0.20 0.08 120 / 0.14)" },
  { left: "55%", top: "35%", size: "24vw", color: "oklch(0.18 0.06 300 / 0.12)" },
]

export default function Starfield({
  fixed = true,
  className = "",
}: {
  fixed?: boolean
  className?: string
}) {
  const stars = useMemo(() => STARS, [])

  return (
    <div className={`starfield ${fixed ? "fixed" : "absolute"} ${className}`} aria-hidden="true">
      {/* Soft nebula clouds */}
      {NEBULAE.map((neb, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            left: neb.left,
            top: neb.top,
            width: neb.size,
            height: neb.size,
            background: `radial-gradient(circle, ${neb.color} 0%, transparent 70%)`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            backgroundColor: star.color,
            boxShadow: `0 0 ${star.size * 2}px ${star.color}`,
            opacity: star.opacity,
            ["--star-opacity" as string]: star.opacity,
            animation: `twinkle ${star.duration}s ${star.delay}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* Central galaxy glow placeholder */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          width: "60vmin",
          height: "60vmin",
          background: "radial-gradient(circle, oklch(0.15 0.04 260 / 0.35) 0%, transparent 65%)",
        }}
      />
    </div>
  )
}
