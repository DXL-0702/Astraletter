"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Canvas } from "@react-three/fiber"
import { Sparkles as Sparkles3D, Stars, Stats } from "@react-three/drei"
import { Sparkles as SparklesIcon } from "lucide-react"
import * as THREE from "three"
import StarField3D from "./StarField3D"
import ConstellationLines from "./ConstellationLines"
import UniversePanels from "./UniversePanels"
import StarDetail from "./StarDetail"
import FlyController from "./FlyController"
import { Slider } from "@/components/ui/slider"
import { useUniverse } from "@/lib/universe/store"
import type { Star } from "@/lib/universe/types"

const NEBULA_BG = {
  background:
    "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.10 0.04 260 / 0.55), transparent 70%)," +
    "linear-gradient(180deg, #06070d 0%, #05060b 100%)",
}

export default function UniverseView() {
  const { universe, messages } = useUniverse()
  const [selected, setSelected] = useState<Star | null>(null)
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [uiHidden, setUiHidden] = useState(false)
  const [speedDisplay, setSpeedDisplay] = useState(5)

  const pointsRef = useRef<THREE.Points | null>(null)
  const speedRef = useRef(5)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => {
      setReducedMotion(mq.matches)
      if (mq.matches) {
        speedRef.current = 0
        setSpeedDisplay(0)
      }
    }
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  // H 隐藏界面 / Esc 取消选中
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return // 在输入控件内打字时不触发快捷键
      }
      if (e.key === "h" || e.key === "H") setUiHidden((v) => !v)
      if (e.key === "Escape") setSelected(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const setSpeed = (v: number) => {
    speedRef.current = v
    setSpeedDisplay(v)
  }

  if (!universe) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <SparklesIcon className="h-8 w-8 text-starlight" />
        <h1 className="cosmos-text font-display text-2xl text-foreground">星宇尚未生成</h1>
        <p className="cosmos-text max-w-sm text-sm text-muted-foreground">
          请先导入一段聊天记录，生成属于你们的星宇。
        </p>
        <Link href="/" className="btn btn-accent mt-2">
          去导入
        </Link>
      </main>
    )
  }

  const selectedMessage = selected ? messages.find((m) => m.id === selected.messageId) ?? null : null

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#05060b]">
      <div className="pointer-events-none absolute inset-0" style={NEBULA_BG} aria-hidden />

      <Canvas
        camera={{ position: [0, 55, 170], fov: 60, near: 0.1, far: 1200 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Stars radius={350} depth={120} count={5000} factor={5} saturation={0} fade speed={reducedMotion ? 0 : 0.4} />
        <Sparkles3D count={60} scale={[200, 120, 200]} size={3} speed={reducedMotion ? 0 : 0.2} opacity={0.45} color="#bcd0ff" />
        <StarField3D ref={pointsRef} stars={universe.stars} selectedId={selected?.id ?? null} />
        <ConstellationLines stars={universe.stars} />
        <FlyController
          pointsRef={pointsRef}
          stars={universe.stars}
          speedRef={speedRef}
          onSpeedChange={setSpeed}
          onSelect={(s) => {
            setSelected(s)
            if (s) setSelectedCluster(s.clusterId)
          }}
        />
        {process.env.NODE_ENV === "development" && <Stats />}
      </Canvas>

      {/* 中心目镜十字线（转向参考，常驻） */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-canvas-label h-24 w-24 -translate-x-1/2 -translate-y-1/2 opacity-25">
        <div className="reticle" />
        <div className="absolute inset-0 m-auto h-1 w-1 rounded-full bg-starlight shadow-glow" />
      </div>
      <div className="grain" />

      {/* 隐藏/显示切换（常驻） */}
      <button
        onClick={() => setUiHidden((v) => !v)}
        className="absolute right-4 top-4 z-tooltip rounded-md border border-border bg-surface/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
      >
        {uiHidden ? "显示 · H" : "隐藏界面 · H"}
      </button>

      {!uiHidden && (
        <>
          <UniversePanels
            universe={universe}
            selectedCluster={selectedCluster}
            onSelectStar={(s) => setSelected(s)}
            onSelectCluster={(id) => setSelectedCluster(id)}
          />
          <StarDetail star={selected} message={selectedMessage} onClose={() => setSelected(null)} />

          {/* 速度控制 + 操作提示（底部居中） */}
          <div className="absolute bottom-4 left-1/2 z-panel w-[min(92vw,420px)] -translate-x-1/2">
            <div className="panel flex items-center gap-3 px-4 py-2.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                速度
              </span>
              <Slider
                value={[speedDisplay]}
                min={0}
                max={70}
                step={1}
                onValueChange={(v) => setSpeed(v[0])}
                className="flex-1"
              />
              <span className="w-20 text-right font-mono text-[10px] text-starlight">
                {(speedDisplay / 5).toFixed(2)}× · {speedDisplay} u/s
              </span>
            </div>
            <p className="mt-1.5 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80">
              拖拽转向 · 滚轮/滑块调速 · 点星看消息
            </p>
          </div>
        </>
      )}
    </div>
  )
}
