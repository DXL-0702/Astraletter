import type { ChatMessage } from "@/lib/parsers/types"
import { classifySentiment, type Sentiment } from "@/lib/parsers/sentiment"
import { formatDate } from "@/lib/parsers/format"
import type { AIEnhancement, Cluster, Star, UniverseData, UniverseMeta } from "./types"

/** 渲染上限：超过则沿时间线均匀采样，保证万级消息也不卡。 */
const MAX_STARS = 3000

/** 银河盘几何（场景单位；放大以便飞行漫游有纵深） */
const INNER_R = 12
const OUTER_R = 120
const THICKNESS = 16
const SPIRAL_TURNS = 3

/** 情感 → HSL hue（对齐 DESIGN.md §6 情感配色）。 */
const HUE: Record<Sentiment, number> = {
  positive: 40, // 琥珀
  neutral: 210, // 深空蓝
  negative: 345, // 玫瑰
}

function mulberry32(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), s | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** h∈[0,1], s,l∈[0,1] → 线性 sRGB [0,1]（与 three.Color.setHSL 一致的约定）。 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h * 12) % 12
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  return [f(0), f(8), f(4)]
}

function sentimentColor(s: Sentiment, brightness: number): [number, number, number] {
  const [r, g, b] = hslToRgb(HUE[s] / 360, 0.62, 0.55)
  return [r * brightness, g * brightness, b * brightness]
}

const CLUSTER_PALETTE = [80, 210, 270, 345, 140, 30, 190, 300, 100, 240]

/** 沿时间线均匀采样，保持时间分布。导出供 AI 层处理同一批星辰。 */
export function sampleStarMessages(messages: ChatMessage[], max = MAX_STARS): ChatMessage[] {
  const real = messages.filter((m) => !m.isSystem && m.text.trim() !== "")
  if (real.length <= max) return real
  const picks: ChatMessage[] = []
  const step = real.length / max
  for (let i = 0; i < max; i++) picks.push(real[Math.floor(i * step)])
  return picks
}

function clusterName(c: number, firstMessage: ChatMessage | undefined): string {
  if (firstMessage?.timestamp) return formatDate(firstMessage.timestamp).slice(0, 7) // "2023.06"
  return `片段 ${c + 1}`
}

/**
 * 纯函数：消息数组 → 星宇数据。种子化 RNG（无 Math.random），可复现、SSR 安全。
 * 位置：时间→银河螺旋角度；大小/亮度：消息长度；颜色：情感 hue。
 * 无 AI：情感用关键词启发式、聚类按时间等量分箱；有 AI：情感/聚类由模型覆盖。
 */
export function generateUniverse(
  messages: ChatMessage[],
  ai?: AIEnhancement
): UniverseData {
  const picks = sampleStarMessages(messages, MAX_STARS)
  const N = picks.length
  const rnd = mulberry32((N * 2654435761) ^ 0x9e3779b9)

  // 按时间排序（无时间戳保持原序），稳定排序
  const order = picks.map((_, i) => i).sort((a, b) => {
    const ta = picks[a].timestamp
    const tb = picks[b].timestamp
    if (ta && tb) return ta < tb ? -1 : ta > tb ? 1 : 0
    return a - b
  })

  const clusterCount = Math.max(1, Math.min(10, Math.ceil(N / 40)))
  const binOf = (rank: number) =>
    Math.min(clusterCount - 1, Math.floor((rank / Math.max(1, N)) * clusterCount))

  const stars: Star[] = []
  order.forEach((pickIdx, rank) => {
    const msg = picks[pickIdx]
    const t = N > 1 ? rank / (N - 1) : 0.5
    const angle = t * SPIRAL_TURNS * Math.PI * 2 + (rnd() - 0.5) * 0.5
    const radius = INNER_R + (OUTER_R - INNER_R) * Math.sqrt(t) + (rnd() - 0.5) * 4
    const x = Math.cos(angle) * radius + (rnd() - 0.5) * 2
    const z = Math.sin(angle) * radius + (rnd() - 0.5) * 2
    const y = (rnd() - 0.5) * THICKNESS * (1 - t * 0.4)

    const sentiment = ai?.sentiments?.[msg.id] ?? classifySentiment(msg.text)
    const lenNorm = Math.min(1, msg.text.length / 200)
    const size = 0.18 + 0.5 * lenNorm
    const brightness = 0.6 + 0.5 * lenNorm
    const clusterId = ai?.clusters?.[msg.id] ?? binOf(rank)

    stars.push({
      id: msg.id,
      messageId: msg.id,
      position: [x, y, z],
      size,
      color: sentimentColor(sentiment, brightness),
      brightness,
      clusterId,
      sentiment,
    })
  })

  // 星座
  const clusters: Cluster[] = []
  for (let c = 0; c < clusterCount; c++) {
    const inCluster = stars.filter((s) => s.clusterId === c)
    if (inCluster.length === 0) continue
    const center: [number, number, number] = [0, 0, 0]
    for (const s of inCluster) {
      center[0] += s.position[0]
      center[1] += s.position[1]
      center[2] += s.position[2]
    }
    const n = inCluster.length
    center[0] /= n
    center[1] /= n
    center[2] /= n
    const firstMessage = messages.find((m) => m.id === inCluster[0].messageId)
    clusters.push({
      id: c,
      name: clusterName(c, firstMessage),
      color: hslToRgb(CLUSTER_PALETTE[c % CLUSTER_PALETTE.length] / 360, 0.5, 0.6),
      starIds: inCluster.map((s) => s.id),
      center,
    })
  }

  const ts = messages
    .filter((m) => !m.isSystem && m.timestamp)
    .map((m) => m.timestamp)
    .sort()
  const participants = Array.from(
    new Set(messages.filter((m) => !m.isSystem).map((m) => m.sender).filter(Boolean))
  )
  const meta: UniverseMeta = {
    messageCount: messages.filter((m) => !m.isSystem).length,
    startISO: ts.length ? ts[0] : null,
    endISO: ts.length ? ts[ts.length - 1] : null,
    participants,
    generatedAt: new Date().toISOString(),
  }

  return { stars, clusters, meta }
}
