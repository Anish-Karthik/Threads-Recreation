import { revalidatePath } from "next/cache"

import db from "@/lib/db"

type UpdateUserProps = {
  userId: string
  username: string
  name: string
  image: string
  bio: string
  path: string
}

export async function updateUser({
  userId,
  username,
  name,
  image,
  bio,
  path,
}: UpdateUserProps): Promise<void> {
  try {
    await db.users.upsert({
      where: {
        uid: userId,
      },
      update: {
        username: username.toLowerCase(),
        name,
        image,
        bio,
        onboarded: true,
        updatedAt: new Date(),
      },
      create: {
        uid: userId,
        username: username.toLowerCase(),
        name,
        image,
        bio,
        onboarded: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    if (path === "/profile/edit") {
      revalidatePath(path)
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`)
  }
}

export async function fetchUser(userId: string) {
  try {
    return await db.users.findUnique({
      where: {
        uid: userId,
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
}

export async function fetchUserPosts(userId: string) {
  try {
    const threads = await db.users.findUnique({
      where: {
        uid: userId,
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

    return threads?.threads || []
  } catch (error: any) {
    throw new Error(`Failed to fetch user posts: ${error.message}`)
  }
}

export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string
  searchString?: string
  pageNumber?: number
  pageSize?: number
  sortBy?: "asc" | "desc"
}) {
  try {
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

    // const totalUsersCount = await User.countDocuments(query);
    const totalUsersCount = await db.users.count({
      where: query,
    })

    const isNext = totalUsersCount > skipAmount + users.length
    return { users, isNext }
  } catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`)
  }
}

export async function deleteUser(uid: string, path: string) {
  try {
    // TODO: Check if user thread and it's comments are deleted
    await db.users.delete({
      where: {
        uid,
      },
    })

    revalidatePath(path)
  } catch (error: any) {
    throw new Error(`Failed to delete user: ${error.message}`)
  }
}

export async function fetchInvitedCommunities(uid: string) {
  try {
    const invites = await db.users.findUnique({
      where: {
        uid: uid,
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
}

export async function requestToJoinCommunity(cid: string, uid: string) {
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
        requests: {
          connect: {
            id: user.id,
          },
        },
      },
    })

    return { sucess: true }
  } catch (error) {
    console.error("Error Requesting to community: ", error)
    throw error
  }
}

export async function acceptCommunityInvite(cid: string, uid: string) {
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
          disconnect: {
            id: user.id,
          },
        },
        members: {
          connect: {
            id: user.id,
          },
        },
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error accepting community invite: ", error)
    throw error
  }
}

// reject community invite
export async function rejectCommunityInvite(cid: string, uid: string) {
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
          disconnect: {
            id: user.id,
          },
        },
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error accepting community invite: ", error)
    throw error
  }
}
