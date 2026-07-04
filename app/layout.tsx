import type { Metadata } from "next"
import "./globals.css"

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
      <body>{children}</body>
    </html>
  )
}
