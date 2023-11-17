"use server"

import { revalidatePath } from "next/cache"

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
    const communityIdObject = await db.communities.findUnique({
      where: {
        cid: communityId || "",
      },
      select: {
        id: true,
        cid: true,
      },
    })

    const createdThread = await db.threads.create({
      data: {
        text,
        authorId: author,
        communityId: communityIdObject?.id || null,
        parentId: undefined,
      },
    })

    if (!createdThread) {
      throw new Error("Failed to create thread")
    }

    const user = await db.users.findUnique({
      where: {
        id: author,
      },
      include: {
        threads: true,
      },
    })
    if (!user) {
      throw new Error("User not found")
    }

    await db.users.update({
      where: {
        id: author,
      },
      data: {
        threads: {
          connect: {
            id: createdThread.id,
          },
        },
      },
    })

    if (communityIdObject) {
      await db.communities.update({
        where: {
          cid: communityIdObject.cid,
        },
        data: {
          threads: {
            connect: {
              id: createdThread.id,
            },
          },
        },
      })
    }
    // make sure channges are reflected in the cache immediately
    revalidatePath(path)
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`)
  }
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  try {
    //  calc skips
    const skipAmount = (pageNumber - 1) * pageSize

    const threadsQuery = await db.threads.findMany({
      where: {
        parentId: undefined,
      },
      include: {
        author: true,
        children: {
          include: {
            author: true,
          },
        },
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

export async function fetchThreadById(id: string) {
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
            community: true,
            children: {
              include: {
                author: true,
              },
            },
          },
        },
        community: true,
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
    const originalThread = await db.threads.findUnique({
      where: {
        id: threadId,
      },
      include: {
        children: true,
      },
    })

    if (!originalThread) {
      throw new Error("Thread not found")
    }
    const newComment = await db.threads.create({
      data: {
        text: commentText,
        authorId: userId,
        parentId: threadId,
      },
    })

    // add the new thread to the original thread's children
    originalThread.children.push(newComment)

    // Update Thread model in prisma

    await db.threads.update({
      where: {
        id: threadId,
      },
      data: {
        children: {
          connect: {
            id: newComment.id,
          },
        },
      },
    })

    revalidatePath(path)
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
      const thread = await db.threads.findUnique({
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
      await db.threads.update({
        where: {
          id: thread.id,
        },
        data: {
          children: {
            disconnect: {
              id: threadId,
            },
          },
          likedBy: {
            disconnect: {
              id: threadId,
            },
          },
        },
      })
      // remove likes from users

      if (thread.likedByIds.length > 0) {
        for (const userId of thread.likedByIds) {
          await db.users.update({
            where: {
              id: userId,
            },
            data: {
              likedThreads: {
                disconnect: {
                  id: threadId,
                },
              },
            },
          })
        }
      }
      await db.threads.delete({
        where: {
          id: thread.id,
        },
      })

      const communityId = thread.communityId
      if (communityId) {
        await db.communities.update({
          where: {
            id: communityId,
          },
          data: {
            threads: {
              disconnect: {
                id: threadId,
              },
            },
          },
        })
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
    const thread = await fetchThreadById(threadId)
    // await User.updateMany({}, {$set: {likedThreads: []}})
    // await Thread.updateMany({}, {$set: {likes: []}})

    if (!thread) {
      throw new Error("Thread not found")
    }
    // add the thread to the user's likedThreads
    const user = await fetchUser(userId)

    if (!user) {
      throw new Error("User not found")
    }
    const like = {
      isLiked: false,
      likes: thread.likedByIds.length,
    }
    if (user.likedThreads.map((thread) => thread.id).includes(threadId)) {
      await db.users.update({
        where: {
          uid: userId,
        },
        data: {
          likedThreads: {
            disconnect: {
              id: threadId,
            },
          },
        },
      })
      await db.threads.update({
        where: {
          id: threadId,
        },
        data: {
          likedBy: {
            disconnect: {
              id: user.id,
            },
          },
        },
      })
      like.likes -= 1
    } else {
      await db.users.update({
        where: {
          uid: userId,
        },
        data: {
          likedThreads: {
            connect: {
              id: threadId,
            },
          },
        },
      })
      await db.threads.update({
        where: {
          id: threadId,
        },
        data: {
          likedBy: {
            connect: {
              id: user.id,
            },
          },
        },
      })
      like.isLiked = true
      like.likes += 1
    }
    revalidatePath(path)
    return like
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
