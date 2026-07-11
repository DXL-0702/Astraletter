"use client"

import { useEffect, useMemo } from "react"
import * as THREE from "three"
import { makeStarSprite } from "./twinkle"
import { buildNebulaLayer, NebulaLayer } from "./nebula"
import type { Quality } from "./quality"

const COOL_TEAL = new THREE.Color().setHSL(190 / 360, 0.5, 0.55)
const BLUE_WHITE = new THREE.Color().setHSL(210 / 360, 0.3, 0.72)

/**
 * 外围星云尘埃：大尺度稀薄冷色粒子层（冷青→淡蓝白），覆盖中心云外侧与消息星盘，
 * 形成近/中景视差。低亮、柔尺寸、极轻闪烁。
 */
export function NebulaDust({ quality = "high" }: { quality?: Quality }) {
  const data = useMemo(
    () =>
      buildNebulaLayer({
        count: quality === "high" ? 14000 : 6000,
        radius: 150,
        flatten: 0.8,
        inner: COOL_TEAL,
        outer: BLUE_WHITE,
        brightness: [0.1, 0.3],
        seed: 71,
        cell: 0.08,
      }),
    [quality]
  )
  return <NebulaLayer data={data} size={2.6} twinkle={0.2} />
}

/** 银心托底 halo：降为低 opacity 的暖金柔光，银心亮度主要靠粒子叠加 + Bloom。 */
export function CoreGlow() {
  const sprite = useMemo(makeStarSprite, [])
  useEffect(() => () => sprite.dispose(), [sprite])
  const color = useMemo(() => new THREE.Color().setHSL(46 / 360, 0.85, 0.6), [])
  return (
    <sprite scale={[120, 120, 1]}>
      <spriteMaterial
        map={sprite}
        color={color}
        transparent
        opacity={0.22}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  )
}
