import { TRPCError } from "@trpc/server"
import { z } from "zod"

import {
  acceptCommunityInvite,
  deleteUser,
  fetchUser,
  fetchUserPosts,
  fetchUsers,
  rejectCommunityInvite,
  requestToJoinCommunity,
  updateUser,
} from "@/lib/actions/user.actions"
import db from "@/lib/db"

import { publicProcedure, router } from "../../trpc"

const UpdateUserProps = z.object({
  userId: z.string(),
  username: z.string(),
  name: z.string(),
  image: z.string(),
  bio: z.string(),
  path: z.string(),
})

export const userRouter = router({
  update: publicProcedure.input(UpdateUserProps).mutation(async ({ input }) => {
    try {
      const { userId, username, name, image, bio, path } = input
      await updateUser({ userId, username, name, image, bio, path })
    } catch (error: any) {
      throw new Error(`Failed to create/update user: ${error.message}`)
    }
  }),
  get: publicProcedure.input(z.string()).query(async ({ input }) => {
    try {
      return await fetchUser(input)
    } catch (error: any) {
      throw new Error(`Failed to fetch user: ${error.message}`)
    }
  }),

  getAll: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        searchString: z.string().optional(),
        pageNumber: z.number().optional(),
        pageSize: z.number().optional(),
        sortBy: z.enum(["asc", "desc"]).optional(),
      })
    )
    .query(
      async ({
        input: { userId, searchString, pageNumber, pageSize, sortBy },
      }) => {
        try {
          return await fetchUsers({
            userId,
            searchString,
            pageNumber,
            pageSize,
            sortBy,
          })
        } catch (error: any) {
          throw new Error(`Failed to fetch users: ${error.message}`)
        }
      }
    ),
  delete: publicProcedure
    .input(
      z.object({
        uid: z.string(),
        path: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { uid, path } = input
        await deleteUser(uid, path)
      } catch (error: any) {
        throw new Error(`Failed to delete user: ${error.message}`)
      }
    }),

  thread: router({
    getAll: publicProcedure.input(z.string()).query(async ({ input }) => {
      try {
        return await fetchUserPosts(input)
      } catch (error: any) {
        throw new Error(`Failed to fetch user posts: ${error.message}`)
      }
    }),
  }),
  community: router({
    invited: router({
      getAll: publicProcedure.input(z.string()).query(async ({ input }) => {
        try {
          const invites = await db.users.findUnique({
            where: {
              uid: input,
            },
            include: {
              invitedCommunities: true,
              communities: true,
            },
          })

          return invites.invitedCommunities
        } catch (error) {
          console.error("Error fetching community invites: ", error)
          throw new TRPCError({
            message: error.message,
            code: "INTERNAL_SERVER_ERROR",
          })
        }
      }),
    }),
    request: publicProcedure
      .input(
        z.object({
          cid: z.string(),
          uid: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          requestToJoinCommunity(input.cid, input.uid)
          return { success: true }
        } catch (error) {
          console.error("Error Requesting to community: ", error)
          throw new TRPCError({
            message: error.message,
            code: "INTERNAL_SERVER_ERROR",
          })
        }
      }),
    invite: router({
      accept: publicProcedure
        .input(
          z.object({
            cid: z.string(),
            uid: z.string(),
          })
        )
        .mutation(async ({ input }) => {
          try {
            const { cid, uid } = input
            await acceptCommunityInvite(cid, uid)
            return { success: true }
          } catch (error) {
            console.error("Error accepting community invite: ", error)
            throw new TRPCError({
              message: error.message,
              code: "INTERNAL_SERVER_ERROR",
            })
          }
        }),
      reject: publicProcedure
        .input(
          z.object({
            cid: z.string(),
            uid: z.string(),
          })
        )
        .mutation(async ({ input }) => {
          try {
            const { cid, uid } = input
            await rejectCommunityInvite(cid, uid)
            return { success: true }
          } catch (error) {
            console.error("Error accepting community invite: ", error)
            throw new TRPCError({
              message: error.message,
              code: "INTERNAL_SERVER_ERROR",
            })
          }
        }),
    }),
  }),
})
