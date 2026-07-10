import type { ChatMessage, ChatSource, FormatParser } from "./types"

const source: ChatSource = "wechat"

// Windows 导出：2023/01/15 15:47:55 昵称 （紧接下一行起为正文，空行分隔）
const WIN_HEADER = /^(\d{4}[/.-]\d{1,2}[/.-]\d{1,2})\s+(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+?)\s*$/
// Mac 导出：昵称 2023-01-15 3:47:55 PM
const MAC_HEADER = /^(.+?)\s+(\d{4}[/.-]\d{1,2}[/.-]\d{1,2})\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\s*$/

// 系统消息关键词（命中即置 isSystem，发送者置空，不计入参与者）
const SYS_PATTERNS = [
  /^-{2,}.*-{2,}$/, // 日期分割线 ———— 2023年1月1日 ————
  /撤回了一条消息/,
  /你已添加了/,
  /以上是打招呼的/,
  /加入了群聊/,
  /开启了朋友验证/,
  /发出了红包|领取了你的红包|收到了红包|退还了红包/,
  /你撤回了一条消息/,
  /对方已确认收钱|请你确认收款/,
]

function parseWeChatDate(date: string, time: string): string {
  const dm = date.match(/^(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})$/)
  if (!dm) return ""
  const [, y, mo, d] = dm

  const tm = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*([APap][Mm]))?$/)
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

  const dt = new Date(Date.UTC(parseInt(y, 10), parseInt(mo, 10) - 1, parseInt(d, 10), hh, mm, ss))
  return Number.isNaN(dt.getTime()) ? "" : dt.toISOString()
}

export const wechatParser: FormatParser = {
  source,
  detect(text: string): boolean {
    const lines = text.split(/\r?\n/)
    let hits = 0
    for (const line of lines) {
      if (!line.trim()) continue
      if (WIN_HEADER.test(line) || MAC_HEADER.test(line)) {
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
      const w = line.match(WIN_HEADER)
      if (w) {
        const [, date, time, name] = w
        current = {
          id: `${source}:${idx}`,
          timestamp: parseWeChatDate(date, time),
          sender: name.trim(),
          text: "",
          rawLine: idx,
          source,
          isSystem: false,
        }
        messages.push(current)
        return
      }

      const m = line.match(MAC_HEADER)
      if (m) {
        const [, name, date, time] = m
        // 仅当日期确实可解析时才认作 Mac 表头，降低误判
        if (parseWeChatDate(date, time)) {
          current = {
            id: `${source}:${idx}`,
            timestamp: parseWeChatDate(date, time),
            sender: name.trim(),
            text: "",
            rawLine: idx,
            source,
            isSystem: false,
          }
          messages.push(current)
          return
        }
      }

      // 续行（含空行分隔）并入上一条正文
      if (current && line.trim() !== "") {
        current.text += `${current.text ? "\n" : ""}${line}`
      }
    })

    // 标注系统消息；丢弃无正文的空消息
    for (const msg of messages) {
      if (msg.text && SYS_PATTERNS.some((re) => re.test(msg.text))) {
        msg.isSystem = true
        msg.sender = ""
      }
    }
    return messages.filter((m) => m.text.trim() !== "" || m.isSystem)
  },
}
