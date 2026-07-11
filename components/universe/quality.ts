export type Quality = "high" | "low"

/** 粗略设备能力分级：弱设备/reduced-motion → low（粒子数减半、降负）。 */
export function detectQuality(): Quality {
  if (typeof navigator === "undefined") return "high"
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "low"
  }
  const nav = navigator as Navigator & { deviceMemory?: number }
  const mem = nav.deviceMemory
  const cores = navigator.hardwareConcurrency
  if ((mem !== undefined && mem <= 4) || (cores !== undefined && cores <= 4)) return "low"
  return "high"
}
