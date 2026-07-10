import type { Sentiment } from "@/lib/parsers/sentiment"

export type { Sentiment }

/** 一颗星 = 一条消息。color 为线性 sRGB 0..1（已含亮度）。 */
export interface Star {
  id: string
  messageId: string
  position: [number, number, number]
  size: number
  color: [number, number, number]
  brightness: number
  clusterId: number
  sentiment: Sentiment
}

/** 星座 = 一个话题/时段聚类。 */
export interface Cluster {
  id: number
  name: string
  color: [number, number, number]
  starIds: string[]
  center: [number, number, number]
}

export interface UniverseMeta {
  messageCount: number
  startISO: string | null
  endISO: string | null
  participants: string[]
  generatedAt: string
}

export interface UniverseData {
  stars: Star[]
  clusters: Cluster[]
  meta: UniverseMeta
}

/** AI 增强结果（M2 注入；缺省时 generate 用启发式）。 */
export interface AIEnhancement {
  sentiments: Record<string, Sentiment> // messageId → sentiment
  /** 嵌入聚类：messageId → clusterId（由嵌入 k-means 得到） */
  clusters: Record<string, number>
}
