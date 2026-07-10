/// <reference lib="webworker" />
// ⏸ Phase 1.5（暂缓）：此 worker 未被任何活动代码引用，故不进入 webpack 构建。
// 重新启用前，Transformers.js 在 Next 14 的打包需特殊处理（onnxruntime-node 排除、
// 强制 transformers.web.js、ort webgpu bundle 解析）。详见 mvp/01-project-init.md。
import { env, pipeline } from "@huggingface/transformers"
import type { Sentiment } from "../parsers/sentiment"
import type { AIRequest, AIResponse, AIStage } from "./types"
import { EMBEDDING_MODEL, SENTIMENT_MODEL, mapSentimentLabel } from "./models"

// 模型走 HuggingFace CDN（首跑下载，后续由浏览器缓存）
env.allowLocalModels = false

const ctx = self as unknown as DedicatedWorkerGlobalScope

const post = (m: AIResponse) => ctx.postMessage(m)
const progress = (stage: AIStage, value: number, message?: string) =>
  post({ type: "progress", data: { stage, progress: value, message } })

/** 简单 k-means（欧氏距离；嵌入已归一化，近似球面 k-means）。 */
function kmeans(points: number[][], k: number, iterations = 30): number[] {
  const n = points.length
  if (n === 0) return []
  if (k >= n) return points.map((_, i) => i)
  const dim = points[0].length
  // 均匀初始化中心
  const centroids: number[][] = []
  for (let c = 0; c < k; c++) centroids.push(points[Math.floor((c * n) / k)].slice())
  const labels = new Array(n).fill(0)
  for (let iter = 0; iter < iterations; iter++) {
    let changed = false
    for (let i = 0; i < n; i++) {
      let best = 0
      let bestD = Infinity
      const p = points[i]
      for (let c = 0; c < k; c++) {
        const ctr = centroids[c]
        let d = 0
        for (let j = 0; j < dim; j++) {
          const diff = p[j] - ctr[j]
          d += diff * diff
        }
        if (d < bestD) {
          bestD = d
          best = c
        }
      }
      if (labels[i] !== best) {
        labels[i] = best
        changed = true
      }
    }
    const sums = Array.from({ length: k }, () => new Array(dim).fill(0))
    const counts = new Array(k).fill(0)
    for (let i = 0; i < n; i++) {
      const c = labels[i]
      counts[c]++
      const s = sums[c]
      const p = points[i]
      for (let j = 0; j < dim; j++) s[j] += p[j]
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) for (let j = 0; j < dim; j++) centroids[c][j] = sums[c][j] / counts[c]
    }
    if (!changed && iter > 0) break
  }
  return labels
}

ctx.onmessage = async (e: MessageEvent<AIRequest>) => {
  const msgs = e.data.messages
  if (msgs.length === 0) {
    post({ type: "result", sentiments: {}, clusters: {} })
    return
  }
  try {
    progress("loading-embed", 0.02, "加载嵌入模型…")
    const embedder = await pipeline("feature-extraction", EMBEDDING_MODEL)

    progress("embedding", 0.08, "理解每段对话的语义…")
    const embeddings: number[][] = []
    for (let i = 0; i < msgs.length; i++) {
      const out = await embedder(msgs[i].text, { pooling: "mean", normalize: true })
      embeddings.push(Array.from(out.data as Float32Array))
      if (i % 25 === 0) progress("embedding", 0.08 + 0.42 * (i / msgs.length))
    }

    const k = Math.max(1, Math.min(10, Math.ceil(msgs.length / 40)))
    const labels = kmeans(embeddings, k)
    const clusters: Record<string, number> = {}
    msgs.forEach((m, i) => (clusters[m.id] = labels[i]))

    progress("loading-sentiment", 0.55, "加载情感模型…")
    const classifier = await pipeline("text-classification", SENTIMENT_MODEL)

    progress("sentiment", 0.6, "感受每句话的情绪…")
    const sentiments: Record<string, Sentiment> = {}
    for (let i = 0; i < msgs.length; i++) {
      const r = await classifier(msgs[i].text)
      const label = Array.isArray(r) ? r[0]?.label : (r as { label?: string })?.label
      sentiments[msgs[i].id] = mapSentimentLabel(String(label ?? ""))
      if (i % 25 === 0) progress("sentiment", 0.6 + 0.4 * (i / msgs.length))
    }

    progress("done", 1)
    post({ type: "result", sentiments, clusters })
  } catch (err) {
    progress("error", 0, err instanceof Error ? err.message : String(err))
  }
}
