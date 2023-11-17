import { activityRouter } from "./routers/activity"
import { communityRouter } from "./routers/community"
import { threadRouter } from "./routers/thread"
import { userRouter } from "./routers/user"
import { publicProcedure, router } from "./trpc"

export const appRouter = router({
  test: publicProcedure.query(() => {
    return { message: "Hello World" }
  }),
  user: userRouter,
  community: communityRouter,
  activity: activityRouter,
  thread: threadRouter,
})
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter
