"use client"

const blob = (l: number, c: number, h: number, a: number) =>
  `radial-gradient(circle, oklch(${l} ${c} ${h} / ${a}) 0%, transparent 62%)`

/**
 * 深空画布：常量深青/靛色多层星云 + screen 混合 + 缓慢漂移。
 * 作为冷调背景，让暖色主星与冷色星座线都跳出来。reduced-motion 下静止。
 */
export default function NebulaBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="neb-blob neb-blob-a" style={{ background: blob(0.4, 0.12, 200, 0.5) }} />
      <div className="neb-blob neb-blob-b" style={{ background: blob(0.34, 0.1, 235, 0.34) }} />
      <div className="neb-blob neb-blob-c" style={{ background: blob(0.3, 0.09, 178, 0.26) }} />
    </div>
  )
}
