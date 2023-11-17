import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
  addMemberToCommunity,
  createCommunity,
  deleteCommunity,
  fetchCommunities,
  fetchCommunityDetails,
  fetchCommunityDetailsById,
  fetchCommunityPosts,
  removeUserFromCommunity,
} from "@/lib/actions/community.actions"
import { deleteThread } from "@/lib/actions/thread.actions"
import { fetchUser } from "@/lib/actions/user.actions"
import db from "@/lib/db"

import { publicProcedure, router } from "../trpc"

type SortOrder = "asc" | "desc"

export const communityRouter = router({
  createCommunity: publicProcedure
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
        throw error
      }
    }),

  fetchCommunityDetails: publicProcedure
    .input(z.object({ id: z.string().nullable() }))
    .query(async ({ input }) => {
      try {
        const { id } = input
        const communityDetails = await fetchCommunityDetails(id)
        return communityDetails
      } catch (error) {
        console.error("Error fetching community details:", error)
        throw error
      }
    }),

  fetchCommunityDetailsById: publicProcedure
    .input(z.object({ id: z.string().nullable() }))
    .query(async ({ input }) => {
      try {
        const { id } = input
        const communityDetails = await fetchCommunityDetailsById(id)
        return communityDetails
      } catch (error) {
        console.error("Error fetching community details:", error)
        throw error
      }
    }),

  fetchCommunityPosts: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const communityPosts = await fetchCommunityPosts(input)
        return communityPosts
      } catch (error) {
        console.error("Error fetching community posts:", error)
        throw error
      }
    }),

  fetchCommunities: publicProcedure
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
        throw error
      }
    }),
  addMemberToCommunity: publicProcedure
    .input(z.object({ communityId: z.string(), memberId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { communityId, memberId } = input
        const user = await fetchUser(memberId)
        const community = await fetchCommunityDetails(communityId)

        if (!user) {
          throw new Error("User not found")
        }

        if (!community) {
          throw new Error("Community not found")
        }

        if (community.membersIds.includes(user.id)) {
          throw new Error("User is already a member of the community")
        }

        // Add the user's id to the members array in the community
        await db.communities.update({
          where: {
            cid: communityId,
          },
          data: {
            members: {
              connect: {
                id: user.id,
              },
            },
            invites: {
              disconnect: {
                id: user.id,
              },
            },
            requests: {
              disconnect: {
                id: user.id,
              },
            },
          },
        })

        // Add the community's id to the communities array in the user
        await db.users.update({
          where: {
            uid: memberId,
          },
          data: {
            communities: {
              connect: {
                id: community.id,
              },
            },
            invitedCommunities: {
              disconnect: {
                id: community.id,
              },
            },
            requestedCommunities: {
              disconnect: {
                id: community.id,
              },
            },
          },
        })

        return community
      } catch (error) {
        // Handle any errors
        console.error("Error adding member to community:", error)
        throw error
      }
    }),

  removeUserFromCommunity: publicProcedure
    .input(z.object({ cid: z.string(), uid: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { cid, uid } = input
        const user = await fetchUser(uid)
        const community = await fetchCommunityDetails(cid)

        if (!user) {
          throw new Error("User not found")
        }

        if (!community) {
          throw new Error("Community not found")
        }

        if (!community.membersIds.includes(user.id)) {
          throw new Error("User not member")
        }

        await db.communities.update({
          where: {
            cid: cid,
          },
          data: {
            members: {
              disconnect: {
                id: user.id,
              },
            },
            moderators: {
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
            communities: {
              disconnect: {
                id: community.id,
              },
            },
            moderatedCommunities: {
              disconnect: {
                id: community.id,
              },
            },
          },
        })

        if (
          community.createdById === user.id ||
          community.membersIds.length === 0
        ) {
          await deleteCommunity(cid, "/communities/" + cid)
        }

        return { success: true }
      } catch (error) {
        // Handle any errors
        console.error("Error removing user from community:", error)
        throw error
      }
    }),

  updateCommunityInfo: publicProcedure
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
        const updatedCommunity = await db.communities.update({
          where: {
            cid: cid,
          },
          data: {
            name,
            image,
            bio,
            joinMode,
          },
        })

        if (!updatedCommunity) {
          throw new Error("Community not found")
        }

        return updatedCommunity
      } catch (error) {
        // Handle any errors
        console.error("Error updating community information:", error)
        throw error
      }
    }),

  deleteCommunity: publicProcedure
    .input(z.object({ cid: z.string(), path: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { cid, path } = input
        const community = await fetchCommunityDetails(cid)

        if (!community) {
          throw new Error("Community not found")
        }

        // Delete all threads associated with the community
        // TODO: Optimize this to delete by pagination instead of all at once (if there are a lot of threads)
        const threads = await db.threads.findMany({
          where: {
            communityId: community.id,
          },
        })

        threads.forEach(async (thread) => {
          await deleteThread(thread.id, path)
        })

        // Delete the community from the user's communities array
        community.members.forEach(async (member) => {
          await removeUserFromCommunity(cid, member.uid)
        })

        // Delete the community
        const deletedCommunity = await db.communities.delete({
          where: {
            cid: cid,
          },
        })

        revalidatePath("/")
        return deletedCommunity
      } catch (error) {
        console.error("Error deleting community: ", error)
        throw error
      }
    }),

  isCommunityMember: publicProcedure
    .input(z.object({ cid: z.string(), id: z.string() }))
    .query(async ({ input }) => {
      try {
        const { cid, id } = input
        const community = await fetchCommunityDetails(cid)

        if (!community) {
          throw new Error("Community not found")
        }

        return !!community.membersIds.includes(id)
      } catch (error) {
        console.error("Error checking if user is community member: ", error)
        throw error
      }
    }),

  inviteUserToCommunity: publicProcedure
    .input(z.object({ cid: z.string(), uid: z.string() }))
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

        if (community.invitesIds.includes(user.id)) {
          throw new Error("User already invited")
        }

        if (community.membersIds.includes(user.id)) {
          throw new Error("User already member")
        }

        await db.communities.update({
          where: {
            cid: cid,
          },
          data: {
            invites: {
              connect: {
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
              connect: {
                id: community.id,
              },
            },
          },
        })

        return { success: true }
      } catch (error) {
        console.error("Error inviting user to community: ", error)
        throw error
      }
    }),

  acceptUserRequest: publicProcedure
    .input(z.object({ cid: z.string(), uid: z.string() }))
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

        if (!community.requestsIds.includes(user.id)) {
          throw new Error("User not requested")
        }

        if (community.membersIds.includes(user.id)) {
          throw new Error("User already member")
        }

        await db.communities.update({
          where: {
            cid: cid,
          },
          data: {
            requests: {
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
            requestedCommunities: {
              disconnect: {
                id: community.id,
              },
            },
          },
        })

        await addMemberToCommunity(cid, uid)

        return { success: true }
      } catch (error) {
        console.error("Error accepting community request: ", error)
        throw error
      }
    }),

  rejectUserRequest: publicProcedure
    .input(z.object({ cid: z.string(), uid: z.string() }))
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

        if (!community.requestsIds.includes(user.id)) {
          throw new Error("User not requested")
        }

        if (community.membersIds.includes(user.id)) {
          throw new Error("User already member")
        }

        await db.communities.update({
          where: {
            cid: cid,
          },
          data: {
            requests: {
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
            requestedCommunities: {
              disconnect: {
                id: community.id,
              },
            },
          },
        })

        return { success: true }
      } catch (error) {
        console.error("Error rejecting community join request: ", error)
        throw error
      }
    }),

  fetchRequestedUsers: publicProcedure
    .input(z.object({ cid: z.string() }))
    .query(async ({ input }) => {
      try {
        const { cid } = input
        const requests = await db.communities.findUnique({
          where: {
            cid: cid,
          },
          include: {
            requests: true,
          },
        })

        return requests.requests
      } catch (error) {
        console.error("Error fetching community invites: ", error)
        throw error
      }
    }),

  isCommunityModerator: publicProcedure
    .input(z.object({ cid: z.string(), uid: z.string() }))
    .query(async ({ input }) => {
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

        return community.moderatorsIds.includes(user.id)
      } catch (error) {
        console.error("Error checking if user is moderator: ", error)
        throw error
      }
    }),

  isPendingRequest: publicProcedure
    .input(z.object({ cid: z.string(), uid: z.string() }))
    .query(async ({ input }) => {
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

        return community.requestsIds.includes(user.id)
      } catch (error) {
        console.error("Error checking if user is moderator: ", error)
        throw error
      }
    }),

  fetchModerators: publicProcedure
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
        throw error
      }
    }),

  addModerator: publicProcedure
    .input(z.object({ cid: z.string(), uid: z.string() }))
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

        if (community.moderatorsIds.includes(user.id)) {
          throw new Error("User already moderator")
        }

        await db.communities.update({
          where: {
            cid: cid,
          },
          data: {
            moderators: {
              connect: {
                id: user.id,
              },
            },
          },
        })

        return { success: true }
      } catch (error) {
        console.error("Error adding moderator: ", error)
        throw error
      }
    }),

  removeModerator: publicProcedure
    .input(z.object({ cid: z.string(), uid: z.string() }))
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

        if (!community.moderatorsIds.includes(user.id)) {
          throw new Error("User not moderator")
        }

        await db.communities.update({
          where: {
            cid: cid,
          },
          data: {
            moderators: {
              disconnect: {
                id: user.id,
              },
            },
          },
        })

        return { success: true }
      } catch (error) {
        console.error("Error removing moderator: ", error)
        throw error
      }
    }),
})
