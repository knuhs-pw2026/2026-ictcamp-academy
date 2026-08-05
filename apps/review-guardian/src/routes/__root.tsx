import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

import { CopilotChatProvider } from "@/components/copilot/copilot-chat-widget"
import { AppHeader } from "@/components/sections/app-header"
import { AppFooter } from "@/components/sections/app-footer"

function RootLayout() {
  return (
    <CopilotChatProvider>
      <main className="min-h-dvh">
        <AppHeader />
        <Outlet />
        <AppFooter />
      </main>

      <TanStackRouterDevtools />
    </CopilotChatProvider>
  )
}

export const Route = createRootRoute({ component: RootLayout })
