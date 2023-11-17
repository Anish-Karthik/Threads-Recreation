import { revalidatePath } from "next/cache"
import { z } from "zod"

import { getActivityLikedByUser } from "@/lib/actions/activity.actions"
import {
  addMemberToCommunity,
  deleteCommunity,
  fetchCommunityDetails,
} from "@/lib/actions/community.actions"
import { deleteThread } from "@/lib/actions/thread.actions"
import { fetchUser } from "@/lib/actions/user.actions"
import db from "@/lib/db"

import { publicProcedure, router } from "../trpc"

const UpdateUserProps = z.object({
  userId: z.string(),
  username: z.string(),
  name: z.string(),
  image: z.string(),
  bio: z.string(),
  path: z.string(),
})

export const userRouter = router({
  updateUser: publicProcedure
    .input(UpdateUserProps)
    .mutation(async ({ input }) => {
      try {
        await db.users.upsert({
          where: {
            uid: input.userId,
          },
          update: {
            username: input.username.toLowerCase(),
            name: input.name,
            image: input.image,
            bio: input.bio,
            onboarded: true,
            updatedAt: new Date(),
          },
          create: {
            uid: input.userId,
            username: input.username.toLowerCase(),
            name: input.name,
            image: input.image,
            bio: input.bio,
            onboarded: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })

        if (input.path === "/profile/edit") {
          revalidatePath(input.path)
        }
      } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
      }
    }),
  fetchUser: publicProcedure.input(z.string()).query(async ({ input }) => {
    try {
      return await db.users.findUnique({
        where: {
          uid: input,
        },
        include: {
          communities: true,
          threads: true,
          likedThreads: true,
          createdCommunities: true,
          invitedCommunities: true,
          moderatedCommunities: true,
          requestedCommunities: true,
        },
      })
    } catch (error: any) {
      throw new Error(`Failed to fetch user: ${error.message}`)
    }
  }),
  fetchUserPosts: publicProcedure.input(z.string()).query(async ({ input }) => {
    try {
      const threads = await db.users.findUnique({
        where: {
          uid: input,
        },
        include: {
          communities: true,
          likedThreads: true,
          threads: {
            include: {
              children: {
                include: {
                  author: true,
                },
              },
              community: true,
              author: true,
            },
          },
        },
      })

      return threads
    } catch (error: any) {
      throw new Error(`Failed to fetch user posts: ${error.message}`)
    }
  }),
  fetchUsers: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        searchString: z.string().optional(),
        pageNumber: z.number().optional(),
        pageSize: z.number().optional(),
        sortBy: z.enum(["asc", "desc"]).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const {
          userId,
          searchString = "",
          pageNumber = 1,
          pageSize = 20,
          sortBy = "desc",
        } = input
        const skipAmount = (pageNumber - 1) * pageSize

        type QueryType = {
          OR: [
            {
              name: {
                contains: string
                mode: "insensitive"
              }
            },
            {
              username: {
                contains: string
                mode: "insensitive"
              }
            }
          ]
          NOT: {
            uid: string
          }
        }

        const query: QueryType = {
          OR: [
            {
              name: {
                contains: searchString,
                mode: "insensitive",
              },
            },
            {
              username: {
                contains: searchString,
                mode: "insensitive",
              },
            },
          ],
          NOT: {
            uid: userId,
          },
        }

        const users = await db.users.findMany({
          where: query as typeof query,
          select: {
            uid: true,
            name: true,
            username: true,
            image: true,
          },
          orderBy: {
            createdAt: sortBy,
          },
          skip: skipAmount,
          take: pageSize,
        })

        const totalUsersCount = await db.users.count({
          where: query,
        })

        const isNext = totalUsersCount > skipAmount + users.length
        return { users, isNext }
      } catch (error: any) {
        throw new Error(`Failed to fetch users: ${error.message}`)
      }
    }),
  deleteUser: publicProcedure
    .input(
      z.object({
        uid: z.string(),
        path: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { uid, path } = input
        const user = await fetchUser(uid)
        if (!user) {
          throw new Error("User not found")
        }

        const userThreads = await db.threads.findMany({
          where: {
            authorId: user.id,
          },
        })

        for (const thread of userThreads) {
          await deleteThread(thread.id, path)
        }

        const userLikedThreads = await getActivityLikedByUser(user.id)

        for (const thread of userLikedThreads) {
          await db.threads.update({
            where: {
              id: thread.id,
            },
            data: {
              likedBy: {
                disconnect: {
                  id: user.id,
                },
              },
            },
          })
        }

        const userCreatedCommunities = await db.communities.findMany({
          where: {
            createdById: user.id,
          },
        })

        for (const community of userCreatedCommunities) {
          await deleteCommunity(community.cid, path)
        }

        await db.users.delete({
          where: {
            uid,
          },
        })

        revalidatePath(path)
      } catch (error: any) {
        throw new Error(`Failed to delete user: ${error.message}`)
      }
    }),
  fetchInvitedCommunities: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
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
        throw error
      }
    }),
  requestToJoinCommunity: publicProcedure
    .input(
      z.object({
        cid: z.string(),
        uid: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { cid, uid } = input
        const user = await fetchUser(uid)
        const community = await fetchCommunityDetails(cid)

        if (!community) {
          throw new Error("Community not found")
        }
        if (!user) {
          throw new Error("User not found")
        }

        if (community.requestsIds.includes(user.id)) {
          throw new Error("Already requested")
        }
        if (community.membersIds.includes(user.id)) {
          throw new Error("Already a member")
        }

        await db.communities.update({
          where: {
            cid: cid,
          },
          data: {
            requests: {
              connect: {
                id: user.id,
              },
            },
          },
        })

        return { success: true }
      } catch (error) {
        console.error("Error Requesting to community: ", error)
        throw error
      }
    }),
  acceptCommunityInvite: publicProcedure
    .input(
      z.object({
        cid: z.string(),
        uid: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { cid, uid } = input
        const community = await fetchCommunityDetails(cid)
        const user = await fetchUser(uid)

        if (!community) {
          throw new Error("Community not found")
        }
        if (!user) {
          throw new Error("User not found")
        }

        await db.communities.update({
          where: {
            cid: cid,
          },
          data: {
            invites: {
              disconnect: {
                id: user.id,
              },
            },
          },
        })

        await db.users.update({
          where: {
            uid: uid,
          },
          data: {
            invitedCommunities: {
              disconnect: {
                id: community.id,
              },
            },
          },
        })

        await addMemberToCommunity(cid, uid)

        return { success: true }
      } catch (error) {
        console.error("Error accepting community invite: ", error)
        throw error
      }
    }),
  rejectCommunityInvite: publicProcedure
    .input(
      z.object({
        cid: z.string(),
        uid: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { cid, uid } = input
        const community = await fetchCommunityDetails(cid)
        const user = await fetchUser(uid)

        if (!community) {
          throw new Error("Community not found")
        }
        if (!user) {
          throw new Error("User not found")
        }

        await db.communities.update({
          where: {
            cid: cid,
          },
          data: {
            invites: {
              disconnect: {
                id: user.id,
              },
            },
          },
        })

        await db.users.update({
          where: {
            uid: uid,
          },
          data: {
            invitedCommunities: {
              disconnect: {
                id: community.id,
              },
            },
          },
        })

        return { success: true }
      } catch (error) {
        console.error("Error accepting community invite: ", error)
        throw error
      }
    }),
})
