"use client"

import { useEffect, useState } from "react"
import Galaxy from "./Galaxy"

const STOPS: Array<[number, number]> = [
  [0, 240],
  [0.34, 250],
  [0.67, 70],
  [1, 330],
]

function hueFor(progress: number): number {
  const p = Math.min(1, Math.max(0, progress))
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [p0, h0] = STOPS[i]
    const [p1, h1] = STOPS[i + 1]
    if (p >= p0 && p <= p1) {
      const t = (p - p0) / (p1 - p0 || 1)
      return Math.round(h0 + (h1 - h0) * t)
    }
  }
  return STOPS[STOPS.length - 1][1]
}

export default function EmotionGalaxy({ className = "" }: { className?: string }) {
  const [hueShift, setHueShift] = useState(240)

  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight
      const progress = max > 0 ? window.scrollY / max : 0
      setHueShift(hueFor(progress))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return (
    <Galaxy
      className={className}
      transparent
      hueShift={hueShift}
      saturation={0.5}
      glowIntensity={0.5}
      density={1.15}
      twinkleIntensity={0.35}
      rotationSpeed={0.03}
      starSpeed={0.3}
    />
  )
}
