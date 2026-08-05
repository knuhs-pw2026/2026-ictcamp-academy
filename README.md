# ictcamp-academy

Bun workspaces 기반 모노레포. 여러 웹 앱을 `apps/` 아래에서 관리합니다.

## 구조

```
apps/
  weather/   # 냉방쉼터/기상청 대시보드 (React + Vite + TanStack Router + shadcn/ui)
packages/    # 앱 간 공유 코드 (아직 없음)
```

## 시작하기

```bash
bun install
bun run dev      # 모든 apps/*의 dev 실행
bun run build    # 모든 apps/*의 build 실행
bun run lint
bun run typecheck
```

특정 앱만 대상으로 하려면 워크스페이스 이름으로 필터링합니다.

```bash
bun run --filter '@ictcamp-academy/weather' dev
```

## 새 앱 추가하기

1. `apps/<name>` 디렉터리를 만들고 `package.json`의 `name`을 `@ictcamp-academy/<name>`으로 지정합니다.
2. `dev`, `build`, `lint`, `typecheck` 스크립트를 다른 앱과 동일한 이름으로 맞춰두면 루트 스크립트에서 자동으로 실행됩니다.
3. `bun install`을 루트에서 다시 실행해 워크스페이스를 연결합니다.

## apps/weather에 shadcn 컴포넌트 추가하기

```bash
cd apps/weather
npx shadcn@latest add button
```

컴포넌트는 `apps/weather/src/components/ui`에 추가됩니다.
