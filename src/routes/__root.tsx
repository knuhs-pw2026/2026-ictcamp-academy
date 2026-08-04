import { Fragment } from "react"

import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

const RootLayout = () => (
  <Fragment>
    <main className="min-h-dvh">
      <Outlet />
    </main>

    <TanStackRouterDevtools />
  </Fragment>
)

export const Route = createRootRoute({ component: RootLayout })
