/**
 * 聊天导入的数据契约（消息数组）。
 * 解析层全部是纯函数，无 React、无副作用、无网络。
 *
 * 设计要点：
 *  - `timestamp` 用 ISO 字符串（纯文本为 ""），绝不用 Date，避免 SSR 水合漂移与 JSON 往返。
 *  - 系统消息（日期分割线 / 撤回 / 加密提示等）保留但置 `isSystem`，且不计入 participants / messageCount。
 *  - `ParseResult` 为判别联合，调用方无法在 error 上误读 messages。
 */

export type ChatSource = "wechat" | "whatsapp" | "plaintext"

export interface ChatMessage {
  /** 稳定 id：`${source}:${rawLine}`，作 React key + 去重 */
  id: string
  /** ISO 8601 字符串；无时间戳（纯文本）为 "" */
  timestamp: string
  /** 发送者显示名；系统消息为 "" */
  sender: string
  /** 正文；多行续行用 "\n" 连接 */
  text: string
  /** 源文件 0-based 行号（debug + 稳定 id 种子） */
  rawLine?: number
  source: ChatSource
  /** 系统消息：日期分割线 / 撤回 / 群通知 / 端到端加密提示等 */
  isSystem?: boolean
}

export interface ParseMeta {
  source: ChatSource
  /** 去重后的参与者（排除系统消息） */
  participants: string[]
  /** 非系统消息数 */
  messageCount: number
  /** 最早消息 ISO；无时间戳为 null */
  startISO: string | null
  /** 最晚消息 ISO；无时间戳为 null */
  endISO: string | null
  encoding: "utf-8" | "gbk"
  /** 文件字节数；粘贴为 0 */
  fileSize: number
  /** 供成功预览的代表性消息（默认 3 条） */
  sample: ChatMessage[]
  /** 是否解析到时间戳（纯文本为 false，UI 据此隐藏时间跨度） */
  hasTimestamps: boolean
}

export type ImportErrorCode =
  | "WRONG_TYPE"
  | "TOO_LARGE"
  | "EMPTY_FILE"
  | "UNREADABLE"
  | "NO_MESSAGES"
  | "EMPTY_PASTE"
  | "GARBLED"

export interface ParseSuccess {
  ok: true
  messages: ChatMessage[]
  meta: ParseMeta
}

export interface ParseFailure {
  ok: false
  code: ImportErrorCode
  /** 中文面向用户的错误文案 */
  message: string
  /** 可选的技术细节（如检测到的 MIME） */
  detail?: string
}

export type ParseResult = ParseSuccess | ParseFailure

export interface ParseInput {
  text: string
  /** 有 filename 视为文件导入；无则视为粘贴（影响 EMPTY_FILE vs EMPTY_PASTE） */
  filename?: string
  size: number
  encoding?: "utf-8" | "gbk"
}

export interface FormatParser {
  source: ChatSource
  /** 是否能识别该文本（detect 需 ≥2 行命中以降低误判） */
  detect(text: string): boolean
  /** 解析为消息数组（source 字段由 parser 自行填入） */
  parse(text: string): ChatMessage[]
}
