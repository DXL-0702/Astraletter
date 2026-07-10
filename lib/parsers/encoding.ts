/**
 * 原生（零依赖）文本解码：UTF-8 优先，失败回退原生 `TextDecoder("gbk")`。
 * 解决微信导出常为 GBK/GB18030、WhatsApp 常为 UTF-8 的现实差异。
 * "gbk" 是 Encoding Standard 内置 label，所有现代浏览器与 Node 均原生支持。
 */

/** 统计 U+FFFD 替换符数量（衡量解码失败程度） */
export function countReplacement(s: string): number {
  let n = 0
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) === 0xfffd) n++
  }
  return n
}

/** 替换符占比 */
export function replacementRatio(s: string): number {
  return s.length === 0 ? 0 : countReplacement(s) / s.length
}

export interface Decoded {
  text: string
  encoding: "utf-8" | "gbk"
}

/**
 * 解码字节缓冲：UTF-8 先解；若出现替换符则再试 GBK，取替换符更少者。
 */
export function decodeChat(buf: Uint8Array): Decoded {
  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(buf)
  const utf8Repl = countReplacement(utf8)
  if (utf8Repl === 0) return { text: utf8, encoding: "utf-8" }

  let gbk = utf8
  let gbkRepl = utf8Repl
  try {
    gbk = new TextDecoder("gbk", { fatal: false }).decode(buf)
    gbkRepl = countReplacement(gbk)
  } catch {
    // 极少数环境不支持 gbk label：保留 utf8 结果。
  }

  return gbkRepl < utf8Repl ? { text: gbk, encoding: "gbk" } : { text: utf8, encoding: "utf-8" }
}

/** 两种编码都明显失败（替换符密度过高）→ 让上层抛 GARBLED */
export function isGarbled(text: string): boolean {
  return replacementRatio(text) > 0.02
}
