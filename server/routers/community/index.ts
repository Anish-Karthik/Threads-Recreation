import { TRPCError } from "@trpc/server"
import { z } from "zod"

import {
  createCommunity,
  deleteCommunity,
  fetchCommunities,
  fetchCommunityDetails,
  fetchCommunityDetailsById,
  updateCommunityInfo,
} from "@/lib/actions/community.actions"

import { publicProcedure, router } from "../../trpc"
import { communityThreadRouter } from "./thread"
import { communityUserRouter } from "./user"

export const communityRouter = router({
  user: communityUserRouter,
  thread: communityThreadRouter,
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        cid: z.string(),
        image: z.string(),
        bio: z.string(),
        createdById: z.string(),
        joinMode: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { name, cid, image, bio, createdById, joinMode } = input
        const newCommunity = await createCommunity({
          name,
          cid,
          image,
          bio,
          createdById,
          joinMode,
        })
        return newCommunity
      } catch (error) {
        console.error("Error creating community:", error)
        throw new TRPCError({ message: error.message, code: "CONFLICT" })
      }
    }),

  get: publicProcedure.input(z.string().min(1)).query(async ({ input }) => {
    try {
      const communityDetails = await fetchCommunityDetails(input)
      return communityDetails
    } catch (error) {
      console.error("Error fetching community details:", error)
      throw new TRPCError({
        message: error.message,
        code: "INTERNAL_SERVER_ERROR",
      })
    }
  }),

  getById: publicProcedure.input(z.string().min(1)).query(async ({ input }) => {
    try {
      const communityDetails = await fetchCommunityDetailsById(input)
      return communityDetails
    } catch (error) {
      console.error("Error fetching community details:", error)
      throw new TRPCError({
        message: error.message,
        code: "INTERNAL_SERVER_ERROR",
      })
    }
  }),

  getAll: publicProcedure
    .input(
      z.object({
        searchString: z.string().optional(),
        pageNumber: z.number().optional(),
        pageSize: z.number().optional(),
        sortBy: z.enum(["asc", "desc"]).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const {
          searchString = "",
          pageNumber = 1,
          pageSize = 20,
          sortBy = "desc",
        } = input
        const communities = await fetchCommunities({
          searchString,
          pageNumber,
          pageSize,
          sortBy,
        })
        return communities
      } catch (error) {
        console.error("Error fetching communities:", error)
        throw new TRPCError({
          message: error.message,
          code: "INTERNAL_SERVER_ERROR",
        })
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        name: z.string(),
        cid: z.string(),
        image: z.string(),
        bio: z.string(),
        joinMode: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { name, cid, image, bio, joinMode } = input
        const updatedCommunity = await updateCommunityInfo({
          name,
          cid,
          image,
          bio,
          joinMode,
        })

        if (!updatedCommunity) {
          throw new Error("Community not found")
        }

        return updatedCommunity
      } catch (error) {
        // Handle any errors
        console.error("Error updating community information:", error)
        throw new TRPCError({
          message: error.message,
          code: "INTERNAL_SERVER_ERROR",
        })
      }
    }),

  delete: publicProcedure
    .input(z.object({ cid: z.string(), path: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { cid, path } = input
        const deletedCommunity = await deleteCommunity(cid, path)
        return deletedCommunity
      } catch (error) {
        console.error("Error deleting community: ", error)
        throw new TRPCError({
          message: error.message,
          code: "INTERNAL_SERVER_ERROR",
        })
      }
    }),
})
