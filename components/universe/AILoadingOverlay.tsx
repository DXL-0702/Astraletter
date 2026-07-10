"use client"

import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"
import type { AIProgress } from "@/lib/ai/types"
import type { AIStatus } from "@/lib/universe/store"

interface Props {
  progress: AIProgress | null
  status: AIStatus
}

/** AI 本地分析的进度浮条：加载/进度/完成/失败。pointer-events-none，不挡轨道操作。 */
export default function AILoadingOverlay({ progress, status }: Props) {
  if (status === "idle") return null
  if (status === "ready" && !progress) return null

  const isError = status === "error"
  const isReady = status === "ready"
  const pct = Math.round((progress?.progress ?? 0) * 100)

  return (
    <div className="pointer-events-none absolute bottom-24 left-1/2 z-panel -translate-x-1/2">
      <div
        className={`panel flex items-center gap-2 px-4 py-2 text-xs ${
          isError ? "text-danger" : isReady ? "text-success" : "text-magic"
        }`}
      >
        {isError ? (
          <AlertTriangle className="h-4 w-4" />
        ) : isReady ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        <span>
          {isError
            ? "AI 分析失败，已用启发式着色"
            : isReady
              ? "AI 分析完成 · 情感与星座已更新"
              : (progress?.message ?? "本地 AI 分析中…")}
        </span>
        {!isError && !isReady && <span className="font-mono">{pct}%</span>}
      </div>
    </div>
  )
}
