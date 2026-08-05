import { Link } from "@tanstack/react-router"

import { ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCopilotChat } from "@/components/copilot/copilot-chat-widget"

const NAV_LINKS = [
  { hash: "features", label: "서비스 소개" },
  { hash: "how-it-works", label: "이용 방법" },
  { hash: "trust", label: "검증 원칙" },
]

export function AppHeader() {
  const { openChat } = useCopilotChat()

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" hash="top" className="flex min-w-0 items-center gap-2">
          <ShieldCheck
            className="size-6 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold text-foreground">
              Review Guardian
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              상품 추천 · 리뷰 검증
            </span>
          </span>
        </Link>

        <nav
          aria-label="주요 섹션"
          className="hidden items-center gap-6 text-sm text-muted-foreground md:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.hash}
              to="/"
              hash={link.hash}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Button type="button" size="sm" onClick={openChat} className="shrink-0">
          후기 검증 시작
        </Button>
      </div>
    </header>
  )
}
