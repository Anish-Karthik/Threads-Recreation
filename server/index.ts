import z from "zod"

import { publicProcedure, router } from "./trpc"

export const appRouter = router({
  test: publicProcedure.query(() => {
    return { message: "Hello World" }
  }),
})
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter
