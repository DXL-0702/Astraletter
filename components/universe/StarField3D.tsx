"use client"

import { forwardRef, useMemo } from "react"
import * as THREE from "three"
import type { Star } from "@/lib/universe/types"
import { TWINKLE_FRAG, TWINKLE_VERT, useTwinkleMaterial } from "./twinkle"

interface Props {
  stars: Star[]
  selectedId?: string | null
}

/**
 * 发光、闪烁的星辰：自定义 shader 做逐星相位闪烁 + 情感顶点色（暖色恒星光谱）。
 * 选中星提亮（写入 aColor）；选择经 ref 由 FlyController 射线检测处理。
 */
const StarField3D = forwardRef<THREE.Points, Props>(function StarField3D(
  { stars, selectedId },
  ref
) {
  const { matRef, uniforms } = useTwinkleMaterial(8, 0.9)

  const positions = useMemo(() => {
    const a = new Float32Array(stars.length * 3)
    stars.forEach((s, i) => {
      a[i * 3] = s.position[0]
      a[i * 3 + 1] = s.position[1]
      a[i * 3 + 2] = s.position[2]
    })
    return a
  }, [stars])

  // 逐星尺寸：消息权重 size∈[0.18,0.68] → 倍率 [0.7,1.7]，长/重消息明显更大；
  // 选中星再放大，成为无可争议的视觉焦点。
  const sizes = useMemo(() => {
    const a = new Float32Array(stars.length)
    stars.forEach((s, i) => {
      const m = 0.7 + (Math.min(s.size, 0.68) / 0.68) * 1.0
      a[i] = s.id === selectedId ? m * 1.6 : m
    })
    return a
  }, [stars, selectedId])

  const colors = useMemo(() => {
    const a = new Float32Array(stars.length * 3)
    stars.forEach((s, i) => {
      const boost = s.id === selectedId ? 2.4 : 1
      a[i * 3] = Math.min(1, s.color[0] * boost)
      a[i * 3 + 1] = Math.min(1, s.color[1] * boost)
      a[i * 3 + 2] = Math.min(1, s.color[2] * boost)
    })
    return a
  }, [stars, selectedId])

  const phases = useMemo(() => {
    const a = new Float32Array(stars.length)
    for (let i = 0; i < stars.length; i++) a[i] = Math.random()
    return a
  }, [stars])

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={TWINKLE_VERT}
        fragmentShader={TWINKLE_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
})

export default StarField3D
