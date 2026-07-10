"use client"

import Link from "next/link"
import { Sparkles, Upload, Clock } from "lucide-react"
import SpotlightCard from "@/components/rb/SpotlightCard"
import CountUp from "@/components/rb/CountUp"
import type { Star, UniverseData } from "@/lib/universe/types"
import { formatTimeSpan } from "@/lib/parsers/format"

interface Props {
  universe: UniverseData
  selectedCluster: number | null
  onSelectStar: (star: Star) => void
  onSelectCluster: (clusterId: number) => void
}

function rgbCss(c: [number, number, number]) {
  return `rgb(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)})`
}

/** 桌面：顶栏 + 左目录 + 底时间轴。点击星座 → 选中其代表星。 */
export default function UniversePanels({
  universe,
  selectedCluster,
  onSelectStar,
  onSelectCluster,
}: Props) {
  const { meta, clusters, stars } = universe

  const focusCluster = (clusterId: number) => {
    onSelectCluster(clusterId)
    const inCluster = stars.filter((s) => s.clusterId === clusterId)
    const rep = inCluster.reduce<Star | null>(
      (best, s) => (!best || s.brightness > best.brightness ? s : best),
      null
    )
    if (rep) onSelectStar(rep)
  }

  return (
    <>
      {/* 顶栏 */}
      <header className="absolute left-0 right-0 top-0 z-ui flex items-center justify-between border-b border-border/50 bg-background/50 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-starlight" />
          <span className="font-display text-sm font-semibold uppercase tracking-[0.25em]">
            Astraletter
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground md:inline">
            星宇 · {meta.startISO ? formatTimeSpan(meta.startISO, meta.endISO) : "时间未知"}
          </span>
        </div>
        <Link href="/" className="btn btn-secondary hidden text-sm sm:inline-flex">
          <Upload className="h-4 w-4" /> 导入新记录
        </Link>
      </header>

      {/* 左目录 */}
      <aside className="absolute bottom-28 left-4 top-16 z-panel hidden w-72 lg:block">
        <SpotlightCard className="flex h-full flex-col">
          <div className="mb-4 border-b border-border/50 pb-3">
            <h2 className="font-display text-lg text-foreground">关系概览</h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {meta.participants.length > 0
                ? `${meta.participants.slice(0, 3).join(" · ")}`
                : "你们的星宇"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-surface-highlight/40 p-3">
              <div className="font-display text-2xl text-foreground">
                <CountUp to={meta.messageCount} duration={1.4} separator="," />
              </div>
              <div className="text-xs text-muted-foreground">消息总数</div>
            </div>
            <div className="rounded-md bg-surface-highlight/40 p-3">
              <div className="font-display text-2xl text-foreground">
                <CountUp to={clusters.length} duration={1.2} />
              </div>
              <div className="text-xs text-muted-foreground">星座</div>
            </div>
          </div>

          <div className="mt-5">
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              星座目录
            </h3>
            <div className="space-y-1 overflow-y-auto">
              {clusters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => focusCluster(c.id)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors ${
                    selectedCluster === c.id ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-white/5"
                  }`}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: rgbCss(c.color) }}
                  />
                  <span className="flex-1 text-sm text-foreground">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.starIds.length}</span>
                </button>
              ))}
            </div>
          </div>
        </SpotlightCard>
      </aside>

      {/* 底部时间轴 */}
      <div className="absolute bottom-4 left-4 right-4 z-panel">
        <div className="panel flex items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <Clock className="h-4 w-4" />
            {meta.startISO ? formatTimeSpan(meta.startISO, meta.endISO) : "—"}
          </div>
          <div className="relative flex-1">
            <div className="river-track" />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {stars.length} 星
          </div>
        </div>
      </div>
    </>
  )
}
