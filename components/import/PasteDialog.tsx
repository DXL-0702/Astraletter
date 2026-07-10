"use client"

import { useEffect, useState } from "react"
import { ClipboardPaste } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { ImportFlow } from "@/hooks/useImportFlow"

const DRAFT_KEY = "astraletter.paste-draft.v1"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  flow: ImportFlow
}

/** 粘贴对话文本：受控 textarea，草稿入 sessionStorage（Riley：打断不丢失）。⌘/Ctrl+Enter 提交。 */
export default function PasteDialog({ open, onOpenChange, flow }: Props) {
  const [text, setText] = useState("")
  const [error, setError] = useState<string | null>(null)

  // 打开时恢复草稿
  useEffect(() => {
    if (open && typeof window !== "undefined") {
      try {
        setText(sessionStorage.getItem(DRAFT_KEY) ?? "")
        setError(null)
      } catch {
        /* noop */
      }
    }
  }, [open])

  // 实时持久化草稿
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      if (text) sessionStorage.setItem(DRAFT_KEY, text)
      else sessionStorage.removeItem(DRAFT_KEY)
    } catch {
      /* noop */
    }
  }, [text])

  const submit = () => {
    if (!text.trim()) {
      setError("粘贴的内容是空的")
      return
    }
    setError(null)
    flow.ingestPaste(text)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardPaste className="h-4 w-4 text-starlight" /> 粘贴对话文本
          </DialogTitle>
          <DialogDescription>
            把一段对话粘贴进来。可选「昵称：内容」的格式，每行一条。
          </DialogDescription>
        </DialogHeader>

        <textarea
          className="input min-h-[180px] resize-y font-mono text-sm"
          placeholder={"Alice：在吗\nBob：在的，怎么了\nAlice：今晚的星星很好看"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit()
          }}
          autoFocus
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant="starlight" onClick={submit}>
            解析文本
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
