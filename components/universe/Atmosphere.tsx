"use client"

import { useEffect, useMemo } from "react"
import * as THREE from "three"
import { TWINKLE_FRAG, TWINKLE_VERT, makeStarSprite, useTwinkleMaterial } from "./twinkle"

/** 3D 星云尘埃：稀薄加色粒子云，逐星闪烁，冷青色调（深空画布的一部分）。 */
export function NebulaDust({ count = 700 }: { count?: number }) {
  const { matRef, uniforms } = useTwinkleMaterial(2.2, 0.5)

  const positions = useMemo(() => {
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = (Math.random() + Math.random()) * 75
      const ang = Math.random() * Math.PI * 2
      a[i * 3] = Math.cos(ang) * r
      a[i * 3 + 1] = (Math.random() - 0.5) * 44
      a[i * 3 + 2] = Math.sin(ang) * r
    }
    return a
  }, [count])

  const colors = useMemo(() => {
    const c = new THREE.Color().setHSL(185 / 360, 0.6, 0.5)
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      a[i * 3] = c.r
      a[i * 3 + 1] = c.g
      a[i * 3 + 2] = c.b
    }
    return a
  }, [count])

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

/** 银心辉光：星海中心的暖金加色 sprite，给深空冷调一个温暖焦点。 */
export function CoreGlow() {
  const sprite = useMemo(makeStarSprite, [])
  useEffect(() => () => sprite.dispose(), [sprite])
  const color = useMemo(() => new THREE.Color().setHSL(46 / 360, 0.85, 0.6), [])
  return (
    <sprite scale={[82, 82, 1]}>
      <spriteMaterial
        map={sprite}
        color={color}
        transparent
        opacity={0.45}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  )
}
