"use client"

import { useMemo } from "react"
import * as THREE from "three"
import { buildNebulaLayer, NebulaLayer } from "./nebula"
import type { Quality } from "./quality"

// 暖核配色：中心白热 → 暖金（守住「暖核/冷空间」的暖侧）
const HOT = new THREE.Color().setHSL(50 / 360, 0.3, 0.9)
const GOLD = new THREE.Color().setHSL(45 / 360, 0.85, 0.62)
const COOL_WHITE = new THREE.Color().setHSL(200 / 360, 0.22, 0.72) // 外缘仅微冷白，不主导青
const GOLD_BRIGHT = new THREE.Color().setHSL(46 / 360, 0.95, 0.66)

/**
 * 银心星云：三层粒子叠加成连续、发雾、发光、有厚度的核球（而非单张光斑）。
 *  - CoreBulge：密集低亮核球（暖白→金），加色叠加成连续银心；不闪烁。
 *  - CoreDust：更宽的星云尘埃（金→微冷白），填补空隙、形成雾感；不闪烁。
 *  - ResolvedCoreStars：可分辨亮星（暖金），轻微闪烁，肉眼可见的星点层。
 * 中心亮度主要来自粒子叠加 + Bloom；CoreGlow 仅作托底 halo。
 */
export default function CentralStarCloud({ quality = "high" }: { quality?: Quality }) {
  const layers = useMemo(
    () => ({
      bulge: buildNebulaLayer({
        count: quality === "high" ? 30000 : 12000,
        radius: 26,
        flatten: 0.5,
        inner: HOT,
        outer: GOLD,
        brightness: [0.35, 0.7],
        seed: 11,
      }),
      dust: buildNebulaLayer({
        count: quality === "high" ? 50000 : 20000,
        radius: 56,
        flatten: 0.62,
        inner: GOLD,
        outer: COOL_WHITE,
        brightness: [0.12, 0.32],
        seed: 23,
      }),
      resolved: buildNebulaLayer({
        count: quality === "high" ? 4000 : 2000,
        radius: 42,
        flatten: 0.6,
        inner: GOLD_BRIGHT,
        outer: GOLD_BRIGHT,
        brightness: [0.7, 1.0],
        seed: 37,
      }),
    }),
    [quality]
  )

  return (
    <>
      <NebulaLayer data={layers.bulge} size={1.6} twinkle={0} />
      <NebulaLayer data={layers.dust} size={2.6} twinkle={0} />
      <NebulaLayer data={layers.resolved} size={3.2} twinkle={0.5} />
    </>
  )
}
