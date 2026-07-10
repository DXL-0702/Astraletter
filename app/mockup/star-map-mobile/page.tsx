import Galaxy from "@/components/mockup/Galaxy"
import StarBorder from "@/components/rb/StarBorder"
import SpotlightCard from "@/components/rb/SpotlightCard"
import {
  Sparkles,
  Menu,
  Play,
  Telescope,
  Star,
} from "lucide-react"

export default function StarMapMobileMockup() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-6">
      {/* Phone frame */}
      <div className="relative h-[82vh] w-full max-w-[380px] overflow-hidden rounded-[2.5rem] border-[6px] border-surface-elevated bg-background shadow-float">
        <Galaxy
          className="absolute inset-0"
          transparent
          hueShift={250}
          saturation={0.5}
          glowIntensity={0.45}
          density={1}
          twinkleIntensity={0.3}
          rotationSpeed={0.02}
          starSpeed={0.25}
        />

        {/* Top bar */}
        <header className="absolute left-0 right-0 top-0 z-ui flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-starlight" />
            <span className="font-display text-sm font-semibold uppercase tracking-[0.25em]">Astraletter</span>
          </div>
          <button aria-label="菜单" className="btn btn-ghost p-1.5">
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Constellation label */}
        <div className="absolute left-1/2 top-[36%] z-canvas-label -translate-x-1/2">
          <div className="rounded-full bg-starlight px-3 py-1 text-xs font-medium text-background shadow-glow">
            深夜食堂
          </div>
        </div>

        {/* Center reticle */}
        <div className="pointer-events-none absolute left-1/2 top-[50%] z-canvas-label h-24 w-24 -translate-x-1/2 -translate-y-1/2">
          <div className="reticle" />
          <div className="absolute inset-0 m-auto h-1.5 w-1.5 rounded-full bg-starlight shadow-glow" />
        </div>

        {/* Flight FAB */}
        <div className="absolute bottom-[44%] right-4 z-panel">
          <StarBorder as="button" className="star-cta !rounded-full" color="oklch(0.80 0.16 80)" speed="5s">
            <Play className="h-5 w-5" />
          </StarBorder>
        </div>

        {/* Bottom sheet */}
        <div className="absolute bottom-0 left-0 right-0 z-panel p-3">
          <SpotlightCard className="rounded-t-2xl" spotlightColor="oklch(0.80 0.16 80 / 0.18)">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                2024.05.20 · 22:17
              </span>
              <span className="flex items-center gap-1 rounded-full bg-surface-highlight px-2 py-0.5 text-[10px] text-starlight">
                <Star className="h-3 w-3" />
                情感权重 · 高
              </span>
            </div>

            <p className="mb-3 text-sm leading-relaxed text-foreground">
              “今天路过那家店，突然想起我们第一次约会也是坐在这个位置。”
            </p>

            <div className="rounded-md border border-dashed border-border bg-surface/60 p-3">
              <div className="mb-1 flex items-center gap-2">
                <Telescope className="h-4 w-4 text-magic" />
                <span className="text-xs font-medium text-magic">星语翻译</span>
              </div>
              <p className="font-display text-xs leading-relaxed text-muted-foreground">
                “旧地重游的星光，把一次普通的路过变成了想念的坐标。”
              </p>
            </div>

            <div className="mt-3 flex gap-2">
              <button className="btn btn-primary flex-1 text-sm">查看当天</button>
              <button className="btn btn-secondary flex-1 text-sm">星座详情</button>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  )
}
