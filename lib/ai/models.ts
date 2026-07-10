import type { Sentiment } from "../parsers/sentiment"

/** 嵌入模型（小，~23MB），用于话题聚类。 */
export const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2"

/** 多语情感模型（含中文，5 星），用于情感着色。 */
export const SENTIMENT_MODEL = "Xenova/bert-base-multilingual-uncased-sentiment"

/** 5 星标签 → 三分类（对齐星图情感配色）。 */
export function mapSentimentLabel(label: string): Sentiment {
  const stars = parseInt(label, 10)
  if (Number.isNaN(stars)) return "neutral"
  if (stars <= 2) return "negative"
  if (stars >= 4) return "positive"
  return "neutral"
}
