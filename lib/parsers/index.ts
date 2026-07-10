import type { ChatMessage, ChatSource, ParseInput, ParseMeta, ParseResult } from "./types"
import { isGarbled } from "./encoding"
import { whatsappParser } from "./whatsapp"
import { wechatParser } from "./wechat"
import { plaintextParser } from "./plaintext"

export const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
export const ACCEPTED_EXTENSIONS = [".txt", ".log", ".csv"]
export const ACCEPTED_MIME = ["text/plain", "text/csv", ""]

// 识别顺序：WhatsApp（时间戳最特异）→ 微信 → 纯文本兜底
const PARSERS = [whatsappParser, wechatParser, plaintextParser]

export function detectFormat(text: string): ChatSource {
  for (const p of PARSERS) {
    if (p.source === "plaintext") continue
    if (p.detect(text)) return p.source
  }
  return "plaintext"
}

/** 从消息数组中挑 n 条代表性样本：沿时间线均匀分布，跳过系统/空消息 */
export function pickSample(messages: ChatMessage[], n = 3): ChatMessage[] {
  const real = messages.filter((m) => !m.isSystem && m.text.trim() !== "")
  if (real.length <= n) return real
  const picks: ChatMessage[] = []
  const step = real.length / n
  for (let i = 0; i < n; i++) {
    picks.push(real[Math.floor(i * step)])
  }
  return picks
}

function buildMeta(
  source: ChatSource,
  messages: ChatMessage[],
  encoding: "utf-8" | "gbk",
  fileSize: number
): ParseMeta {
  const real = messages.filter((m) => !m.isSystem)
  const participants = Array.from(new Set(real.map((m) => m.sender).filter(Boolean)))
  const ts = real.map((m) => m.timestamp).filter(Boolean).sort()
  const hasTimestamps = ts.length > 0
  return {
    source,
    participants,
    messageCount: real.length,
    startISO: hasTimestamps ? ts[0] : null,
    endISO: hasTimestamps ? ts[ts.length - 1] : null,
    encoding,
    fileSize,
    sample: pickSample(messages),
    hasTimestamps,
  }
}

/**
 * 解析入口（纯函数）。
 * 仅做内容级判断（空 / 编码 / 格式识别 / 消息数）；文件类型与大小校验在导入 hook 层。
 */
export function parseChat(input: ParseInput): ParseResult {
  const isPaste = !input.filename
  const text = input.text ?? ""

  if (text.trim() === "") {
    return {
      ok: false,
      code: isPaste ? "EMPTY_PASTE" : "EMPTY_FILE",
      message: isPaste ? "粘贴的内容是空的" : "文件是空的",
    }
  }

  if (isGarbled(text)) {
    return {
      ok: false,
      code: "GARBLED",
      message: "无法识别文件编码，请将文件另存为 UTF-8 后重试",
    }
  }

  const source = detectFormat(text)
  const parser = PARSERS.find((p) => p.source === source) ?? plaintextParser
  const messages = parser.parse(text)
  const meta = buildMeta(source, messages, input.encoding ?? "utf-8", input.size)

  if (meta.messageCount < 1) {
    return {
      ok: false,
      code: "NO_MESSAGES",
      message: "没有识别到聊天消息，请确认是微信 / WhatsApp 导出的 TXT，或直接粘贴对话文本",
    }
  }

  return { ok: true, messages, meta }
}
