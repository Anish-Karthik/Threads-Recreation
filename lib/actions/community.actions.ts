import { revalidatePath } from "next/cache"

import db from "@/lib/db"

import { deleteThread } from "./thread.actions"
import { fetchUser } from "./user.actions"

type SortOrder = "asc" | "desc"

export async function isAlreadyCommunity(cid: string) {
  try {
    const community = await db.communities.findUnique({
      where: {
        cid: cid,
      },
    })
    return !!community && cid !== community?.cid
  } catch (error) {
    // Handle any errors
    console.error("Error checking if community exists:", error)
    throw error
  }
}

export async function createCommunity({
  name,
  cid,
  image,
  bio,
  createdById,
  joinMode,
}: {
  name: string
  cid: string
  image: string
  bio: string
  createdById: string
  joinMode: string
}) {
  try {
    // Find the user with the provided unique id
    const user = await fetchUser(createdById)

    if (!user) {
      throw new Error("User not found") // Handle the case if the user with the id is not found
    }
    if (await isAlreadyCommunity(cid)) {
      throw new Error("Community with this cid already exists") // Handle the case if the user with the id is not found
    }

    const newCommunity = await db.communities.create({
      data: {
        name,
        cid,
        image,
        bio,
        joinMode,
        createdById: user.id,
        members: {
          connect: {
            id: user.id,
          },
        },
        moderators: {
          connect: {
            id: user.id,
          },
        },
      },
    })

    // Update User model
    await db.users.update({
      where: {
        id: user.id,
      },
      data: {
        communities: {
          connect: {
            cid: newCommunity.cid,
          },
        },
        createdCommunities: {
          connect: {
            cid: newCommunity.cid,
          },
        },
        moderatedCommunities: {
          connect: {
            cid: newCommunity.cid,
          },
        },
      },
    })

    return newCommunity
  } catch (error) {
    // Handle any errors
    console.error("Error creating community:", error)
    throw error
  }
}

export async function fetchCommunityDetails(id: string | null) {
  try {
    if (!id) return null

    const communityDetails = await db.communities.findUnique({
      where: {
        cid: id,
      },
      include: {
        createdBy: true,
        members: true,
        threads: true,
        moderators: true,
        requests: true,
        invites: true,
      },
    })

    return communityDetails ?? null
  } catch (error) {
    // Handle any errors
    console.error("Error fetching community details:", error)
    throw error
  }
}
export async function fetchCommunityDetailsById(id: string | null) {
  try {
    if (!id) return null

    const communityDetails = await db.communities.findUnique({
      where: {
        id: id,
      },
      include: {
        createdBy: true,
        members: true,
        threads: true,
        moderators: true,
        requests: true,
        invites: true,
      },
    })

    return communityDetails ?? null
  } catch (error) {
    // Handle any errors
    console.error("Error fetching community details:", error)
    throw error
  }
}

export async function fetchCommunityPosts(id: string) {
  try {
    const communityPosts = await db.communities.findUnique({
      where: {
        cid: id,
      },
      include: {
        threads: {
          include: {
            author: true,
            children: {
              include: {
                author: true,
              },
            },
          },
        },
      },
    })

    return communityPosts
  } catch (error) {
    // Handle any errors
    console.error("Error fetching community posts:", error)
    throw error
  }
}

export async function fetchCommunities({
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  searchString?: string
  pageNumber?: number
  pageSize?: number
  sortBy?: SortOrder
}) {
  try {
    // Calculate the number of communities to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i")

    // Create an initial query object to filter communities.

    type QueryType = {
      OR: [
        {
          name: {
            contains: string
            mode: "insensitive"
          }
          cid: {
            contains: string
            mode: "insensitive"
          }
        }
      ]
    }
    // what condition to use if searchString is empty ,then return all communities?

    const query: QueryType = {
      OR: [
        {
          name: {
            contains: searchString,
            mode: "insensitive",
          },
          cid: {
            contains: searchString,
            mode: "insensitive",
          },
        },
      ],
    }

    // Define the sort options for the fetched communities based on createdAt field and provided sort order.
    const sortOptions = { createdAt: sortBy }

    const communities = await db.communities.findMany({
      where: {
        ...query,
      },
      orderBy: {
        createdAt: sortBy,
      },
      skip: skipAmount,
      take: pageSize,
      include: {
        members: true,
      },
    })

    // Count the total number of communities that match the search criteria (without pagination).
    const totalCommunitiesCount = await db.communities.count({
      where: {
        ...query,
      },
    })

    // Check if there are more communities beyond the current page.
    const isNext = totalCommunitiesCount > skipAmount + communities.length

    return { communities, isNext }
  } catch (error) {
    console.error("Error fetching communities:", error)
    throw error
  }
}

export async function addMemberToCommunity(
  communityId: string,
  memberId: string
) {
  try {
    // Find the community by its unique id
    const community = await db.communities.findUnique({
      where: {
        cid: communityId,
      },
      include: {
        members: true,
      },
    })
    // Find the user by their unique id
    const user = await fetchUser(memberId)

    if (!community) {
      throw new Error("Community not found")
    }
    if (!user) {
      throw new Error("User not found")
    }

    // Check if the user is already a member of the community
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
}

export async function removeUserFromCommunity(cid: string, uid: string) {
  try {
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
}

export async function updateCommunityInfo({
  name,
  cid,
  image,
  bio,
  joinMode,
}: {
  name: string
  cid: string
  image: string
  bio: string
  joinMode: string
}) {
  try {
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
}

export async function deleteCommunity(cid: string, path: string) {
  try {
    // Find the community by its ID and delete it
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
}

export async function isCommunityMember(cid: string, id: string) {
  try {
    const communities = await fetchCommunityDetails(cid)

    if (!communities) {
      throw new Error("Community not found")
    }

    return !!communities.membersIds.includes(id)
  } catch (error) {}
}

export async function inviteUserToCommunity(cid: string, uid: string) {
  try {
    const community = await fetchCommunityDetails(cid)
    const user = await fetchUser(uid)
    if (!community) {
      throw new Error("Community not found")
    }
    if (!user) {
      throw new Error("User not found")
    }
    if (community.invitesIds.includes(user.id))
      throw new Error("User already invited")
    if (community.membersIds.includes(user.id))
      throw new Error("User already member")

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
}

export async function acceptUserRequest(cid: string, uid: string) {
  try {
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

    // update community
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

    // update user
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
}

// reject user request
export async function rejectUserRequest(cid: string, uid: string) {
  try {
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

    // update community
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

    // update user
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
}

export async function fetchRequestedUsers(cid: string) {
  try {
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
}

export async function isCommunityModerator(cid: string, uid: string) {
  try {
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
}

export async function isPendingRequest(cid: string, uid: string) {
  try {
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
}

export async function fetchModerators(cid: string) {
  try {
    const community = await fetchCommunityDetails(cid)

    if (!community) {
      throw new Error("Community not found")
    }

    return community.moderators
  } catch (error) {
    console.error("Error fetching moderators: ", error)
    throw error
  }
}

// add moderator
export async function addModerator(cid: string, uid: string) {
  try {
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
}

// remove moderator
export async function removeModerator(cid: string, uid: string) {
  try {
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
}
