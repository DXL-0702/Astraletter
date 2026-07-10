/** 成功面板用的展示型辅助函数（纯函数，无依赖）。 */

export function formatBytes(n: number): string {
  if (n <= 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)))
  const v = n / Math.pow(1024, i)
  return `${v.toFixed(v >= 100 || i === 0 ? 0 : 1)} ${units[i]}`
}

/** ISO → "2023.01.15"；空/非法 → "—" */
export function formatDate(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${y}.${m}.${day}`
}

/** 时间跨度 "2023.01 – 2024.05"；任一为空 → "—" */
export function formatTimeSpan(startISO: string | null, endISO: string | null): string {
  if (!startISO && !endISO) return "—"
  return `${formatDate(startISO)} – ${formatDate(endISO)}`
}
