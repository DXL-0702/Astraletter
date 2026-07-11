import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

/** 软白心径向渐变 sprite（运行时生成）。 */
export function makeStarSprite(): THREE.Texture {
  if (typeof document === "undefined") return new THREE.Texture()
  const size = 64
  const cv = document.createElement("canvas")
  cv.width = cv.height = size
  const ctx = cv.getContext("2d")!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, "rgba(255,255,255,1)")
  g.addColorStop(0.2, "rgba(255,255,255,0.85)")
  g.addColorStop(0.5, "rgba(255,255,255,0.25)")
  g.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const t = new THREE.CanvasTexture(cv)
  t.needsUpdate = true
  return t
}

// 逐星相位闪烁：亮度随 sin(时间 + 各自相位) 呼吸，并带轻微大小脉动 —— 接近真实恒星闪烁。
export const TWINKLE_VERT = /* glsl */ `
attribute vec3 aColor;
attribute float aPhase;
attribute float aSize; // 逐星尺寸倍率（消息权重），缺省 1.0
uniform float uSize;
uniform float uTime;
uniform float uTwinkle;
varying vec3 vColor;
varying float vTw;
void main() {
  vColor = aColor;
  // 双频叠加 → 不规则闪烁（更像真实恒星），幅度由 uTwinkle 控制
  float s1 = sin(uTime * 2.4 + aPhase * 6.2831853);
  float s2 = sin(uTime * 4.1 + aPhase * 12.5664);
  float tw = 1.0 - uTwinkle * (0.5 - 0.5 * (s1 * 0.65 + s2 * 0.35));
  vTw = tw;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = uSize * aSize * (0.7 + 0.5 * tw) * (300.0 / max(-mv.z, 0.1));
  gl_Position = projectionMatrix * mv;
}
`

export const TWINKLE_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
varying vec3 vColor;
varying float vTw;
void main() {
  float a = texture2D(uTex, gl_PointCoord).a;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor * vTw, a);
}
`

/** 共享：闪烁点云的 shaderMaterial 装配。sprite 自动释放；reduced-motion 下 uTwinkle=0（静止）。 */
export function useTwinkleMaterial(size: number, twinkle: number) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const tex = useMemo(makeStarSprite, [])
  useEffect(() => () => tex.dispose(), [tex])
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  )
  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uSize: { value: size },
      uTime: { value: 0 },
      uTwinkle: { value: reduced ? 0 : twinkle },
    }),
    [tex, size, reduced, twinkle]
  )
  useFrame((s) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = s.clock.elapsedTime
  })
  return { matRef, uniforms }
}
