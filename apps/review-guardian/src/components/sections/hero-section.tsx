import { motion, useReducedMotion } from "motion/react"
import { ClipboardCheck, ListChecks, SearchCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useCopilotChat } from "@/components/copilot/copilot-chat-widget"

const PREVIEW_ITEMS = [
  { icon: SearchCheck, label: "상품 평가" },
  { icon: ListChecks, label: "후기 검증" },
  { icon: ClipboardCheck, label: "조건 기반 추천" },
]

export function HeroSection() {
  const { openChat } = useCopilotChat()
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      id="top"
      className="mx-auto max-w-6xl px-4 pt-14 pb-16 sm:px-6 sm:pt-20 sm:pb-24"
    >
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <p className="text-sm font-medium text-primary">
            Review Guardian · 상품 추천 · 리뷰 검증
          </p>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl">
            후기를 믿기 전에, 근거부터 확인하세요.
          </h1>

          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Trust Before You Buy.
          </p>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-pretty wrap-break-word text-muted-foreground">
            Review Guardian은 확인 가능한 상품 정보와 후기 데이터를 바탕으로
            상품의 적절성을 평가하고, 의심스러운 후기나 반복되는 주장을
            검증하며, 사용자 조건에 맞는 상품 선택을 도와드립니다.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button type="button" size="lg" onClick={openChat}>
              Review Guardian에게 물어보기
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<a href="#how-it-works" />}
            >
              이용 방법 보기
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
        >
          <Card className="p-2 ring-foreground/10">
            <div className="flex flex-col gap-3 p-3">
              {PREVIEW_ITEMS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
