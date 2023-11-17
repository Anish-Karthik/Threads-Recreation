import { publicProcedure, router } from "@/server/trpc"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { fetchCommunityPosts } from "@/lib/actions/community.actions"

export const communityThreadRouter = router({
  getAll: publicProcedure.input(z.string()).query(async ({ input }) => {
    try {
      const communityPosts = await fetchCommunityPosts(input)
      return communityPosts
    } catch (error) {
      console.error("Error fetching community posts:", error)
      throw new TRPCError({
        message: error.message,
        code: "INTERNAL_SERVER_ERROR",
      })
    }
  }),
})
