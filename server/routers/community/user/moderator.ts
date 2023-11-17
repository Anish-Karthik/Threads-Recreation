import { publicProcedure, router } from "@/server/trpc"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import {
  addModerator,
  fetchCommunityDetails,
  isCommunityModerator,
  removeModerator,
} from "@/lib/actions/community.actions"

export const moderatorRouter = router({
  isModerator: publicProcedure
    .input(z.object({ cid: z.string(), uid: z.string() }))
    .query(async ({ input }) => {
      try {
        const { cid, uid } = input
        return await isCommunityModerator(cid, uid)
      } catch (error) {
        console.error("Error checking if user is moderator: ", error)
        throw new TRPCError({
          message: error.message,
          code: "INTERNAL_SERVER_ERROR",
        })
      }
    }),

  getAll: publicProcedure
    .input(z.object({ cid: z.string() }))
    .query(async ({ input }) => {
      try {
        const { cid } = input
        const community = await fetchCommunityDetails(cid)

        if (!community) {
          throw new Error("Community not found")
        }

        return community.moderators
      } catch (error) {
        console.error("Error fetching moderators: ", error)
        throw new TRPCError({
          message: error.message,
          code: "INTERNAL_SERVER_ERROR",
        })
      }
    }),

  add: publicProcedure
    .input(z.object({ cid: z.string(), uid: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { cid, uid } = input
        await addModerator(cid, uid)

        return { success: true }
      } catch (error) {
        console.error("Error adding moderator: ", error)
        throw new TRPCError({ message: error.message, code: "CONFLICT" })
      }
    }),

  remove: publicProcedure
    .input(z.object({ cid: z.string(), uid: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { cid, uid } = input
        await removeModerator(cid, uid)

        return { success: true }
      } catch (error) {
        console.error("Error removing moderator: ", error)
        throw new TRPCError({
          message: error.message,
          code: "INTERNAL_SERVER_ERROR",
        })
      }
    }),
})
