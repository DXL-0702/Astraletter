import EmotionGalaxy from "@/components/mockup/EmotionGalaxy"
import Starfield from "@/components/mockup/Starfield"
import StarBorder from "@/components/rb/StarBorder"
import SpotlightCard from "@/components/rb/SpotlightCard"
import CountUp from "@/components/rb/CountUp"
import Reveal from "@/components/rb/Reveal"
import {
  Upload,
  Lock,
  Sparkles,
  Telescope,
  Star,
  MessageCircle,
  Play,
} from "lucide-react"

function Eyepiece({ size = "default" }: { size?: "default" | "large" }) {
  return (
    <div className={size === "large" ? "lens aspect-square w-full max-w-[560px]" : "lens aspect-square w-full max-w-[420px]"}>
      <Starfield fixed={false} />
      <div className="reticle" />
      <div className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        RA 18h 36m · DEC +38°
      </div>
      <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-surface/70 px-2 py-1 text-[10px] text-starlight backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-starlight" />
        情感权重 · 高
      </div>
    </div>
  )
}

export default function LandingMockup() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <EmotionGalaxy className="!fixed" />
      <div className="cosmos-scrim" />
      <div className="grain" />

      {/* Top nav */}
      <header className="relative z-ui mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-starlight" />
          <span className="font-display text-sm font-semibold uppercase tracking-[0.25em]">Astraletter</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#how" className="hidden transition-colors hover:text-foreground sm:inline">如何生成</a>
          <a href="#preview" className="hidden transition-colors hover:text-foreground sm:inline">星宇预览</a>
          <a href="#privacy" className="transition-colors hover:text-foreground">隐私</a>
        </nav>
      </header>

      {/* Hero — asymmetric eyepiece */}
      <section className="relative z-ui mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-20 pt-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-starlight">
            <Sparkles className="h-3.5 w-3.5" />
            本地 AI · 私密生成 · 无需上传
          </div>

          <h1 className="font-display text-display mb-6 max-w-xl text-balance font-normal leading-[1.1] text-foreground">
            把你们的故事，<br className="hidden sm:block" />变成璀璨星空
          </h1>

          <p className="cosmos-text mb-10 max-w-md text-lg text-muted-foreground">
            导入聊天记录，让浏览器里的本地 AI，为你们生成一座可漫游、可纪念的 3D 关系星宇。
          </p>

          <div className="flex flex-wrap items-center gap-5">
            <StarBorder as="button" className="star-cta" color="oklch(0.80 0.16 80)" speed="5s">
              <Upload className="h-5 w-5" />
              导入聊天记录
            </StarBorder>
            <button className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
              或粘贴一段文本
            </button>
          </div>

          <div id="privacy" className="cosmos-text mt-10 flex items-center gap-2 text-xs text-muted-foreground">
            <Lock />
            <span>原始聊天记录永不上传，所有解析与生成都在本地完成</span>
          </div>
        </div>

        {/* Eyepiece product window */}
        <div className="flex justify-center lg:justify-end">
          <Eyepiece />
        </div>
      </section>

      {/* Stats band */}
      <section className="relative z-ui mx-auto w-full max-w-6xl px-6 pb-8">
        <Reveal>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "消息总数", value: 12482, suffix: "" },
              { label: "高光时刻", value: 56, suffix: "" },
              { label: "深夜对话", value: 18, suffix: "%" },
              { label: "星座", value: 4, suffix: " 座" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-surface/50 p-4 text-center backdrop-blur">
                <div className="font-display text-3xl text-foreground">
                  <CountUp to={s.value} duration={2} separator="," />
                  <span className="text-starlight">{s.suffix}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* How it works — light river chapters */}
      <section id="how" className="relative z-ui mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal>
          <h2 className="font-display text-3xl mb-3 text-foreground">沿着光河，回溯你们的关系</h2>
          <p className="cosmos-text mb-12 max-w-xl text-muted-foreground">每一段对话化作一颗星，话题聚成星座，时间汇成光河。</p>
        </Reveal>

        <div className="river-track mb-10" />

        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: <Lock className="h-5 w-5 text-starlight" />, title: "本地导入", desc: "微信 / WhatsApp TXT、纯文本或截图 OCR，数据不出设备。" },
            { icon: <Telescope className="h-5 w-5 text-magic" />, title: "本地 AI 解析", desc: "情感极性、话题聚类、诗意星座命名，全部在浏览器完成。" },
            { icon: <Star className="h-5 w-5 text-starlight" />, title: "星宇漫游", desc: "宏观俯瞰或沿光河飞行，点击星星读取那一刻的对话。" },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 0.1}>
              <SpotlightCard className="h-full">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-elevated">
                  {c.icon}
                </div>
                <div className="mb-2 font-mono text-xs text-muted-foreground">0{i + 1}</div>
                <h3 className="font-display text-xl mb-2 text-foreground">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Product experience — masked lens */}
      <section id="preview" className="relative z-ui mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Eyepiece size="large" />
            <div>
              <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-magic">
                <MessageCircle className="h-3.5 w-3.5" />
                星语翻译
              </div>
              <h2 className="font-display text-3xl mb-4 text-foreground">
                这是你们的故事，可能变成的样子
              </h2>
              <p className="cosmos-text mb-6 max-w-md text-muted-foreground">
                每颗星都是一条消息；亮度来自情感权重，颜色来自情绪，连线代表对话的连贯。
              </p>
              <blockquote className="border-l-2 border-starlight/40 pl-4 font-display text-lg leading-relaxed text-foreground/90">
                “旧地重游的星光，把一次普通的路过，变成了想念的坐标。”
              </blockquote>
              <StarBorder as="button" className="star-cta mt-8" color="oklch(0.65 0.18 270)" speed="6s">
                <Play className="h-4 w-4" />
                进入星宇
              </StarBorder>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="cosmos-text relative z-ui mx-auto w-full max-w-6xl px-6 py-10 text-center text-xs text-muted-foreground">
        Astraletter · 将私密对话升华为情感艺术品 ·
        <a href="#privacy" className="ml-1 underline-offset-4 hover:text-foreground hover:underline">隐私承诺</a>
      </footer>
    </div>
  )
}
