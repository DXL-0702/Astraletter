"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_MIME,
  MAX_FILE_SIZE,
  parseChat,
} from "@/lib/parsers"
import { estimateAggregateHue } from "@/lib/parsers/sentiment"
import { formatBytes } from "@/lib/parsers/format"
import type {
  ChatSource,
  ImportErrorCode,
  ParseFailure,
  ParseSuccess,
} from "@/lib/parsers/types"
import { useFileRead } from "./useFileRead"

const STORAGE_KEY = "astraletter.import.v1"
const NEUTRAL_HUE = 240

export type ImportPhase =
  | { kind: "idle" }
  | { kind: "reading"; filename: string; size: number }
  | { kind: "parsing"; source?: ChatSource }
  | { kind: "success"; result: ParseSuccess }
  | { kind: "error"; failure: ParseFailure }

export interface ImportFlow {
  phase: ImportPhase
  /** 0..1，仅在 reading 阶段有意义 */
  progress: number
  /** Galaxy 背景色相：成功时随情感偏移，其余为中性深空蓝 */
  galaxyHue: number
  ingestFile: (file: File) => Promise<void>
  ingestPaste: (text: string) => void
  retry: () => void
  reset: () => void
  cancel: () => void
}

function fail(code: ImportErrorCode, message: string, detail?: string): ParseFailure {
  return { ok: false, code, message, detail }
}

/** 文件级校验（类型 / 大小 / 空），在触碰 FileReader 之前完成 */
function validateFile(file: File): ParseFailure | null {
  const name = file.name.toLowerCase()
  const extOk = ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))
  const mimeOk = ACCEPTED_MIME.includes(file.type)
  if (!extOk && !mimeOk) {
    return fail("WRONG_TYPE", "只支持 TXT 文本文件", `检测到类型：${file.type || file.name}`)
  }
  if (file.size > MAX_FILE_SIZE) {
    return fail(
      "TOO_LARGE",
      `文件过大（${formatBytes(file.size)}），请控制在 ${formatBytes(MAX_FILE_SIZE)} 以内`
    )
  }
  if (file.size === 0) {
    return fail("EMPTY_FILE", "文件是空的")
  }
  return null
}

export function useImportFlow(): ImportFlow {
  const [phase, setPhase] = useState<ImportPhase>({ kind: "idle" })
  const { read, progress: readProgress, cancel: cancelRead } = useFileRead()
  /** run-id：丢弃取消/重选之后的迟到异步结果 */
  const runId = useRef(0)

  // 挂载时水合已持久化的成功态（仅 meta+sample，绝不持久化原始聊天正文）
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (data?.phase === "success" && data?.result?.meta) {
        setPhase({ kind: "success", result: data.result as ParseSuccess })
      }
    } catch {
      /* 损坏的存储：忽略，回到 idle */
    }
  }, [])

  const persistSuccess = useCallback((result: ParseSuccess) => {
    if (typeof window === "undefined") return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ phase: "success", result }))
    } catch {
      /* 配额或隐私模式：忽略 */
    }
  }, [])

  const galaxyHue = useMemo<number>(() => {
    if (phase.kind === "success") return estimateAggregateHue(phase.result.messages)
    return NEUTRAL_HUE
  }, [phase])

  const ingestFile = useCallback(
    async (file: File) => {
      const id = ++runId.current

      const invalid = validateFile(file)
      if (invalid) {
        setPhase({ kind: "error", failure: invalid })
        return
      }

      setPhase({ kind: "reading", filename: file.name, size: file.size })

      let text: string
      let encoding: "utf-8" | "gbk"
      try {
        ;({ text, encoding } = await read(file))
      } catch (err) {
        if (id !== runId.current) return // 已被取消/重选
        const aborted = err instanceof Error && err.message === "aborted"
        setPhase({
          kind: "error",
          failure: fail("UNREADABLE", aborted ? "已取消读取" : "文件无法读取，请重新选择"),
        })
        return
      }
      if (id !== runId.current) return

      setPhase({ kind: "parsing" })
      // 让出一帧，使 ProcessingPanel 先绘制，再做重正则
      await new Promise<void>((r) => setTimeout(r, 0))
      if (id !== runId.current) return

      const result = parseChat({ text, filename: file.name, size: file.size, encoding })
      if (id !== runId.current) return

      if (result.ok) {
        persistSuccess(result)
        setPhase({ kind: "success", result })
      } else {
        setPhase({ kind: "error", failure: result })
      }
    },
    [read, persistSuccess]
  )

  const ingestPaste = useCallback(
    (text: string) => {
      // 粘贴：无 filename → parseChat 内判 EMPTY_PASTE
      const result = parseChat({ text, size: 0 })
      if (result.ok) {
        persistSuccess(result)
        setPhase({ kind: "success", result })
      } else {
        setPhase({ kind: "error", failure: result })
      }
    },
    [persistSuccess]
  )

  const retry = useCallback(() => {
    runId.current += 1
    setPhase({ kind: "idle" })
  }, [])

  const reset = useCallback(() => {
    runId.current += 1
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(STORAGE_KEY)
      } catch {
        /* noop */
      }
    }
    setPhase({ kind: "idle" })
  }, [])

  const cancel = useCallback(() => {
    runId.current += 1
    cancelRead()
    setPhase({ kind: "idle" })
  }, [cancelRead])

  return {
    phase,
    progress: readProgress,
    galaxyHue,
    ingestFile,
    ingestPaste,
    retry,
    reset,
    cancel,
  }
}
