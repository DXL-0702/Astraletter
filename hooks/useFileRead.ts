"use client"

import { useCallback, useRef, useState } from "react"
import { decodeChat } from "@/lib/parsers/encoding"

interface ReadResult {
  text: string
  encoding: "utf-8" | "gbk"
}

/**
 * 原生 FileReader 封装：读取文件 → ArrayBuffer → decodeChat（UTF-8/GBK）。
 * 提供 progress（来自 onprogress）与 cancel（reader.abort()，Esc 路径）。
 * 仅在客户端使用；所有读取与解码都在本地，不上传任何字节。
 */
export function useFileRead() {
  const readerRef = useRef<FileReader | null>(null)
  const [progress, setProgress] = useState(0)
  const [isReading, setIsReading] = useState(false)

  const cancel = useCallback(() => {
    if (readerRef.current) {
      try {
        readerRef.current.abort()
      } catch {
        /* noop */
      }
      readerRef.current = null
    }
    setIsReading(false)
    setProgress(0)
  }, [])

  const read = useCallback(
    (file: File): Promise<ReadResult> =>
      new Promise<ReadResult>((resolve, reject) => {
        const reader = new FileReader()
        readerRef.current = reader
        setIsReading(true)
        setProgress(0)

        reader.onprogress = (e) => {
          if (e.lengthComputable) setProgress(e.loaded / e.total)
        }
        reader.onerror = () => {
          setIsReading(false)
          setProgress(0)
          readerRef.current = null
          reject(new Error("read-error"))
        }
        reader.onabort = () => {
          setIsReading(false)
          setProgress(0)
          readerRef.current = null
          reject(new Error("aborted"))
        }
        reader.onload = () => {
          try {
            const buf = new Uint8Array(reader.result as ArrayBuffer)
            const { text, encoding } = decodeChat(buf)
            setIsReading(false)
            setProgress(1)
            readerRef.current = null
            resolve({ text, encoding })
          } catch (err) {
            setIsReading(false)
            readerRef.current = null
            reject(err)
          }
        }

        reader.readAsArrayBuffer(file)
      }),
    []
  )

  return { read, progress, cancel, isReading }
}
