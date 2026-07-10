"use client"

import { HelpCircle, Lock, MessageSquare, Smartphone } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STEPS = [
  {
    icon: MessageSquare,
    title: "微信",
    steps: [
      "在电脑端登录微信，打开与对方的聊天窗口",
      "右上角「…」→「聊天记录」（或「迁移与备份」）",
      "导出为 TXT 文本后保存到本地",
    ],
  },
  {
    icon: Smartphone,
    title: "WhatsApp",
    steps: [
      "打开对话 → 右上角菜单 →「更多」→「导出聊天」",
      "选择「不含媒体」",
      "保存为 TXT 文件",
    ],
  },
]

/** 渐进式帮助（Jordan）：如何导出 TXT + 本地隐私承诺。 */
export default function HowToExport({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-starlight" /> 如何导出聊天记录
          </DialogTitle>
          <DialogDescription>导出 TXT 文本后，再拖入上方的导入区。</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-lg border border-border bg-surface/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <s.icon className="h-4 w-4 text-starlight" />
                <span className="font-display text-sm text-foreground">{s.title}</span>
              </div>
              <ol className="ml-4 list-decimal space-y-1 text-sm text-muted-foreground">
                {s.steps.map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface/40 p-3 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5 shrink-0 text-success" />
          导出与解析全程在你的设备本地完成，原始聊天记录永不上传。
        </div>
      </DialogContent>
    </Dialog>
  )
}
