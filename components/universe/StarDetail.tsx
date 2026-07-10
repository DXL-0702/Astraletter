"use client"

import { Crosshair, X } from "lucide-react"
import SpotlightCard from "@/components/rb/SpotlightCard"
import { Badge } from "@/components/ui/badge"
import type { ChatMessage } from "@/lib/parsers/types"
import type { Star } from "@/lib/universe/types"
import { formatDate } from "@/lib/parsers/format"

const SENT_LABEL: Record<Star["sentiment"], string> = {
  positive: "正向",
  neutral: "中性",
  negative: "负向",
}

function sentVariant(s: Star["sentiment"]): "starlight" | "outline" | "destructive" {
  if (s === "positive") return "starlight"
  if (s === "negative") return "destructive"
  return "outline"
}

const LEGEND: { hue: number; label: string }[] = [
  { hue: 40, label: "正向" },
  { hue: 210, label: "中性" },
  { hue: 345, label: "负向" },
]

interface Props {
  star: Star | null
  message: ChatMessage | null
  onClose: () => void
}

/** 选中星的目镜详情；未选中时显示教学型空态（不再留白）。桌面右侧 + 移动端底部。 */
export default function StarDetail({ star, message, onClose }: Props) {
  const hasSelection = !!(star && message)

  return (
    <>
      {/* 桌面右侧面板（常驻） */}
      <aside className="absolute bottom-28 right-4 top-16 z-panel hidden w-80 md:block">
        <SpotlightCard className="flex h-full flex-col" spotlightColor="oklch(0.65 0.18 270 / 0.18)">
          <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-3">
            <h2 className="font-display text-lg text-foreground">目镜</h2>
            {hasSelection && (
              <span className="rounded-full bg-surface-highlight px-2 py-0.5 font-mono text-[10px] text-starlight">
                {message!.timestamp ? formatDate(message!.timestamp) : "时间未知"}
              </span>
            )}
          </div>

          {hasSelection ? (
            <SelectedBody star={star!} message={message!} onClose={onClose} />
          ) : (
            <EmptyBody />
          )}
        </SpotlightCard>
      </aside>

      {/* 移动端底部卡片（仅选中时） */}
      {hasSelection && (
        <div className="absolute bottom-3 left-3 right-3 z-panel md:hidden">
          <SpotlightCard className="rounded-t-2xl">
            <div className="rounded-t-2xl border border-border bg-surface/80 p-3 backdrop-blur">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {message!.timestamp ? formatDate(message!.timestamp) : "时间未知"}
                  {message!.sender ? ` · ${message!.sender}` : ""}
                </span>
                <button onClick={onClose} aria-label="关闭" className="text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="line-clamp-3 text-sm leading-relaxed text-foreground">{message!.text}</p>
              <div className="mt-2">
                <Badge variant={sentVariant(star!.sentiment)}>情感 · {SENT_LABEL[star!.sentiment]}</Badge>
              </div>
            </div>
          </SpotlightCard>
        </div>
      )}
    </>
  )
}

function SelectedBody({
  star,
  message,
  onClose,
}: {
  star: Star
  message: ChatMessage
  onClose: () => void
}) {
  return (
    <>
      <button
        onClick={onClose}
        className="absolute right-3 top-12 text-muted-foreground transition-colors hover:text-foreground md:top-14"
        aria-label="取消选中"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="rounded-lg bg-surface-highlight/40 p-3">
        {message.sender && (
          <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {message.sender}
          </div>
        )}
        <p className="line-clamp-6 text-sm leading-relaxed text-foreground">{message.text}</p>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant={sentVariant(star.sentiment)}>情感 · {SENT_LABEL[star.sentiment]}</Badge>
        <span>权重 {Math.round(star.brightness * 100)}</span>
      </div>

      <div className="mt-auto rounded-md border border-dashed border-border bg-surface/60 p-3">
        <div className="mb-1 text-xs font-medium text-magic">星语翻译</div>
        <p className="font-display text-sm leading-relaxed text-muted-foreground">
          （即将开放 · Phase 2）
        </p>
      </div>
    </>
  )
}

/** 教学型空态：告诉用户怎么用，并解释星色含义。 */
function EmptyBody() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-starlight">
        <Crosshair className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <p className="font-display text-base text-foreground">点击一颗星</p>
        <p className="text-xs text-muted-foreground">读取那一刻的对话</p>
      </div>
      <div className="mt-2 w-full space-y-1.5 border-t border-border/50 pt-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">星色 · 情感</p>
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: `hsl(${l.hue} 70% 62%)`, boxShadow: `0 0 8px hsl(${l.hue} 70% 62%)` }}
            />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  )
}
