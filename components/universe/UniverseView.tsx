"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars, Stats } from "@react-three/drei"
import { Sparkles } from "lucide-react"
import StarField3D from "./StarField3D"
import ConstellationLines from "./ConstellationLines"
import UniversePanels from "./UniversePanels"
import StarDetail from "./StarDetail"
import { useUniverse } from "@/lib/universe/store"
import type { Star } from "@/lib/universe/types"

export default function UniverseView() {
  const { universe, messages } = useUniverse()
  const [selected, setSelected] = useState<Star | null>(null)
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  if (!universe) {
    // 直接访问 / 刷新：provider 为空 → 安全空态（不在 SSR 渲染 Canvas）
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <Sparkles className="h-8 w-8 text-starlight" />
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

  const selectedMessage = selected
    ? messages.find((m) => m.id === selected.messageId) ?? null
    : null

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Canvas
        camera={{ position: [0, 38, 82], fov: 55, near: 0.1, far: 600 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onPointerMissed={() => setSelected(null)}
      >
        <Stars
          radius={200}
          depth={60}
          count={1500}
          factor={3}
          saturation={0}
          fade
          speed={reducedMotion ? 0 : 0.6}
        />
        {process.env.NODE_ENV === "development" && <Stats />}
        <StarField3D
          stars={universe.stars}
          selectedId={selected?.id ?? null}
          onSelect={(s) => {
            setSelected(s)
            setSelectedCluster(s.clusterId)
          }}
        />
        <ConstellationLines stars={universe.stars} />
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          minDistance={15}
          maxDistance={180}
          enablePan={false}
          rotateSpeed={0.6}
          zoomSpeed={0.8}
        />
      </Canvas>
      <div className="grain" />

      <UniversePanels
        universe={universe}
        selectedCluster={selectedCluster}
        onSelectStar={(s) => setSelected(s)}
        onSelectCluster={(id) => setSelectedCluster(id)}
      />
      {selected && selectedMessage && (
        <StarDetail star={selected} message={selectedMessage} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
