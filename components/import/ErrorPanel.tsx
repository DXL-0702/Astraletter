"use client"

import { useEffect, useRef } from "react"
import { AlertTriangle, RotateCcw, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ImportFlow } from "@/hooks/useImportFlow"
import type { ImportErrorCode } from "@/lib/parsers/types"

/** 按 code 给出具体可操作的恢复建议（错误恢复） */
const HINT: Partial<Record<ImportErrorCode, string>> = {
  WRONG_TYPE: "请先把聊天记录导出为 TXT 文本，再拖入导入。",
  TOO_LARGE: "可在原 App 中按时间范围分段导出，单文件控制在 20 MB 内。",
  GARBLED: "用文本编辑器打开，选择「另存为」并将编码设为 UTF-8 后重试。",
  NO_MESSAGES: "确认是微信 / WhatsApp 导出的 TXT，或直接粘贴对话文本。",
  EMPTY_FILE: "文件里没有任何内容。",
  UNREADABLE: "换个文件试试，或重新导出一次。",
}

export default function ErrorPanel({
  flow,
  onHelp,
}: {
  flow: ImportFlow
  onHelp: () => void
}) {
  const headingRef = useRef<HTMLParagraphElement>(null)

  // 焦点管理：hooks 必须在任何 early return 之前
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  if (flow.phase.kind !== "error") return null
  const { failure } = flow.phase
  const hint = HINT[failure.code]

  return (
    <div className="panel-elevated glow-danger relative flex flex-col gap-5 px-6 py-8">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-danger" />
        <p
          ref={headingRef}
          tabIndex={-1}
          className="cosmos-text font-display text-xl text-foreground outline-none"
        >
          无法导入
        </p>
      </div>

      <p className="text-sm text-foreground/90">{failure.message}</p>
      {hint && <p className="text-sm text-muted-foreground">建议：{hint}</p>}
      {failure.detail && (
        <p className="font-mono text-xs text-muted-foreground">{failure.detail}</p>
      )}

      <div className="flex flex-col gap-3 pt-1 sm:flex-row">
        <Button variant="starlight" className="sm:flex-1" onClick={() => flow.retry()}>
          <RotateCcw className="h-4 w-4" /> 重新选择
        </Button>
        <Button variant="secondary" onClick={onHelp}>
          <HelpCircle className="h-4 w-4" /> 查看导出帮助
        </Button>
      </div>
    </div>
  )
}
