"use client"

// ⏸ Phase 1.5（暂缓）：本地 AI 增强。M1 阶段未接线（UniverseView 不再调用此 hook），
// 因此 lib/ai/worker.ts 与 @huggingface/transformers 不进入构建。重新启用时：
// 在 UniverseView 调用 useAIEnrich() 并渲染 <AILoadingOverlay/>，并参考 mvp/01-project-init.md。

import { useEffect, useRef, useState } from "react"
import type { ChatMessage } from "@/lib/parsers/types"
import { generateUniverse, sampleStarMessages } from "@/lib/universe/generate"
import { useUniverse } from "@/lib/universe/store"
import type { AIProgress, AIResponse } from "@/lib/ai/types"

/**
 * 星宇生成后，后台 Web Worker（Transformers.js）跑嵌入+情感+聚类，
 * 完成后用 AI 结果重算星图（颜色按情感、星座按话题），平滑替换、不阻塞。
 * 失败则保留启发式星图。每次挂载只跑一次。
 */
export function useAIEnrich() {
  const { universe, messages, replaceUniverse, setAIStatus, aiStatus } = useUniverse()
  const startedRef = useRef(false)
  const [progress, setProgress] = useState<AIProgress | null>(null)

  useEffect(() => {
    if (!universe || messages.length === 0) return
    if (startedRef.current) return
    startedRef.current = true

    setAIStatus("loading")
    const worker = new Worker(new URL("../lib/ai/worker.ts", import.meta.url))

    worker.onmessage = (e: MessageEvent<AIResponse>) => {
      const msg = e.data
      if (msg.type === "progress") {
        setProgress(msg.data)
        if (msg.data.stage === "error") setAIStatus("error")
        else if (msg.data.stage === "done") setAIStatus("ready")
      } else if (msg.type === "result") {
        const enhanced = generateUniverse(messages, {
          sentiments: msg.sentiments,
          clusters: msg.clusters,
        })
        replaceUniverse(enhanced)
        setAIStatus("ready")
        setProgress(null)
        worker.terminate()
      }
    }

    const starMsgs: ChatMessage[] = sampleStarMessages(messages)
    worker.postMessage({
      messages: starMsgs.map((m) => ({ id: m.id, text: m.text })),
    })

    return () => {
      worker.terminate()
    }
  }, [universe, messages, replaceUniverse, setAIStatus])

  return { progress, aiStatus }
}
