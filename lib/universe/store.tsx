"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import type { ChatMessage } from "@/lib/parsers/types"
import type { UniverseData } from "./types"

export type AIStatus = "idle" | "loading" | "ready" | "error"

interface UniverseContextValue {
  universe: UniverseData | null
  messages: ChatMessage[]
  aiStatus: AIStatus
  setUniverse: (universe: UniverseData, messages: ChatMessage[]) => void
  /** 原地替换 universe（AI 增强回填用），保留 messages。 */
  replaceUniverse: (universe: UniverseData) => void
  setAIStatus: (status: AIStatus) => void
  clear: () => void
}

const UniverseContext = createContext<UniverseContextValue | null>(null)

/**
 * 跨路由星宇状态（仅内存，隐私友好）。
 * `/` 导入成功后 setUniverse + 跳转；`/star-universe` 消费；刷新需重导（v0.1 取舍）。
 */
export function UniverseProvider({ children }: { children: ReactNode }) {
  const [universe, setU] = useState<UniverseData | null>(null)
  const [messages, setM] = useState<ChatMessage[]>([])
  const [aiStatus, setAIStatus] = useState<AIStatus>("idle")

  const setUniverse = useCallback((u: UniverseData, m: ChatMessage[]) => {
    setU(u)
    setM(m)
  }, [])

  const replaceUniverse = useCallback((u: UniverseData) => {
    setU(u)
  }, [])

  const clear = useCallback(() => {
    setU(null)
    setM([])
    setAIStatus("idle")
  }, [])

  const value = useMemo<UniverseContextValue>(
    () => ({ universe, messages, aiStatus, setUniverse, replaceUniverse, setAIStatus, clear }),
    [universe, messages, aiStatus, setUniverse, replaceUniverse, clear]
  )

  return <UniverseContext.Provider value={value}>{children}</UniverseContext.Provider>
}

export function useUniverse() {
  const ctx = useContext(UniverseContext)
  if (!ctx) throw new Error("useUniverse 必须在 <UniverseProvider> 内使用")
  return ctx
}
