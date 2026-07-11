"use client"

import { useMemo } from "react"
import * as THREE from "three"
import { TWINKLE_FRAG, TWINKLE_VERT, useTwinkleMaterial } from "./twinkle"

const R = 38

/**
 * 银河中心恒星云：数千颗密集、暖金→白热、闪烁的微星，集中在扁平椭球核心。
 * 营造银河核的密度与体量，让整片画面更像银河星空（参考诗云的星团密度）。
 */
export default function CentralStarCloud({ count = 3400 }: { count?: number }) {
  const { matRef, uniforms } = useTwinkleMaterial(2.0, 0.8)

  const positions = useMemo(() => {
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // 三个随机相加 −1.5 ≈ 高斯，集中中心、稀疏边缘
      const gx = Math.random() + Math.random() + Math.random() - 1.5
      const gz = Math.random() + Math.random() + Math.random() - 1.5
      const gy = (Math.random() + Math.random() - 1) * 0.32 // 扁盘
      a[i * 3] = gx * R
      a[i * 3 + 1] = gy * R
      a[i * 3 + 2] = gz * R
    }
    return a
  }, [count])

  const colors = useMemo(() => {
    const gold = new THREE.Color().setHSL(46 / 360, 0.95, 0.6)
    const hot = new THREE.Color().setHSL(50 / 360, 0.4, 0.86) // 核心白热
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const x = positions[i * 3]
      const y = positions[i * 3 + 1]
      const z = positions[i * 3 + 2]
      const d = Math.min(1, Math.sqrt(x * x + y * y + z * z) / R)
      const c = hot.clone().lerp(gold, d) // 越靠中心越白热，越远越金
      a[i * 3] = c.r
      a[i * 3 + 1] = c.g
      a[i * 3 + 2] = c.b
    }
    return a
  }, [positions, count])

  const phases = useMemo(() => {
    const a = new Float32Array(count)
    for (let i = 0; i < count; i++) a[i] = Math.random()
    return a
  }, [count])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
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
}
