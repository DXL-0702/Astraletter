"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// 中心星云专用 shader：gl_PointCoord 计算高斯软光斑（不依赖贴图）、视空间 size attenuation、可选轻闪烁。
export const NEBULA_VERT = /* glsl */ `
attribute vec3 aColor;
attribute float aPhase;
uniform float uSize;
uniform float uTime;
uniform float uTwinkle;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vColor = aColor;
  float tw = 1.0 - uTwinkle * (0.5 - 0.5 * sin(uTime * 1.6 + aPhase * 6.2831853));
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = uSize * (0.85 + 0.3 * tw) * (300.0 / max(-mv.z, 0.1));
  vAlpha = 0.85 + 0.15 * tw;
  gl_Position = projectionMatrix * mv;
}
`

export const NEBULA_FRAG = /* glsl */ `
precision highp float;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - vec2(0.5)) * 2.0;
  float a = exp(-d * d * 4.5); // 高斯软光斑
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor * a * vAlpha, a * vAlpha);
}
`

function mulberry32(a: number) {
  let s = a >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), s | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// 整数 hash → [0,1)，用于局部密度/亮度噪声（制造尘埃团簇与暗隙）
function hash3(x: number, y: number, z: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(z | 0, 1274126173)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

export interface LayerData {
  positions: Float32Array
  colors: Float32Array
  phases: Float32Array
}

/** 构建一层星云粒子：seeded 高斯分布（中心密、边缘稀）+ hash 噪声调制亮度（自然团簇/暗隙）。 */
export function buildNebulaLayer(opts: {
  count: number
  radius: number
  flatten: number // y 相对 x/z 的压缩（盘厚）
  inner: THREE.Color
  outer: THREE.Color
  brightness: [number, number] // [min,max] 亮度倍率
  seed: number
  cell?: number // 噪声量化尺度
}): LayerData {
  const { count, radius, flatten, inner, outer, brightness, seed, cell = 0.18 } = opts
  const rnd = mulberry32(seed)
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  const tmp = new THREE.Color()
  const gauss = () => rnd() + rnd() + rnd() + rnd() + rnd() + rnd() - 3 // ~N(0,1)
  for (let i = 0; i < count; i++) {
    const x = gauss() * radius
    const y = gauss() * radius * flatten
    const z = gauss() * radius
    // 局部噪声：团簇亮、暗隙暗
    const n = hash3(Math.floor(x * cell), Math.floor(y * cell), Math.floor(z * cell))
    const r = Math.min(1, Math.sqrt(x * x + y * y + z * z) / radius)
    tmp.copy(inner).lerp(outer, r)
    const b = brightness[0] + (brightness[1] - brightness[0]) * (0.35 + 0.65 * n)
    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z
    colors[i * 3] = tmp.r * b
    colors[i * 3 + 1] = tmp.g * b
    colors[i * 3 + 2] = tmp.b * b
    phases[i] = rnd()
  }
  return { positions, colors, phases }
}

function useNebulaMaterial(size: number, twinkle: number) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  )
  const uniforms = useMemo(
    () => ({
      uSize: { value: size },
      uTime: { value: 0 },
      uTwinkle: { value: reduced ? 0 : twinkle },
    }),
    [size, reduced, twinkle]
  )
  useFrame((s) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = s.clock.elapsedTime
  })
  return { matRef, uniforms }
}

/** 单层星云 points：高斯软光斑 + 加色叠加。不暴露 ref → 不参与点星选择射线检测。 */
export function NebulaLayer({
  data,
  size,
  twinkle,
}: {
  data: LayerData
  size: number
  twinkle: number
}) {
  const { matRef, uniforms } = useNebulaMaterial(size, twinkle)
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[data.colors, 3]} />
        <bufferAttribute attach="attributes-aPhase" args={[data.phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={NEBULA_VERT}
        fragmentShader={NEBULA_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
