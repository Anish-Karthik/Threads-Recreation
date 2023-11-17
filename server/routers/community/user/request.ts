import { publicProcedure, router } from "@/server/trpc"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import {
  isPendingRequest,
  rejectUserRequest,
} from "@/lib/actions/community.actions"
import { acceptCommunityInvite } from "@/lib/actions/user.actions"

export const requestRouter = router({
  accept: publicProcedure
    .input(z.object({ cid: z.string(), uid: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { cid, uid } = input
        await acceptCommunityInvite(cid, uid)
        return { success: true }
      } catch (error) {
        console.error("Error accepting community request: ", error)
        throw new TRPCError({
          message: error.message,
          code: "INTERNAL_SERVER_ERROR",
        })
      }
    }),

  reject: publicProcedure
    .input(z.object({ cid: z.string(), uid: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { cid, uid } = input
        await rejectUserRequest(cid, uid)

        return { success: true }
      } catch (error) {
        console.error("Error rejecting community join request: ", error)
        throw new TRPCError({
          message: error.message,
          code: "INTERNAL_SERVER_ERROR",
        })
      }
    }),

  isPending: publicProcedure
    .input(z.object({ cid: z.string(), uid: z.string() }))
    .query(async ({ input }) => {
      try {
        const { cid, uid } = input
        return await isPendingRequest(cid, uid)
      } catch (error) {
        console.error("Error checking if user is moderator: ", error)
        throw new TRPCError({
          message: error.message,
          code: "INTERNAL_SERVER_ERROR",
        })
      }
    }),
})
