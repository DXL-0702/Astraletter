"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Lock, Shield, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useImportFlow } from "@/hooks/useImportFlow"
import ImportGalaxy from "./ImportGalaxy"
import Dropzone from "./Dropzone"
import PasteDialog from "./PasteDialog"
import ProcessingPanel from "./ProcessingPanel"
import SuccessPanel from "./SuccessPanel"
import ErrorPanel from "./ErrorPanel"
import HowToExport from "./HowToExport"
import MobileNav from "./MobileNav"

type InfoTarget = "how" | "privacy"

const HOW_STEPS: { t: string; d: string }[] = [
  { t: "导入", d: "把微信 / WhatsApp 导出的 TXT 拖入，或粘贴一段对话。" },
  { t: "解析", d: "本地识别消息、参与者与时间跨度，逐条化作星辰。" },
  { t: "漫游", d: "飞行穿行你们的关系星海，点一颗星，读那一刻的对话。" },
]

/** 导入页编排器：拥有 useImportFlow，按 phase 切换面板，并驱动 Galaxy 色相。 */
export default function ImportExperience() {
  const flow = useImportFlow()
  const [pasteOpen, setPasteOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [info, setInfo] = useState<InfoTarget | null>(null)

  // reading / parsing 共用一个面板 key，避免中途不必要的淡入淡出
  const panelKey =
    flow.phase.kind === "reading" || flow.phase.kind === "parsing"
      ? "processing"
      : flow.phase.kind

  const statusCopy = (() => {
    switch (flow.phase.kind) {
      case "reading":
        return "正在读取文件…"
      case "parsing":
        return "正在解析你们的星宇…"
      case "success":
        return `识别到 ${flow.phase.result.meta.messageCount} 条消息`
      case "error":
        return flow.phase.failure.message
      default:
        return ""
    }
  })()

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <ImportGalaxy hue={flow.galaxyHue} />
      <div className="cosmos-scrim" />
      <div className="grain" />

      {/* 顶栏 */}
      <header className="relative z-ui mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-starlight" />
          <span className="font-display text-sm font-normal uppercase tracking-[0.25em]">
            Astraletter
          </span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          {(
            [
              ["how", "如何生成"],
              ["privacy", "隐私"],
            ] as const
          ).map(([target, label]) => (
            <button
              key={target}
              onClick={() => setInfo(target)}
              className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="sm:hidden">
          <MobileNav onNavigate={setInfo} />
        </div>
      </header>

      {/* 主导入区 */}
      <main className="relative z-ui mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-8">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-starlight">
            <Sparkles className="h-3.5 w-3.5" /> 本地 AI · 私密生成 · 无需上传
          </div>
          <h1 className="font-display mb-4 text-balance text-display font-normal leading-[1.15] text-foreground">
            把你们的故事，变成璀璨星空
          </h1>
          <p className="cosmos-text mx-auto max-w-md text-base text-muted-foreground">
            导入聊天记录，让本地 AI 为你们生成一座可漫游、可纪念的关系星宇。
          </p>
        </div>

        {/* 屏幕阅读器实时公告 */}
        <p className="sr-only" aria-live="polite">
          {statusCopy}
        </p>

        {/* 仪器面板（按 phase 切换） */}
        <AnimatePresence mode="wait">
          <motion.div
            key={panelKey}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          >
            {flow.phase.kind === "idle" && (
              <Dropzone
                flow={flow}
                onPaste={() => setPasteOpen(true)}
                onHelp={() => setHelpOpen(true)}
              />
            )}
            {(flow.phase.kind === "reading" || flow.phase.kind === "parsing") && (
              <ProcessingPanel flow={flow} />
            )}
            {flow.phase.kind === "success" && <SuccessPanel flow={flow} />}
            {flow.phase.kind === "error" && (
              <ErrorPanel flow={flow} onHelp={() => setHelpOpen(true)} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* 隐私承诺（一行） */}
        <div className="cosmos-text mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-success" />
          <span>原始聊天记录永不上传，解析与生成都在本地完成</span>
        </div>
      </main>

      <footer className="cosmos-text relative z-ui mx-auto w-full max-w-3xl px-6 pb-8 text-center text-xs text-muted-foreground">
        Astraletter · 将私密对话升华为情感艺术品 ·
        <button
          onClick={() => setInfo("privacy")}
          className="ml-1 underline-offset-4 hover:text-foreground hover:underline"
        >
          隐私承诺
        </button>
      </footer>

      {/* 弹窗：粘贴 / 如何导出 */}
      <PasteDialog open={pasteOpen} onOpenChange={setPasteOpen} flow={flow} />
      <HowToExport open={helpOpen} onOpenChange={setHelpOpen} />

      {/* 叙事 Dialog：如何生成 */}
      <Dialog open={info === "how"} onOpenChange={(o) => !o && setInfo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>如何生成你们的关系星宇</DialogTitle>
            <DialogDescription>三步，全在浏览器本地完成。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {HOW_STEPS.map((s) => (
              <div key={s.t} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-starlight shadow-glow" />
                <div>
                  <div className="font-display text-sm text-foreground">{s.t}</div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="river-track mt-2" />
        </DialogContent>
      </Dialog>

      {/* 叙事 Dialog：隐私 */}
      <Dialog open={info === "privacy"} onOpenChange={(o) => !o && setInfo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-success" /> 隐私承诺
            </DialogTitle>
            <DialogDescription>私密对话只属于你们。</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              原始聊天记录
              <strong className="font-medium text-foreground">永不上传</strong>
              ——所有解析与星宇生成都在你的浏览器本地完成。
            </p>
            <p>导出的 TXT 只在你设备上读取；星宇状态仅存于内存，关闭即清。</p>
            <p>
              未来云端功能（双人授权、跨设备）将仅同步匿名化、加密后的星图结构，且需你明确授权。
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
