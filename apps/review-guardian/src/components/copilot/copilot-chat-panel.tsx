import type { RefObject } from "react"
import { motion, useReducedMotion } from "motion/react"
import { ExternalLink, Loader2, ShieldCheck, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { COPILOT_STUDIO_URL } from "@/lib/copilot"
import { cn } from "@/lib/utils"

interface CopilotChatPanelProps {
  panelId: string
  headingId: string
  isOpen: boolean
  isIframeLoaded: boolean
  showSlowLoadingHint: boolean
  onClose: () => void
  onIframeLoad: () => void
  iframeRef: RefObject<HTMLIFrameElement | null>
  headingRef: RefObject<HTMLHeadingElement | null>
}

export function CopilotChatPanel({
  panelId,
  headingId,
  isOpen,
  isIframeLoaded,
  showSlowLoadingHint,
  onClose,
  onIframeLoad,
  iframeRef,
  headingRef,
}: CopilotChatPanelProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      id={panelId}
      role="dialog"
      aria-modal="false"
      aria-labelledby={headingId}
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={cn(
        "fixed inset-0 z-50 flex flex-col overflow-hidden bg-card text-card-foreground sm:inset-auto sm:right-4 sm:bottom-24 sm:w-[min(420px,calc(100vw-2rem))] sm:rounded-2xl sm:border sm:border-border sm:shadow-2xl sm:ring-1 sm:ring-foreground/5 md:right-6",
        "sm:h-[min(680px,calc(100dvh-8rem))] sm:max-h-[calc(100dvh-6rem)]",
        !isOpen && "pointer-events-none"
      )}
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      initial={false}
      animate={
        isOpen
          ? { opacity: 1, y: 0, scale: 1 }
          : {
              opacity: 0,
              y: prefersReducedMotion ? 0 : 24,
              scale: prefersReducedMotion ? 1 : 0.98,
            }
      }
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <ShieldCheck
            className="size-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h2
              id={headingId}
              ref={headingRef}
              tabIndex={-1}
              className="truncate text-sm font-semibold outline-none"
            >
              Review Guardian
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              상품 추천 · 리뷰 검증
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="채팅창 닫기"
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </header> */}

      <div className="relative min-h-0 flex-1">
        {!isIframeLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-card px-6 text-center">
            <Loader2
              className="size-6 animate-spin text-muted-foreground"
              aria-hidden="true"
            />
            <output className="text-sm text-muted-foreground">
              채팅을 불러오는 중이에요…
            </output>
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="채팅창 닫기"
          className="absolute top-2 right-4 text-white"
        >
          <X className="size-5" aria-hidden="true" />
        </Button>

        <iframe
          ref={iframeRef}
          src={COPILOT_STUDIO_URL}
          title="Review Guardian 상품 추천 및 리뷰 검증 채팅"
          onLoad={onIframeLoad}
          className="size-full border-0"
          allow="microphone"
        />
      </div>

      {showSlowLoadingHint && (
        <div
          className="bg-caution/10 text-caution-foreground shrink-0 border-t border-border px-4 py-2.5 text-xs"
          aria-live="polite"
        >
          채팅을 불러오는 데 시간이 걸리고 있어요. 계속되지 않으면 새 창에서
          열어 주세요.
        </div>
      )}

      <Separator />

      <footer className="flex shrink-0 flex-col gap-1.5 px-4 py-3 text-xs text-muted-foreground">
        <li className="list-inside list-disc wrap-break-word">
          분석 결과는 확인 가능한 상품 및 후기 데이터에 따라 달라질 수 있습니다.
        </li>
        <li className="list-inside list-disc wrap-break-word">
          개인정보, 계정정보 또는 결제정보는 입력하지 마세요.
        </li>
      </footer>
    </motion.div>
  )
}
