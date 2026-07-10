import Galaxy from "@/components/mockup/Galaxy"
import Dock from "@/components/rb/Dock"
import SpotlightCard from "@/components/rb/SpotlightCard"
import CountUp from "@/components/rb/CountUp"
import StarBorder from "@/components/rb/StarBorder"
import {
  Sparkles,
  Star,
  MessageCircle,
  Clock,
  Play,
  Telescope,
  Upload,
} from "lucide-react"

function ConstellationItem({
  color,
  name,
  count,
  active,
}: {
  color: string
  name: string
  count: number
  active?: boolean
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors ${
        active ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-white/5"
      }`}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="flex-1 text-sm text-foreground">{name}</span>
      <span className="text-xs text-muted-foreground">{count}</span>
    </button>
  )
}

export default function StarMapDesktopMockup() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Galaxy
        className="absolute inset-0"
        transparent
        hueShift={250}
        saturation={0.5}
        glowIntensity={0.5}
        density={1.1}
        twinkleIntensity={0.3}
        rotationSpeed={0.02}
        starSpeed={0.25}
      />
      <div className="grain" />

      {/* Central reticle */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-canvas-label h-40 w-40 -translate-x-1/2 -translate-y-1/2">
        <div className="reticle" />
        <div className="absolute inset-0 m-auto h-1.5 w-1.5 rounded-full bg-starlight shadow-glow" />
      </div>

      {/* Top bar */}
      <header className="absolute left-0 right-0 top-0 z-ui flex items-center justify-between border-b border-border/50 bg-background/50 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-starlight" />
          <span className="font-display font-semibold uppercase tracking-[0.25em]">Astraletter</span>
          <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground md:inline">
            星宇 · 2023.06 — 2024.05
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary hidden text-sm sm:inline-flex">
            <Upload className="h-4 w-4" />
            导入新记录
          </button>
        </div>
      </header>

      {/* Left panel — catalogue */}
      <aside className="absolute bottom-28 left-4 top-16 z-panel w-80">
        <SpotlightCard className="flex h-full flex-col">
          <div className="mb-4 border-b border-border/50 pb-3">
            <h2 className="font-display text-lg text-foreground">关系概览</h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              两座星宇交汇
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-surface-highlight/40 p-3">
              <div className="font-display text-2xl text-foreground">
                <CountUp to={12482} separator="," />
              </div>
              <div className="text-xs text-muted-foreground">消息总数</div>
            </div>
            <div className="rounded-md bg-surface-highlight/40 p-3">
              <div className="font-display text-2xl text-foreground">
                <CountUp to={56} />
              </div>
              <div className="text-xs text-muted-foreground">高光时刻</div>
            </div>
          </div>

          <div className="mt-5">
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">星座目录</h3>
            <div className="space-y-1">
              <ConstellationItem color="oklch(0.75 0.16 80)" name="深夜食堂" count={128} active />
              <ConstellationItem color="oklch(0.65 0.18 270)" name="周末旅行计划" count={86} />
              <ConstellationItem color="oklch(0.62 0.14 120)" name="一起听的歌" count={64} />
              <ConstellationItem color="oklch(0.60 0.14 320)" name="沉默与和解" count={32} />
            </div>
          </div>
        </SpotlightCard>
      </aside>

      {/* Right panel — eyepiece detail */}
      <aside className="absolute bottom-28 right-4 top-16 z-panel w-80">
        <SpotlightCard className="flex h-full flex-col" spotlightColor="oklch(0.65 0.18 270 / 0.18)">
          <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-3">
            <h2 className="font-display text-lg text-foreground">目镜 · 选中星</h2>
            <span className="rounded-full bg-surface-highlight px-2 py-0.5 font-mono text-[10px] text-starlight">
              2024.05.20
            </span>
          </div>

          <StarBorder className="star-ring mb-4 w-full" color="oklch(0.80 0.16 80)">
            <div className="w-full rounded-[inherit] bg-surface-highlight/40 p-3 text-left">
              <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <MessageCircle className="h-3.5 w-3.5" />
                22:17 · 你
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                “今天路过那家店，突然想起我们第一次约会也是坐在这个位置。”
              </p>
            </div>
          </StarBorder>

          <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Star className="h-4 w-4 text-starlight" />
            情感权重：高 · 长度：中
          </div>

          <div className="rounded-md border border-dashed border-border bg-surface/60 p-3">
            <div className="mb-1 flex items-center gap-2">
              <Telescope className="h-4 w-4 text-magic" />
              <span className="text-xs font-medium text-magic">星语翻译</span>
            </div>
            <p className="font-display text-sm leading-relaxed text-muted-foreground">
              “旧地重游的星光，把一次普通的路过变成了想念的坐标。”
            </p>
          </div>
        </SpotlightCard>
      </aside>

      {/* Bottom timeline */}
      <div className="absolute bottom-4 left-4 right-4 z-panel">
        <div className="panel flex items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <Clock className="h-4 w-4" />
            2023.06.01
          </div>
          <div className="relative flex-1">
            <div className="river-track" />
            <div className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-background bg-starlight shadow-glow" />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">2024.05.20</div>
        </div>
      </div>

      {/* Floating Dock toolbar */}
      <div className="absolute bottom-24 left-1/2 z-panel -translate-x-1/2">
        <Dock
          items={[
            { label: "宏观", icon: <Sparkles className="h-5 w-5" /> },
            { label: "飞行", icon: <Play className="h-5 w-5" /> },
            { label: "星语", icon: <Telescope className="h-5 w-5" /> },
            { label: "星座", icon: <Star className="h-5 w-5" /> },
          ]}
        />
      </div>
    </div>
  )
}
