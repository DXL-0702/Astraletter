import type { ChatMessage, ChatSource, FormatParser } from "./types"

const source: ChatSource = "whatsapp"

// 日期 / 时间片段（iOS 与 Android 共用）
const DATE = "\\d{1,2}[/.-]\\d{1,2}[/.-]\\d{2,4}"
const TIME = "\\d{1,2}:\\d{2}(?::\\d{2})?(?:\\s*[APap][Mm])?"

// iOS:  [15/01/23, 15:47:55] 昵称: 内容  （也兼容 12 小制 + AM/PM）
const IOS_RE = new RegExp(`^\\[\\s*(${DATE}),\\s*(${TIME})\\s*\\]\\s*([^:\\n]+?):\\s?(.*)$`)
// Android: 15/01/23, 3:47 PM - 昵称: 内容
const ANDROID_RE = new RegExp(`^(${DATE}),\\s*(${TIME})\\s+-\\s+([^:\\n]+?):\\s?(.*)$`)

// 带时间戳前缀但无「昵称:」→ 系统通知（端到端加密提示 / 建群 / 加人等）
const IOS_SYS_RE = new RegExp(`^\\[\\s*(${DATE}),\\s*(${TIME})\\s*\\]\\s*(.+)$`)
const ANDROID_SYS_RE = new RegExp(`^(${DATE}),\\s*(${TIME})\\s+-\\s+(.+)$`)

interface Header {
  date: string
  time: string
  sender: string
  body: string
}

function matchHeader(line: string): Header | null {
  const ios = line.match(IOS_RE)
  if (ios) return { date: ios[1], time: ios[2], sender: ios[3].trim(), body: ios[4] }
  const android = line.match(ANDROID_RE)
  if (android) return { date: android[1], time: android[2], sender: android[3].trim(), body: android[4] }
  return null
}

interface SysLine {
  date: string
  time: string
  text: string
}

function matchSystem(line: string): SysLine | null {
  const ios = line.match(IOS_SYS_RE)
  if (ios) return { date: ios[1], time: ios[2], text: ios[3].trim() }
  const android = line.match(ANDROID_SYS_RE)
  if (android) return { date: android[1], time: android[2], text: android[3].trim() }
  return null
}

/**
 * 解析 WhatsApp 日期/时间 → ISO 字符串。
 * 默认按 DD/MM/YYYY（美国之外最常见）；若首字段 >12 视为日，若次字段 >12 回退 MM/DD。
 */
function parseWhatsAppDate(date: string, time: string): string {
  const dm = date.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/)
  if (!dm) return ""
  const [, a, b, y] = dm
  const ai = parseInt(a, 10)
  const bi = parseInt(b, 10)
  let year = parseInt(y, 10)
  if (year < 100) year += year < 70 ? 2000 : 1900

  let day: number
  let month: number
  if (ai > 12 && bi <= 12) {
    day = ai
    month = bi
  } else if (bi > 12 && ai <= 12) {
    day = bi
    month = ai
  } else {
    day = ai
    month = bi
  }

  const tm = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([APap][Mm])?$/)
  if (!tm) return ""
  let hh = parseInt(tm[1], 10)
  const mm = parseInt(tm[2], 10)
  const ss = tm[3] ? parseInt(tm[3], 10) : 0
  const ap = tm[4]
  if (ap) {
    const upper = ap.toUpperCase()
    if (upper === "PM" && hh < 12) hh += 12
    if (upper === "AM" && hh === 12) hh = 0
  }

  const d = new Date(Date.UTC(year, month - 1, day, hh, mm, ss))
  return Number.isNaN(d.getTime()) ? "" : d.toISOString()
}

export const whatsappParser: FormatParser = {
  source,
  detect(text: string): boolean {
    const lines = text.split(/\r?\n/)
    let hits = 0
    for (const line of lines) {
      if (!line.trim()) continue
      if (IOS_RE.test(line) || ANDROID_RE.test(line)) {
        hits++
        if (hits >= 2) return true
      }
    }
    return false
  },
  parse(text: string): ChatMessage[] {
    const lines = text.split(/\r?\n/)
    const messages: ChatMessage[] = []
    let current: ChatMessage | null = null

    lines.forEach((line, idx) => {
      const h = matchHeader(line)
      if (h) {
        current = {
          id: `${source}:${idx}`,
          timestamp: parseWhatsAppDate(h.date, h.time),
          sender: h.sender,
          text: h.body.trim(),
          rawLine: idx,
          source,
          isSystem: false,
        }
        messages.push(current)
        return
      }

      const sys = matchSystem(line)
      if (sys) {
        current = {
          id: `${source}:${idx}`,
          timestamp: parseWhatsAppDate(sys.date, sys.time),
          sender: "",
          text: sys.text,
          rawLine: idx,
          source,
          isSystem: true,
        }
        messages.push(current)
        return
      }

      // 续行并入上一条正文
      if (current && line.trim()) {
        current.text += `${current.text ? "\n" : ""}${line.trim()}`
      }
    })

    return messages
  },
}
