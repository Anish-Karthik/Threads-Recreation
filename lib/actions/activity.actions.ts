import db from "@/lib/db"

export async function getRepliesToUserThreads(userId: string) {
  try {
    const replies = await db.threads.findMany({
      where: {
        OR: [
          {
            authorId: userId,
          },
          {
            children: {
              some: {
                authorId: userId,
              },
            },
          },
        ],
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return replies
  } catch (error: any) {
    throw new Error(`Failed to fetch user activity: ${error.message}`)
  }
}

export async function getLikedUserThreads(userId: string) {
  try {
    if (!userId) {
      throw new Error("User not found")
    }

    let likedThreads = await db.users.findUnique({
      where: {
        id: userId,
      },
      include: {
        threads: {
          include: {
            likedBy: true,
          },
        },
      },
    })

    if (!likedThreads) {
      return []
    }

    let liked = likedThreads.threads
      .map((thread) => {
        return thread.likedBy.map((user) => {
          return { id: thread.id, author: user }
        })
      })
      .flat()

    return liked
  } catch (error: any) {
    throw new Error(`Failed to fetch user activity: ${error.message}`)
  }
}

export async function getThreadsLikedByUser(userId: string) {
  try {
    const liked = await db.threads.findMany({
      where: {
        authorId: userId,
        parentId: null,
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return liked
  } catch (error: any) {
    throw new Error(`Failed to fetch user activity: ${error.message}`)
  }
}
