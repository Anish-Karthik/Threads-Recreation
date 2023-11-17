import { revalidatePath } from "next/cache"

import db from "@/lib/db"

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
            children: {
              include: {
                community: {
                  include: {
                    threads: true,
                  },
                },
                author: true,
              },
            },
            community: {
              include: {
                threads: true,
              },
            },
            author: true,
          },
        },
      },
    })

    return communityPosts?.threads || []
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

    // Count the total number of communities that match the search criteria (without pagination). //TODO single db query _count
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

    // Find the user by their unique id
    const user = await fetchUser(memberId)
    if (!user) {
      throw new Error("User not found")
    }
    // Add the user's id to the members array in the community
    const community = await db.communities.update({
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

    if (!user) {
      throw new Error("User not found")
    }
    const community = await db.communities.update({
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
    // Delete all threads associated with the community
    // TODO: Check if this deletes all threads and comments

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

    return (
      !!communities.membersIds.includes(id) ||
      communities.members.find((d) => d.uid === id)
    )
  } catch (error) {}
}

export async function inviteUserToCommunity(cid: string, uid: string) {
  try {
    const user = await fetchUser(uid)
    if (!user) {
      throw new Error("User not found")
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

    return { success: true }
  } catch (error) {
    console.error("Error inviting user to community: ", error)
    throw error
  }
}

export async function acceptUserRequest(cid: string, uid: string) {
  try {
    const user = await fetchUser(uid)
    if (!user) {
      throw new Error("User not found")
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

    if (!user) {
      throw new Error("User not found")
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
    const community = await fetchCommunityDetails(cid)

    if (!community) {
      throw new Error("Community not found")
    }
    return community.moderators.find((d) => d.uid === uid)
  } catch (error) {
    console.error("Error checking if user is moderator: ", error)
    throw error
  }
}

export async function isPendingRequest(cid: string, uid: string) {
  try {
    const community = await fetchCommunityDetails(cid)

    if (!community) {
      throw new Error("Community not found")
    }

    return community.requests.find((d) => d.uid === uid)
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

    if (!user) {
      throw new Error("User not found")
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

export async function removeModerator(cid: string, uid: string) {
  try {
    const user = await fetchUser(uid)
    if (!user) {
      throw new Error("User not found")
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
