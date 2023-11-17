import { appRouter } from "@/server"
import { httpBatchLink } from "@trpc/client"

export const serverClient = appRouter.createCaller({
  links: [
    httpBatchLink({
      url: "/api/trpc",
    }),
  ],
})
