import { motion, useReducedMotion } from "motion/react"
import { ShieldAlert } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const PRINCIPLES = [
  "별점만으로는 충분한 근거로 보지 않습니다.",
  "장점과 단점을 함께 고려합니다.",
  "반복되는 후기 패턴은 의심의 근거가 될 수 있으나, 조작의 증거는 아닙니다.",
  "상품 옵션과 판매자에 따라 후기 경향이 다를 수 있습니다.",
  "가격과 재고는 확인 시점에 따라 달라질 수 있습니다.",
  "최종 구매 결정의 책임은 사용자에게 있습니다.",
]

export function TrustSection() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      id="trust"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
    >
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mx-auto max-w-3xl"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-balance text-foreground sm:text-3xl">
            검증 원칙
          </h2>
          <p className="mt-3 text-sm text-pretty text-muted-foreground sm:text-base">
            Review Guardian이 후기와 상품 정보를 살펴볼 때 지키는 기준입니다.
          </p>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {PRINCIPLES.map((principle) => (
            <li
              key={principle}
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-pretty wrap-break-word text-muted-foreground"
            >
              {principle}
            </li>
          ))}
        </ul>

        <Alert className="border-caution/40 bg-caution/10 mt-8">
          <ShieldAlert className="text-caution-foreground" />
          <AlertTitle className="text-caution-foreground">
            신중한 안내 원칙
          </AlertTitle>
          <AlertDescription className="text-caution-foreground/90">
            Review Guardian은 리뷰를 근거 없이 '가짜'라고 단정하지 않습니다.
            확보된 데이터에서 나타나는 의심 패턴과 근거 수준을 신중하게
            안내합니다.
          </AlertDescription>
        </Alert>
      </motion.div>
    </section>
  )
}
