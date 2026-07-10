import type { Sentiment } from "../parsers/sentiment"

export type AIStage =
  | "loading-embed"
  | "embedding"
  | "loading-sentiment"
  | "sentiment"
  | "done"
  | "error"

export interface AIProgress {
  stage: AIStage
  progress: number // 0..1
  message?: string
}

export interface AITaskMessage {
  id: string
  text: string
}

export type AIRequest = { messages: AITaskMessage[] }

export type AIResponse =
  | { type: "progress"; data: AIProgress }
  | { type: "result"; sentiments: Record<string, Sentiment>; clusters: Record<string, number> }
