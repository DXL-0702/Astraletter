import type { ChatMessage, ChatSource, FormatParser } from "./types"

const source: ChatSource = "plaintext"

// 可选「昵称：/Name:」前缀（发送者 ≤24 字符，避免把整句冒号误判为发送者）
const SENDER_PREFIX = /^([^:\n]{1,24})[：:]\s?(.*)$/

export const plaintextParser: FormatParser = {
  source,
  // 兜底解析器，永远为真（仅作最低优先级回退）
  detect: () => true,
  parse(text: string): ChatMessage[] {
    const lines = text.split(/\r?\n/)
    const messages: ChatMessage[] = []

    lines.forEach((line, idx) => {
      const body = line.replace(/\s+$/g, "")
      if (body.trim() === "") return

      const m = body.match(SENDER_PREFIX)
      const sender = m ? m[1].trim() : ""
      const content = m ? m[2] : body

      messages.push({
        id: `${source}:${idx}`,
        timestamp: "",
        sender,
        text: content,
        rawLine: idx,
        source,
        isSystem: false,
      })
    })

    return messages
  },
}
