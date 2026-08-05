import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

function RootLayout() {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-dvh">
        <Outlet />
      </main>

      <TanStackRouterDevtools />
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}

export const Route = createRootRoute({ component: RootLayout })
