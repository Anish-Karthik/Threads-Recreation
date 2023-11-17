import { revalidatePath } from "next/cache"
import { communities, threads, users } from "@prisma/client"

import db from "@/lib/db"

import { fetchUser } from "./user.actions"

interface ThreadProps {
  text: string
  author: string
  communityId: string | null
  path: string
}
interface addCommentToThreadProps {
  threadId: string
  commentText: string
  userId: string
  path: string
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: ThreadProps) {
  try {
    if (!author) {
      throw new Error("No author provided")
    }
    let communityIdObject: string
    if (communityId) {
      communityIdObject = (
        await db.communities.findUnique({
          where: {
            cid: communityId,
          },
          select: {
            id: true,
          },
        })
      )?.id
    }
    const createdThread = await db.threads.create({
      data: {
        text,
        authorId: author,
        communityId: communityIdObject || null,
        parentId: undefined,
      },
    })

    if (!createdThread) {
      throw new Error("Failed to create thread")
    }

    // make sure channges are reflected in the cache immediately
    revalidatePath(path)
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`)
  }
}

export async function fetchThreads(
  pageNumber: number = 1,
  pageSize: number = 20,
  includeCommunity: boolean = true
) {
  try {
    //  calc skips
    const skipAmount = (pageNumber - 1) * pageSize

    const threadsQuery = await db.threads.findMany({
      where: {
        parentId: undefined,
      },
      include: {
        // _count: true, // TODO: make this as a single query
        author: true,
        children: {
          include: {
            author: true,
          },
        },
        community: includeCommunity
          ? {
              include: {
                threads: true,
              },
            }
          : false,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: skipAmount,
      take: pageSize,
    })

    const posts = threadsQuery

    const totalThreadsCount = await db.threads.count({
      where: {
        parentId: undefined,
      },
    })

    const isNext = totalThreadsCount > skipAmount + posts.length

    return { posts, isNext }
  } catch (error) {}
}

export async function fetchThreadById(
  id: string,
  includeCommunity: boolean = true
) {
  try {
    const thread = await db.threads.findUnique({
      where: {
        id,
      },
      include: {
        author: true,
        children: {
          include: {
            author: true,
            community: includeCommunity
              ? {
                  include: {
                    threads: true,
                  },
                }
              : false,
            children: {
              include: {
                author: true,
              },
            },
          },
        },
        community: includeCommunity
          ? {
              include: {
                threads: true,
              },
            }
          : true,
        likedBy: true,
      },
    })

    return thread
  } catch (error: any) {
    console.error(`Failed to fetch thread: ${error.message}`)
    throw new Error(`Failed to fetch thread: ${error.message}`)
  }
}

export async function addCommentToThread({
  threadId,
  commentText,
  userId,
  path,
}: addCommentToThreadProps) {
  try {
    if (!threadId) {
      throw new Error("Thread not found")
    }
    const newComment = await db.threads.create({
      data: {
        text: commentText,
        authorId: userId,
        parentId: threadId,
      },
    })

    revalidatePath(path)
    return newComment
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`)
  }
}

export async function deleteThread(threadId: string, path: string) {
  try {
    if (!threadId) {
      throw new Error("Thread not found")
    }

    const deleteChildren = async (threadId: string) => {
      const thread = await db.threads.delete({
        where: {
          id: threadId,
        },
        include: {
          children: true,
        },
      })

      if (!thread) {
        throw new Error("Thread not found")
      }
      if (thread.children.length > 0) {
        for (const child of thread.children) {
          await deleteChildren(child.id)
        }
      }
    }

    await deleteChildren(threadId)
    revalidatePath(path)
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`)
  }
}

export async function editThread({
  threadId,
  text,
  path,
}: {
  threadId: string
  text: string
  path: string
}) {
  try {
    const thread = await db.threads.update({
      where: {
        id: threadId,
      },
      data: {
        text,
      },
    })

    if (!thread) {
      throw new Error("Thread not found")
    }

    revalidatePath(path)
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`)
  }
}

export async function fetchLikedThreads(userId: string) {
  try {
    const user = await fetchUser(userId)

    if (!user) {
      throw new Error("User not found")
    }

    const likedThreads = await db.threads.findMany({
      where: {
        id: {
          in: user.likedThreads.map((thread) => thread.id),
        },
      },
      include: {
        children: {
          include: {
            author: true,
          },
        },
        author: true,
      },
    })

    return likedThreads
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`)
  }
}

export async function toggleLikeThread(
  threadId: string,
  userId: string,
  path: string
) {
  try {
    console.log("toggle like")
    // implement this toggleLikeThread function as efficient as possible and reduce as much db calls as possible
    const user = await fetchUser(userId)
    if (!user) {
      throw new Error("User not found")
    }
    let res: users
    const isLiked = user.likedThreadIds.includes(threadId)
    if (isLiked) {
      res = await db.users.update({
        where: {
          id: user.id,
        },
        data: {
          likedThreads: {
            disconnect: {
              id: threadId,
            },
          },
        },
      })
    } else {
      res = await db.users.update({
        where: {
          id: user.id,
        },
        data: {
          likedThreads: {
            connect: {
              id: threadId,
            },
          },
        },
      })
    }

    revalidatePath(path)
  } catch (error: any) {
    console.error(`Failed to fetch thread: ${error.message}`)
  }
}

export async function isLikedThread(threadId: string, userId: string) {
  try {
    const thread = await fetchThreadById(threadId)
    const user = await fetchUser(userId)

    if (!thread) {
      throw new Error("Thread not found")
    }
    if (!user) {
      throw new Error("User not found")
    }

    return thread.likedByIds.includes(user.id)
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`)
  }
}

export async function fetchLikeCount(threadId: string) {
  try {
    const thread = await fetchThreadById(threadId)

    if (!thread) {
      throw new Error("Thread not found")
    }

    return thread.likedByIds.length
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`)
  }
}

// to prisma from line 1 to 344
