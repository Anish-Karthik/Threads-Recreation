import { publicProcedure, router } from "@/server/trpc"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import {
  addMemberToCommunity,
  fetchRequestedUsers,
  inviteUserToCommunity,
  isCommunityMember,
  removeUserFromCommunity,
} from "@/lib/actions/community.actions"

import { moderatorRouter } from "./moderator"
import { requestRouter } from "./request"

export const communityUserRouter = router({
  request: requestRouter,
  moderator: moderatorRouter,
  getAll: publicProcedure
    .input(z.object({ cid: z.string() }))
    .query(async ({ input }) => {
      try {
        const { cid } = input
        return await fetchRequestedUsers(cid)
      } catch (error) {
        console.error("Error fetching community invites: ", error)
        throw new TRPCError({
          message: error.message,
          code: "INTERNAL_SERVER_ERROR",
        })
      }
    }),

  isMember: publicProcedure
    .input(
      z.object({ communityId: z.string().min(1), memberId: z.string().min(1) })
    )
    .query(async ({ input }) => {
      try {
        const { communityId, memberId } = input
        return await isCommunityMember(communityId, memberId)
      } catch (error) {
        console.error("Error checking if user is community member:", error)
        throw new TRPCError({
          message: error.message,
          code: "INTERNAL_SERVER_ERROR",
        })
      }
    }),

  add: publicProcedure
    .input(z.object({ communityId: z.string(), memberId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { communityId, memberId } = input
        const community = await addMemberToCommunity(communityId, memberId)

        return community
      } catch (error) {
        console.error("Error adding member to community:", error)
        throw new TRPCError({ message: error.message, code: "CONFLICT" })
      }
    }),

  remove: publicProcedure
    .input(z.object({ cid: z.string(), uid: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { cid, uid } = input
        await removeUserFromCommunity(cid, uid)
        return { success: true }
      } catch (error) {
        // Handle any errors
        console.error("Error removing user from community:", error)
        throw new TRPCError({
          message: error.message,
          code: "INTERNAL_SERVER_ERROR",
        })
      }
    }),

  invite: publicProcedure
    .input(z.object({ cid: z.string(), uid: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { cid, uid } = input
        await inviteUserToCommunity(cid, uid)

        return { success: true }
      } catch (error) {
        console.error("Error inviting user to community: ", error)
        throw new TRPCError({
          message: error.message,
          code: "INTERNAL_SERVER_ERROR",
        })
      }
    }),
})
