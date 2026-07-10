import type { ChatMessage } from "./types"

export type Sentiment = "positive" | "neutral" | "negative"

/** 单条消息情感分类（轻量启发式，无 AI）。供星图确定性生成兜底使用。 */
export function classifySentiment(text: string): Sentiment {
  let score = 0
  for (const w of POSITIVE) if (text.includes(w)) score++
  for (const w of NEGATIVE) if (text.includes(w)) score--
  if (score > 0) return "positive"
  if (score < 0) return "negative"
  return "neutral"
}

/**
 * 轻量（无 AI、无依赖）聚合情感色相估计，用于成功时给 Galaxy 一个「 payoff 」色相。
 * 与 DESIGN.md §6 的情感配色映射一致：
 *   正向 ~70（琥珀）/ 中性 ~240（深空蓝）/ 负向 ~330（玫瑰）。
 * 仅为浏览器内即时反馈的启发式，不替代未来的本地情感模型。
 */

const POSITIVE = [
  "爱", "喜欢", "想你", "开心", "哈哈", "么么", "晚安", "早安", "宝贝", "加油",
  "谢谢", "好棒", "幸福", "抱抱", "❤", "😍", "😘", "🥰", "💕", "😄", "😊", "🥳",
]
const NEGATIVE = [
  "难过", "伤心", "对不起", "哭", "烦", "吵架", "分手", "生气", "讨厌", "好累",
  "不想", "害怕", "失望", "😢", "😭", "😡", "💔", "😔", "😒",
]

export function estimateAggregateHue(messages: ChatMessage[]): number {
  let score = 0
  for (const m of messages) {
    if (m.isSystem) continue
    for (const w of POSITIVE) if (m.text.includes(w)) score++
    for (const w of NEGATIVE) if (m.text.includes(w)) score--
  }
  if (score > 3) return 70 // 正向：暖琥珀
  if (score < -3) return 330 // 负向：玫瑰
  return 240 // 中性：深空蓝（与 idle 一致，中性对话不变色）
}
