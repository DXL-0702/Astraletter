<div align="center">

# ✨ Astraletter

**把你们的故事，变成璀璨星空**

<p>
  <img src="https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-new--york-E4E4E7?style=flat-square" alt="shadcn/ui" />
</p>

</div>

---

## 🌌 项目简介

**Astraletter** 是一个将私密对话转化为可交互 3D 关系星宇的项目。

把你们的聊天记录，升华为情感艺术品，让你以全新视角回溯、探索、纪念一段关系。隐私优先——原始聊天记录永不离设备。

---

## 📈 开发进度快照（2026-07-15）

> 当前阶段：**Phase 1 · 星宇初现（M1/M3 已完成，准备首次部署验证）**

| 模块 | 状态 | 说明 |
|------|------|------|
| 项目脚手架 | ✅ | Next.js 14 + TypeScript + App Router |
| 设计系统 | ✅ | 两层 OKLCH token + shadcn/ui + lucide + React Bits 移植 + 字体（Sora / Marcellus / Noto Serif SC） |
| 聊天记录解析 | ✅ | 微信 / WhatsApp / 纯文本 + UTF-8→GBK 回退，零依赖 |
| 真实导入面 | ✅ | 状态机、文件校验、错误恢复、帮助、移动端导航 |
| 确定性星宇生成 | ✅ | `lib/universe/generate.ts` 将消息映射为星辰、时间窗星座、情感启发式颜色与亮度 |
| 3D 星图渲染 | ✅ | R3F + three.js 点云星场、中心恒星云、星座连线、Bloom、冷暖星云氛围 |
| 全景漫游交互 | ✅ | 自研 `FlyController`：orbit / target-lock / free-fly、拖拽视差、滚轮缩放、WASD 飞行、点击选星 |
| 本地 AI 增强 | ⏸ Phase 1.5 | Transformers.js worker 代码保留但未接线，不进入当前活动构建路径 |
| 首次部署 | 🚧 准备中 | 计划 Vercel 托管 + 阿里云域名解析；首轮保留 Google Fonts 并观察真实首屏表现 |

状态图例：✅ 已落地 · 🚧 进行中 / 准备中 · ⏸ 暂缓 · ⏳ 未开始

---

## 🚀 功能与状态

> ✅ 已落地 · 🚧 准备中 · ⏸ 暂缓 · ⏳ 未开始（详见 [开发进度快照](#-开发进度快照2026-07-15)）

### 1. 数据导入与隐私保护
- ✅ 微信 / WhatsApp TXT 导入（含 GBK 编码回退）
- ✅ 纯文本对话粘贴
- 🚧 本地 OCR 截图提取
- 🚧 端到端加密存储

### 2. 宇宙生成引擎
- ✅ 启发式情感极性分析（当前用于星辰颜色与导入背景色相）
- ✅ 确定性星图结构生成（时间螺旋、消息权重、时间窗星座、稳定随机种子）
- ⏸ 智能话题聚类（Transformers.js 增强暂缓至 Phase 1.5）
- 🚧 诗意星座命名

### 3. 3D 交互体验
- ✅ 宏观环绕 / 目标锁定 / 第一人称飞行基础漫游
- ✅ 点击星辰查看原始消息与情感标签
- 🚧 光河时间轴与完整双视角 UI
- 🚧 AI 星语翻译
- 🚧 AR 模式（增强版）

### 4. 长期留存
- 🚧 星空日记 / 星系博物馆 / 纪念日提醒

---

## 🛠️ 技术栈

### 当前已落地（Phase 1）
| 层级 | 技术 |
|------|------|
| 框架 | Next.js 14（App Router）+ React 18 + TypeScript 5 |
| 样式 | Tailwind CSS 3.4 + shadcn/ui（Radix 基座）+ lucide-react |
| 动效 | motion（v12）|
| 3D 星宇 | React Three Fiber + Three.js + Drei + R3F Postprocessing |
| 背景 | ogl 导入页星云 + R3F 星宇页星云/点云 |
| 包管理 | npm |

### 后续阶段规划（待接线 / 待引入）
| 层级 | 技术 | 阶段 |
|------|------|------|
| 本地 AI | Transformers.js（情感 / 嵌入 / 聚类） | Phase 1.5 |
| 光河 / 星语 | R3F Tube/粒子 + 本地或授权 AI 改写 | Phase 2 |
| 后端 | Hono + Bun + Neon (PostgreSQL) + Drizzle ORM | Phase 3 |
| 实时 / 认证 | Socket.io + Lucia Auth | Phase 3 |

> 完整目标架构见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

---

## 📅 开发路线图

| 阶段 | 目标 | 状态 |
|------|------|------|
| **Phase 1** | 星宇初现 — TXT 导入 + 本地解析 + 确定性 3D 星图 | ✅ M1/M3 完成，待首次部署与真实设备验证 |
| **Phase 1.5** | 本地 AI 增强 — 情感 / 嵌入 / 聚类 | ⏸ 暂缓 |
| **Phase 2** | 光河漫游 — 时间光河 + 视角 UI + 星语翻译 | ⏳ |
| **Phase 3** | 双人与社交 — 授权机制 + 后端 + AR 模式 | ⏳ |

---

## 🎯 项目哲学

> 我们相信，每一段对话都值得被珍视。Astraletter 让你们的故事以最浪漫的方式永存。

---

## 📄 相关文档

- [设计系统](./DESIGN.md) — token 架构、命名约定、目录结构（Phase 1 UI 框架单一事实来源）
- [架构文档](./ARCHITECTURE.md) — 目标技术架构
- 内部文档（不随仓库公开）：功能规划、开发计划、MVP 执行计划

---

<div align="center">
Made with ❤️ and ✨
</div>
