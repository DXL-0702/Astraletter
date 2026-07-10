"use client"

import { useCallback, useRef, useState } from "react"
import { Upload, ClipboardPaste, HelpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { ImportFlow } from "@/hooks/useImportFlow"

interface Props {
  flow: ImportFlow
  onPaste: () => void
  onHelp: () => void
}

/**
 * 导入面（idle 态）：拖拽 / 点击选文件 / 粘贴文本。
 * - role="button" + 键盘可达（Enter/Space 触发选文件）
 * - 本地 dragActive（enter/leave 计数）→ data-state="dragover" 视觉
 * - 文件级校验与解析交给 flow.ingestFile
 */
export default function Dropzone({ flow, onPaste, onHelp }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)
  const [dragActive, setDragActive] = useState(false)

  const openPicker = useCallback(() => inputRef.current?.click(), [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      dragCounter.current = 0
      setDragActive(false)
      const file = e.dataTransfer.files?.[0]
      if (file) flow.ingestFile(file)
    },
    [flow]
  )
  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current += 1
    setDragActive(true)
  }, [])
  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current -= 1
    if (dragCounter.current <= 0) setDragActive(false)
  }, [])
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        openPicker()
      }
    },
    [openPicker]
  )

  return (
    <div
      className="dropzone relative flex cursor-pointer flex-col items-center justify-center gap-5 px-6 py-12 text-center shadow-float backdrop-blur-xl"
      data-state={dragActive ? "dragover" : "idle"}
      role="button"
      tabIndex={0}
      aria-label="导入聊天记录：拖入或点击选择文件"
      onClick={openPicker}
      onKeyDown={onKeyDown}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
    >
      {/* 目镜十字线（装饰） */}
      <div className="reticle opacity-30" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface text-starlight">
          <Upload className="h-6 w-6" />
        </div>

        <div className="space-y-1">
          <p className="cosmos-text font-display text-xl text-foreground">把聊天记录拖入目镜</p>
          <p className="text-sm text-muted-foreground">
            支持微信 / WhatsApp TXT · 最大 20 MB · 或点击选择文件
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            type="button"
            className="btn btn-accent"
            onClick={(e) => {
              e.stopPropagation()
              openPicker()
            }}
          >
            <Upload className="h-4 w-4" /> 选择文件
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={(e) => {
              e.stopPropagation()
              onPaste()
            }}
          >
            <ClipboardPaste className="h-4 w-4" /> 粘贴文本
          </button>
        </div>

        <button
          type="button"
          className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={(e) => {
            e.stopPropagation()
            onHelp()
          }}
        >
          <HelpCircle className="h-3.5 w-3.5" /> 如何导出聊天记录？
        </button>
      </div>

      <Input
        ref={inputRef}
        type="file"
        accept=".txt,.log,.csv,text/plain"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) flow.ingestFile(file)
          e.target.value = "" // 允许重复选择同一文件
        }}
      />
    </div>
  )
}
