import type { Metadata } from "next"
import { Sora } from "next/font/google"
import "./globals.css"
import { UniverseProvider } from "@/lib/universe/store"

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Astraletter",
  description: "将你们的故事，变成璀璨星空",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Marcellus&family=Noto+Serif+SC:wght@400;500;700&family=Sora:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={sora.variable}>
        <UniverseProvider>{children}</UniverseProvider>
      </body>
    </html>
  )
}
