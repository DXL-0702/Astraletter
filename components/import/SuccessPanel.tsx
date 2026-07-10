"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, RotateCcw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SpotlightCard from "@/components/rb/SpotlightCard"
import CountUp from "@/components/rb/CountUp"
import type { ImportFlow } from "@/hooks/useImportFlow"
import type { ChatSource } from "@/lib/parsers/types"
import { formatBytes, formatTimeSpan } from "@/lib/parsers/format"
import { generateUniverse } from "@/lib/universe/generate"
import { useUniverse } from "@/lib/universe/store"

const SOURCE_LABEL: Record<ChatSource, string> = {
  wechat: "微信",
  whatsapp: "WhatsApp",
  plaintext: "纯文本",
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface/50 p-3 text-center">
      <div className="font-display text-2xl text-foreground">{children}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

export default function SuccessPanel({ flow }: { flow: ImportFlow }) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const router = useRouter()
  const { setUniverse } = useUniverse()

  // 焦点管理：hooks 必须在任何 early return 之前
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  if (flow.phase.kind !== "success") return null
  const { meta, messages } = flow.phase.result
  const showBytes = meta.fileSize > 0

  // 生成星宇（确定性，立即）→ 写入 provider → 跳转。AI 增强在星宇页后台进行（M2）。
  const handleGenerate = () => {
    setUniverse(generateUniverse(messages), messages)
    router.push("/star-universe")
  }

  return (
    <div className="panel-elevated glow-success relative flex flex-col gap-6 px-6 py-8">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-6 w-6 text-success" />
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="cosmos-text font-display text-xl text-foreground outline-none"
        >
          解析完成
        </h3>
        <Badge variant="magic" className="ml-auto">
          {SOURCE_LABEL[meta.source]}
        </Badge>
      </div>

      {/* 真实统计 */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label="消息总数">
          <CountUp to={meta.messageCount} duration={1.2} separator="," />
        </Stat>
        <Stat label="参与者">{meta.participants.length || "—"}</Stat>
        <Stat label="时间跨度">
          {meta.hasTimestamps ? formatTimeSpan(meta.startISO, meta.endISO) : "未知"}
        </Stat>
      </div>

      {meta.participants.length > 0 && (
        <p className="text-sm text-muted-foreground">
          识别到 {meta.participants.length} 位参与者：
          {meta.participants.slice(0, 4).join("、")}
          {meta.participants.length > 4 ? " 等" : ""}
        </p>
      )}

      {/* 星语预览（兑现 critique P2：让产物可见） */}
      <div className="space-y-2">
        <p className="cosmos-text text-xs uppercase tracking-widest text-muted-foreground">
          星语预览
        </p>
        {meta.sample.map((m) => (
          <SpotlightCard key={m.id} className="rounded-lg">
            <div className="rounded-lg border border-border bg-surface/60 p-3">
              {m.sender && <div className="mb-0.5 text-xs font-medium text-starlight">{m.sender}</div>}
              <p className="line-clamp-2 text-sm text-foreground/90">{m.text}</p>
            </div>
          </SpotlightCard>
        ))}
      </div>

      {/* 行动：生成星宇（立即） + 次级重选 */}
      <div className="flex flex-col gap-3 pt-1 sm:flex-row">
        <Button variant="starlight" className="sm:flex-1" onClick={handleGenerate}>
          <Sparkles className="h-4 w-4" /> 生成星宇
        </Button>
        <Button variant="secondary" onClick={() => flow.reset()}>
          <RotateCcw className="h-4 w-4" /> 重新选择
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        在本地生成星宇 · {meta.messageCount} 条消息化作星辰
        {showBytes ? `（${formatBytes(meta.fileSize)}）` : ""}
      </p>
    </div>
  )
}
