export function AppFooter() {
  return (
    <footer className="border-t border-border/70 bg-secondary/20">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-sm font-semibold text-foreground">Review Guardian</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Trust Before You Buy.
        </p>

        <p className="mt-4 max-w-xl text-xs text-pretty wrap-break-word text-muted-foreground">
          Review Guardian은 소비자가 상품과 후기를 근거에 기반해 판단할 수
          있도록 돕는 것을 목표로 합니다.
        </p>
      </div>
    </footer>
  )
}
