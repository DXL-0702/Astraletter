"use client"

import { useEffect, useRef, type MutableRefObject } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import type { Star } from "@/lib/universe/types"

type Mode = "orbit" | "target-lock" | "free-fly"

interface Props {
  pointsRef: MutableRefObject<THREE.Points | null>
  stars: Star[]
  speedRef: MutableRefObject<number>
  onSelect: (star: Star | null) => void
}

// 拖拽 / 滚轮 / 缓动参数
const ORBIT_GAIN = 0.005 // 拖拽 → orbit yaw/pitch
const FREE_GAIN = 0.0026 // free-fly 第一人称增益
const PITCH_LIMIT = 1.4
const MIN_DIST = 25
const MAX_DIST = 420
const SMOOTH = 0.0025 // position/quaternion lerp 系数（越小越顺滑、越滞后）
const ZOOM_DECAY = 4
const ZOOM_IMPULSE = 20
const SPRING = 0.15 // free-fly 朝向弹簧
const OMEGA = 2 / SPRING
const IDLE_DELAY = 8000 // 空闲多久后自动巡航（ms）
const IDLE_ORBIT_SPEED = 0.04 // 空闲自动环绕角速度
const DRAG_THRESHOLD = 5
const LOCK_DIST = 42 // 锁定星点时靠近到的距离

const MOVE_KEYS = new Set(["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"])
const mapKey = (k: string) =>
  k === "arrowup" ? "w" : k === "arrowdown" ? "s" : k === "arrowleft" ? "a" : k === "arrowright" ? "d" : k

const UP = new THREE.Vector3(0, 1, 0)

/**
 * 全景漫游引擎：默认 galaxy-orbit（环绕星宇中心），点星 → target-lock（飞近并环绕该星），
 * WASD/方向键 → free-fly（第一人称飞行）。拖拽带角速度惯性，滚轮调距离，空闲延迟后自动巡航。
 * 不使用 OrbitControls；热路径零分配（复用 ref 对象）。
 */
export default function FlyController({ pointsRef, stars, speedRef, onSelect }: Props) {
  const { camera, gl } = useThree()

  const mode = useRef<Mode>("orbit")
  const target = useRef(new THREE.Vector3(0, 0, 0))
  const orbitYaw = useRef(0)
  const orbitPitch = useRef(0.31)
  const orbitDist = useRef(180)

  // free-fly 第一人称
  const freeYaw = useRef(0)
  const freePitch = useRef(0)
  const curFreeYaw = useRef(0)
  const curFreePitch = useRef(0)
  const vFreeYaw = useRef(0)
  const vFreePitch = useRef(0)
  const zoomVel = useRef(0)

  // 输入状态
  const dragging = useRef(false)
  const dragged = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const activePointer = useRef<number | null>(null)
  const keys = useRef<Set<string>>(new Set())
  const lastInputAt = useRef(0)

  // 复用临时对象（热路径零分配）
  const raycaster = useRef(new THREE.Raycaster())
  const ndc = useRef(new THREE.Vector2())
  const desiredPos = useRef(new THREE.Vector3())
  const eye = useRef(new THREE.Vector3())
  const fwd = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const moveV = useRef(new THREE.Vector3())
  const mLook = useRef(new THREE.Matrix4())
  const qLook = useRef(new THREE.Quaternion())
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"))
  const reduced = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )

  const markInput = () => {
    lastInputAt.current = performance.now()
  }

  // 从当前相机反推 orbit 参数（相对给定 target），用于状态切换时无缝衔接
  const syncOrbitFromCamera = (t: THREE.Vector3) => {
    eye.current.copy(camera.position).sub(t)
    const d = eye.current.length()
    orbitDist.current = Math.max(MIN_DIST, Math.min(MAX_DIST, d || 180))
    orbitYaw.current = Math.atan2(eye.current.x, eye.current.z)
    orbitPitch.current = Math.asin(Math.max(-1, Math.min(1, eye.current.y / (orbitDist.current || 1))))
  }
  const syncFreeFromCamera = () => {
    euler.current.setFromQuaternion(camera.quaternion, "YXZ")
    freeYaw.current = curFreeYaw.current = euler.current.y
    freePitch.current = curFreePitch.current = euler.current.x
    vFreeYaw.current = 0
    vFreePitch.current = 0
  }

  const enterFreeFly = () => {
    if (mode.current !== "free-fly") {
      syncFreeFromCamera()
      mode.current = "free-fly"
    }
  }
  const unlockToOrbit = () => {
    target.current.set(0, 0, 0)
    syncOrbitFromCamera(target.current)
    mode.current = "orbit"
  }
  const lockToStar = (s: Star) => {
    target.current.set(s.position[0], s.position[1], s.position[2])
    syncOrbitFromCamera(target.current)
    orbitDist.current = Math.min(orbitDist.current, LOCK_DIST) // 平滑飞近该星
    mode.current = "target-lock"
  }

  useEffect(() => {
    const p = raycaster.current.params.Points as { threshold: number } | undefined
    if (p) p.threshold = 1.1
    syncOrbitFromCamera(target.current) // 初始 orbit 参数 = 当前相机姿态，避免首帧跳动
    gl.domElement.style.touchAction = "none" // 移动端拖拽不滚动页面
    lastInputAt.current = performance.now()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const m = mode.current

    // free-fly 朝向弹簧
    if (m === "free-fly") {
      const x = OMEGA * dt
      const e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x)
      const cy = curFreeYaw.current - freeYaw.current
      const ty = (vFreeYaw.current + OMEGA * cy) * dt
      vFreeYaw.current = (vFreeYaw.current - OMEGA * ty) * e
      curFreeYaw.current = freeYaw.current + (cy + ty) * e
      const cp = curFreePitch.current - freePitch.current
      const tp = (vFreePitch.current + OMEGA * cp) * dt
      vFreePitch.current = (vFreePitch.current - OMEGA * tp) * e
      curFreePitch.current = freePitch.current + (cp + tp) * e
    }

    // 空闲自动巡航（仅 orbit，延迟后；reduced-motion 关闭）
    const idle =
      m === "orbit" &&
      !dragging.current &&
      keys.current.size === 0 &&
      !reduced.current &&
      performance.now() - lastInputAt.current > IDLE_DELAY
    if (idle) orbitYaw.current += IDLE_ORBIT_SPEED * dt

    // 应用到相机
    if (m === "free-fly") {
      euler.current.set(curFreePitch.current, curFreeYaw.current, 0, "YXZ")
      camera.quaternion.setFromEuler(euler.current)
      fwd.current.set(0, 0, -1).applyQuaternion(camera.quaternion)
      right.current.set(1, 0, 0).applyQuaternion(camera.quaternion)
      const ks = keys.current
      const f = (ks.has("w") ? 1 : 0) - (ks.has("s") ? 1 : 0)
      const s = (ks.has("d") ? 1 : 0) - (ks.has("a") ? 1 : 0)
      if (f !== 0 || s !== 0) {
        moveV.current.set(0, 0, 0).addScaledVector(fwd.current, f).addScaledVector(right.current, s)
        if (moveV.current.lengthSq() > 0) moveV.current.normalize()
        camera.position.addScaledVector(moveV.current, speedRef.current * dt)
      }
      if (Math.abs(zoomVel.current) > 0.001) {
        camera.position.addScaledVector(fwd.current, zoomVel.current * dt)
        zoomVel.current *= Math.exp(-ZOOM_DECAY * dt)
      }
    } else {
      // orbit / target-lock：球坐标 → 期望位置 → lerp；朝向 slerp 看向 target
      const yaw = orbitYaw.current
      const pitch = orbitPitch.current
      const r = orbitDist.current
      const cosp = Math.cos(pitch)
      desiredPos.current.set(
        target.current.x + r * cosp * Math.sin(yaw),
        target.current.y + r * Math.sin(pitch),
        target.current.z + r * cosp * Math.cos(yaw)
      )
      const a = 1 - Math.pow(SMOOTH, dt)
      camera.position.lerp(desiredPos.current, a)
      mLook.current.lookAt(eye.current.copy(camera.position), target.current, UP)
      qLook.current.setFromRotationMatrix(mLook.current)
      camera.quaternion.slerp(qLook.current, a)
    }
  })

  // 输入处理
  useEffect(() => {
    const el = gl.domElement

    const onDown = (e: PointerEvent) => {
      dragging.current = true
      dragged.current = false
      last.current = { x: e.clientX, y: e.clientY }
      activePointer.current = e.pointerId
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        /* noop */
      }
      markInput()
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging.current || !last.current || activePointer.current !== e.pointerId) return
      const dx = e.clientX - last.current.x
      const dy = e.clientY - last.current.y
      if (Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD) dragged.current = true
      if (mode.current === "free-fly") {
        freeYaw.current -= dx * FREE_GAIN
        freePitch.current = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, freePitch.current - dy * FREE_GAIN))
      } else {
        const dyaw = -dx * ORBIT_GAIN
        orbitYaw.current += dyaw
        orbitPitch.current = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, orbitPitch.current - dy * ORBIT_GAIN))
      }
      last.current = { x: e.clientX, y: e.clientY }
      markInput()
    }
    const releasePointer = () => {
      dragging.current = false
      last.current = null
      if (activePointer.current != null) {
        try {
          el.releasePointerCapture(activePointer.current)
        } catch {
          /* noop */
        }
        activePointer.current = null
      }
    }
    const onUp = (e: PointerEvent) => {
      if (activePointer.current !== e.pointerId && activePointer.current !== null) return
      const wasDragged = dragged.current
      releasePointer()
      markInput()
      if (wasDragged) return // 是转向，不是点按

      // 点按选星
      const points = pointsRef.current
      const rect = el.getBoundingClientRect()
      ndc.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      ndc.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.current.setFromCamera(ndc.current, camera)
      const hit = points ? raycaster.current.intersectObject(points)[0] : undefined
      if (hit && hit.index != null && stars[hit.index]) {
        const s = stars[hit.index]
        onSelect(s)
        lockToStar(s) // 进入 target-lock，飞近并环绕该星
      } else {
        // 点虚空：非 orbit 模式 → 回到 galaxy-orbit；并取消选中
        if (mode.current !== "orbit") unlockToOrbit()
        onSelect(null)
      }
    }
    const onCancel = (e: PointerEvent) => {
      // pointercancel 只清状态，不触发点击选星（防误触）
      if (activePointer.current !== e.pointerId && activePointer.current !== null) return
      releasePointer()
      markInput()
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      markInput()
      if (mode.current === "free-fly") {
        // free-fly：沿视线推拉
        zoomVel.current += (e.deltaY < 0 ? 1 : -1) * ZOOM_IMPULSE
      } else {
        // orbit/target-lock：缩放 orbit 距离（有上下限，稳定）
        const factor = e.deltaY < 0 ? 0.88 : 1.14
        orbitDist.current = Math.max(MIN_DIST, Math.min(MAX_DIST, orbitDist.current * factor))
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return
      const key = e.key.toLowerCase()
      if (key === "escape") {
        if (mode.current !== "orbit") unlockToOrbit()
        return
      }
      if (MOVE_KEYS.has(key)) {
        enterFreeFly() // WASD/方向键 → free-fly（同时解除 target-lock）
        keys.current.add(mapKey(key))
        e.preventDefault()
        markInput()
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current.delete(mapKey(e.key.toLowerCase()))
    }
    const clearKeys = () => keys.current.clear()

    el.addEventListener("pointerdown", onDown)
    el.addEventListener("pointermove", onMove)
    el.addEventListener("pointerup", onUp)
    el.addEventListener("pointercancel", onCancel)
    el.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    window.addEventListener("blur", clearKeys)
    return () => {
      el.removeEventListener("pointerdown", onDown)
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerup", onUp)
      el.removeEventListener("pointercancel", onCancel)
      el.removeEventListener("wheel", onWheel)
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      window.removeEventListener("blur", clearKeys)
    }
  }, [gl, camera, pointsRef, stars, onSelect])

  return null
}
