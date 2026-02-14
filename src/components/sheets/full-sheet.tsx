"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"

import { SheetBounce } from "@/components/motion/sheet-bounce"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type FullSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  body: ReactNode
  footer?: ReactNode
  className?: string
}

export function FullSheet({
  open,
  onOpenChange,
  title,
  description,
  body,
  footer,
  className,
}: FullSheetProps) {
  const [keyboardInset, setKeyboardInset] = useState(0)
  const [mobileViewportFrame, setMobileViewportFrame] = useState<{ top: number; height: number } | null>(null)

  useEffect(() => {
    if (!open || typeof window === "undefined" || !window.visualViewport) {
      return
    }

    const viewport = window.visualViewport
    const updateInset = () => {
      const isMobileViewport = window.matchMedia("(max-width: 639px)").matches
      if (!isMobileViewport) {
        setKeyboardInset(0)
        setMobileViewportFrame(null)
        return
      }

      const nextInset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
      const roundedInset = Math.round(nextInset)
      setKeyboardInset((prev) => (prev === roundedInset ? prev : roundedInset))

      const nextTop = Math.max(8, Math.round(viewport.offsetTop + 8))
      const nextHeight = Math.max(320, Math.round(viewport.height - 16))
      setMobileViewportFrame((prev) => {
        if (prev && prev.top === nextTop && prev.height === nextHeight) {
          return prev
        }
        return { top: nextTop, height: nextHeight }
      })
    }

    const raf = window.requestAnimationFrame(updateInset)
    viewport.addEventListener("resize", updateInset)
    viewport.addEventListener("scroll", updateInset)
    window.addEventListener("orientationchange", updateInset)

    return () => {
      window.cancelAnimationFrame(raf)
      viewport.removeEventListener("resize", updateInset)
      viewport.removeEventListener("scroll", updateInset)
      window.removeEventListener("orientationchange", updateInset)
    }
  }, [open])

  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return
    }

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target
      if (
        !(target instanceof HTMLInputElement) &&
        !(target instanceof HTMLTextAreaElement) &&
        !(target instanceof HTMLSelectElement)
      ) {
        return
      }

      window.setTimeout(() => {
        target.scrollIntoView({ block: "center", behavior: "smooth" })
      }, 120)
    }

    document.addEventListener("focusin", onFocusIn)
    return () => {
      document.removeEventListener("focusin", onFocusIn)
    }
  }, [open])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="center"
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-xl",
          className
        )}
        style={
          open && mobileViewportFrame
            ? {
                top: `${mobileViewportFrame.top}px`,
                bottom: "auto",
                height: `${mobileViewportFrame.height}px`,
              }
            : undefined
        }
      >
        <SheetBounce className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {description ? <SheetDescription>{description}</SheetDescription> : null}
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4" style={{ paddingBottom: open && keyboardInset > 0 ? keyboardInset + 16 : undefined }}>
            {body}
          </div>
          {footer ? (
            <SheetFooter style={{ paddingBottom: open && keyboardInset > 0 ? keyboardInset + 12 : undefined }}>
              {footer}
            </SheetFooter>
          ) : null}
        </SheetBounce>
      </SheetContent>
    </Sheet>
  )
}
