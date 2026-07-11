# Astraletter Design System

落地基础：Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui（Radix 基座）+ lucide-react。
设计方向：「Celestial Instrument UI / 星器界面」——深空沉浸背景上漂浮的半透明玻璃仪器面板。

> 本文件是 Phase 1 UI 框架的单一事实来源。token 与命名以 [app/globals.css](app/globals.css) 为准。

---

## 1. Token 架构（两层）

### 产品层（产品 UI 直接使用）
- 颜色：`--bg` `--surface` `--surface-elevated` `--surface-highlight` `--border` `--border-strong` `--ink` `--ink-muted` `--primary` `--starlight` `--magic` `--danger` `--success`
- 字体：`--font-sans`（Sora）`--font-display`（Cinzel + ZCOOL XiaoWei）
- 间距 / 圆角 / 阴影辉光 / 动效 / z-index：见 `:root`

### shadcn 桥接层（让 shadcn/ui 原语共享同一主题）
shadcn 的语义 token 全部 alias 到产品 token，避免双套配色：
`--background/--foreground/--card/--popover/--primary/--secondary/--muted/--accent/--destructive/--border/--input/--ring/--radius` 等。

### 命名约定（重要，避免历史冲突）
- `starlight`：亮星光琥珀（原 `accent`）。用于高光、CTA、焦点环、选中态。class：`text-starlight / bg-starlight / border-starlight`。
- `accent`：**shadcn 的淡背景**（alias 到 `--surface-highlight`），仅 shadcn ghost 悬停使用，不要当高光用。
- `muted`：**背景色**（alias 到 `--surface-highlight`）；次要文字用 `text-muted-foreground`（alias 到 `--ink-muted`）。
- `magic`：AI / 星语翻译的冷紫。

## 2. 字体
- 正文 / UI：`Sora` + 中文回退 PingFang/Noto Sans SC。
- 展示标题 / 星座名 / 星语：`Marcellus`（拉丁，罗马碑刻星图感）+ `Noto Serif SC`（中文，宋体，锐利不糊）。
- 艺术字**只用于展示位**，不进正文；`display=swap`。

## 3. 目录结构
```
app/
  globals.css        # token + 基础组件类（.panel/.btn/.lens/.reticle/.starfield/.dropzone[data-state] …）
  layout.tsx         # 字体加载（Sora via next/font；Cinzel/ZCOOL/Noto via <link>）
  page.tsx           # RSC 壳，渲染 <ImportExperience />
components/
  ui/                # shadcn 风格原语（Button/Input/Label/Badge/Skeleton/Dialog/Tooltip/Slider）
  rb/                # React Bits 移植组件（StarBorder/SpotlightCard/CountUp/Dock/Reveal）
  mockup/            # 可视化背景组件（Galaxy/Starfield/EmotionGalaxy）+ 3 个 mock 页面
  import/            # 真实导入模块（ImportExperience/Dropzone/PasteDialog/Processing|Success|ErrorPanel/HowToExport/MobileNav/ImportGalaxy）
hooks/
  useFileRead.ts     # FileReader 读取 + 进度 + 取消
  useImportFlow.ts   # 导入状态机（idle→reading→parsing→success|error）
lib/
  utils.ts           # cn() = clsx + tailwind-merge
  parsers/           # 聊天解析（types/encoding/whatsapp/wechat/plaintext/index/format/sentiment）
components.json      # shadcn CLI 配置（后续 `npx shadcn add <name>` 直接可用）
```

## 4. 基础原语（components/ui）
Button（variants: default/secondary/ghost/outline/starlight/destructive/link · sizes: default/sm/lg/icon）、Input、Label、Badge、Skeleton、Dialog、Tooltip、Slider。
- 全部支持键盘焦点环（`focus-visible:ring-ring`）、`disabled`、`prefers-reduced-motion`。
- 新增组件优先用 `npx shadcn add <name>`，再按需把颜色类对齐到本系统 token。

## 5. 动效与无障碍
- 微交互 150–250ms，缓动 `--ease-out`（ease-out-quart）；页面/弹窗 ≤400ms。
- 所有动画在 `@media (prefers-reduced-motion: reduce)` 下降级为瞬时/淡入。
- 文字对比度：正文 ≥4.5:1；`--ink-muted` 已提亮到 `oklch(0.70 …)`。

## 6. 沉浸背景与可读性
- 单屏只跑一个 WebGL 背景（`Galaxy`），其余装饰用 CSS（`.starfield/.river-track/.lens/.reticle/.grain`）。
- 直接压在星空上的文字加 `.cosmos-text`（文字阴影）+ 全局 `.cosmos-scrim`（左侧淡暗角）提升可读性。
- 情感配色映射（Galaxy `hueShift`）：正向 ~70（琥珀）/ 中性 ~230（深空蓝）/ 负向 ~330（玫瑰）。

## 7. 导入模块 harden（已落地于真实 `/`）
critique 指出的功能缺口已在真实导入面（非 mock）一次性补齐：
- 上传状态机 `hooks/useImportFlow.ts`（idle → reading → parsing → success | error）+ `hooks/useFileRead.ts`（FileReader 进度/取消）。
- 文件校验（类型 / 20 MB 上限 / 空文件）、错误恢复（7 种 `ImportErrorCode` + 重新选择/取消/帮助）。
- 解析 `lib/parsers/`（微信 / WhatsApp / 纯文本 + UTF-8→GBK 回退，零依赖）→ 「消息数组」契约。
- help（`HowToExport`）、移动端菜单（`MobileNav`，`@radix-ui/react-dropdown-menu`）、成功预览（统计 + 星语样本）、禁用态 CTA「生成星宇·即将开放」。
- 可读性沿用 `.cosmos-text/.cosmos-scrim`；`.dropzone[data-state=dragover]` 与 `.glow-success/.glow-danger` 新增于 `app/globals.css`。
- sessionStorage 仅持久化成功态的 meta+sample 与粘贴草稿，绝不持久化原始聊天正文。

### 7.1 下一轮暂缓项
Web Worker 化解析、真实情感模型（Transformers.js）、R3F 星宇生成、截图 OCR、IndexedDB 持久化、双人授权。

## 8. 星宇漫游引擎（`/star-universe`）

R3F + three.js 全景相机，位于 [components/universe/FlyController.tsx](components/universe/FlyController.tsx)；**不使用 OrbitControls**。默认 galaxy-orbit（环绕星宇中心），解决「拖拽像原地摇镜头」——拖拽让相机**位置沿球面变化**产生视差，而非只改朝向。

### 8.1 相机状态机

| 模式 | 进入 | 行为 |
|---|---|---|
| **galaxy-orbit**（默认） | 初始 / 点虚空 / Esc | `target=[0,0,0]`；拖拽改 `orbitYaw/Pitch` → 球坐标算 `desiredPos` → `camera.position.lerp(desired, 1-pow(0.0025,dt))`，`Matrix4.lookAt`+`Quaternion.slerp` 平滑看向 target |
| **target-lock** | 点选一颗星 | `target=星位置`、`orbitDist=min(原,42)` → 镜头平滑飞近并环绕该星；Esc / 点虚空 / WASD 解锁回 orbit |
| **free-fly** | 按 WASD / 方向键 | 从真实 `camera.quaternion` 反推 yaw/pitch（无跳变）→ 临界阻尼弹簧转向 + `fwd/right` 平移；滚轮沿视线推拉 |

状态切换时统一 `syncOrbitFromCamera` / `syncFreeFromCamera` 从当前相机反推参数，保证无缝衔接。Canvas `onCreated` 使初始 `camera.lookAt(0,0,0)`。

### 8.2 输入与手势
- **拖拽**：orbit 改 `orbitYaw/Pitch`、free-fly 改第一人称 yaw/pitch；位移 >5px 判定为拖拽（不触发选星）。
- **滚轮**：orbit/target-lock 缩放 `orbitDist`（钳制 `[25,420]`，稳定不穿心）；free-fly 沿视线 dolly（阻尼衰减）。
- **点按**（未拖拽）：`raycaster.intersectObject(pointsRef)` 命中星 → `onSelect` + target-lock；命中虚空 → 解锁回 orbit + 取消选中。
- **Esc**：解锁回 orbit（与面板 Esc 取消选中并存）。

### 8.3 松手 / 空闲 / 移动端
- **松手无释放惯性**（刻意）：`orbitYaw` 冻结，相机由 lerp 平滑滑到松手位后**自然停住**，不继续公转/旋转镜头。
- **空闲巡航**：仅 orbit 模式、`IDLE_DELAY` 无操作、非 reduced-motion → `orbitYaw += 慢速`；任意输入即停（不快速接管）。
- **移动端**：canvas `touch-action:none` + `setPointerCapture` → 拖拽不滚页面；`pointercancel` 只清状态、不触发选星。

### 8.4 性能
- 热路径复用 `useRef` 的 `Vector3/Quaternion/Matrix4`（零分配）；组件卸载清理全部监听。
- 选星用 `pointsRef` 射线检测，与最终相机姿态一致；数据星为自定义闪烁 shader（顶点属性 `aColor/aPhase`），射线检测走几何 position 不受 shader 影响。

### 8.5 调节旋钮（`FlyController.tsx` 顶部常量）
`SMOOTH=0.0025`（orbit 跟手 / 松手滑停时长，越小越柔越长）· `ORBIT_GAIN=0.005` · `FREE_GAIN=0.0026` · `PITCH_LIMIT=1.4` · `MIN/MAX_DIST=25/420` · `LOCK_DIST=42` · `IDLE_DELAY=8000` · `IDLE_ORBIT_SPEED=0.04` · `SPRING=0.15`。
