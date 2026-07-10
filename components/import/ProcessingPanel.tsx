"use client"

import { useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import type { ImportFlow } from "@/hooks/useImportFlow"

/** reading / parsing 共用：决定式进度条（reading）/ 不定式（parsing），Esc 取消（仅 reading）。 */
export default function ProcessingPanel({ flow }: { flow: ImportFlow }) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const phase = flow.phase
  const isReading = phase.kind === "reading"
  const pct = isReading ? Math.round((flow.progress ?? 0) * 100) : 0

  // 进入面板时聚焦标题（屏幕阅读器焦点管理）
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  // Esc 在 reading 阶段取消读取
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && flow.phase.kind === "reading") {
        e.preventDefault()
        flow.cancel()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [flow])

  return (
    <div className="panel-elevated relative flex flex-col items-center justify-center gap-5 px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface text-magic">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>

      <h3
        ref={headingRef}
        tabIndex={-1}
        className="cosmos-text font-display text-xl text-foreground outline-none"
      >
        {isReading ? "正在读取文件…" : "正在解析你们的星宇…"}
      </h3>
      <p className="text-sm text-muted-foreground">
        {isReading
          ? `${pct}% · 所有处理都在你的设备本地完成`
          : "把每一段对话，认作一颗星"}
      </p>

      {/* 进度条：reading 决定式 / parsing 不定式 */}
      <div className="h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-surface-highlight">
        {isReading ? (
          <div
            className="h-full rounded-full bg-magic shadow-glow-magic transition-[width] duration-fast ease-out"
            style={{ width: `${pct}%` }}
          />
        ) : (
          <div className="h-full w-1/3 animate-pulse rounded-full bg-magic" />
        )}
      </div>

      {isReading && (
        <button type="button" className="btn btn-ghost mt-1" onClick={() => flow.cancel()}>
          取消
        </button>
      )}
    </div>
  )
}
