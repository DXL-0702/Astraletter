"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Lock, Sparkles, Star, Telescope } from "lucide-react"
import { useImportFlow } from "@/hooks/useImportFlow"
import ImportGalaxy from "./ImportGalaxy"
import Dropzone from "./Dropzone"
import PasteDialog from "./PasteDialog"
import ProcessingPanel from "./ProcessingPanel"
import SuccessPanel from "./SuccessPanel"
import ErrorPanel from "./ErrorPanel"
import HowToExport from "./HowToExport"
import MobileNav from "./MobileNav"

type NavTarget = "how" | "privacy" | "help"

/** 导入页编排器：拥有 useImportFlow，按 phase 切换面板，并驱动 Galaxy 色相。 */
export default function ImportExperience() {
  const flow = useImportFlow()
  const [pasteOpen, setPasteOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const navigate = (target: NavTarget) => {
    if (target === "help") {
      setHelpOpen(true)
      return
    }
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

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
          <span className="font-display text-sm font-semibold uppercase tracking-[0.25em]">
            Astraletter
          </span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          {(
            [
              ["how", "如何生成"],
              ["help", "如何导出"],
              ["privacy", "隐私"],
            ] as const
          ).map(([target, label]) => (
            <button
              key={target}
              onClick={() => navigate(target)}
              className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="sm:hidden">
          <MobileNav onNavigate={navigate} />
        </div>
      </header>

      {/* 主导入区 */}
      <main className="relative z-ui mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-8">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-starlight">
            <Sparkles className="h-3.5 w-3.5" /> 本地 AI · 私密生成 · 无需上传
          </div>
          <h1 className="cosmos-text font-display mb-4 text-balance text-display font-normal leading-[1.1] text-foreground">
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

        {/* 隐私承诺 */}
        <div
          id="privacy"
          className="cosmos-text mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          <Lock className="h-3.5 w-3.5 text-success" />
          <span>原始聊天记录永不上传，解析与生成都在本地完成</span>
        </div>
      </main>

      {/* 压缩补充：光河三步 */}
      <section id="how" className="relative z-ui mx-auto w-full max-w-3xl px-6 pb-12">
        <div className="river-track mb-8" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: <Lock className="h-4 w-4 text-starlight" />,
              title: "本地导入",
              desc: "微信 / WhatsApp TXT 或粘贴文本，数据不出设备。",
            },
            {
              icon: <Telescope className="h-4 w-4 text-magic" />,
              title: "本地解析",
              desc: "消息、参与者、时间跨度，全部在浏览器完成。",
            },
            {
              icon: <Star className="h-4 w-4 text-starlight" />,
              title: "星宇漫游",
              desc: "（即将开放）每条对话化作一颗星，话题聚成星座。",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-lg border border-border bg-surface/40 p-4 backdrop-blur"
            >
              <div className="mb-2 flex items-center gap-2">
                {c.icon}
                <span className="font-display text-sm text-foreground">{c.title}</span>
              </div>
              <p className="text-xs text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="cosmos-text relative z-ui mx-auto w-full max-w-3xl px-6 pb-8 text-center text-xs text-muted-foreground">
        Astraletter · 将私密对话升华为情感艺术品 ·
        <button
          onClick={() => navigate("privacy")}
          className="ml-1 underline-offset-4 hover:text-foreground hover:underline"
        >
          隐私承诺
        </button>
      </footer>

      {/* 弹窗 */}
      <PasteDialog open={pasteOpen} onOpenChange={setPasteOpen} flow={flow} />
      <HowToExport open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  )
}
