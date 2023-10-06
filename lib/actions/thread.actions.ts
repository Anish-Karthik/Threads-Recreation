"use server";

import { revalidatePath } from "next/cache";
import { fetchUser } from "./user.actions";
import prismadb from "./prismadb";

interface ThreadProps {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}
interface addCommentToThreadProps {
  threadId: string;
  commentText: string;
  userId: string;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: ThreadProps) {
  try {
    if (!author) {
      throw new Error("No author provided");
    }
    const communityIdObject = await prismadb.communities.findUnique({
      where: {
        cid: communityId || "",
      },
      select: {
        id: true,
        cid: true,
      },
    });

    const createdThread = await prismadb.threads.create({
      data: {
        text,
        authorId: author,
        communityId: communityIdObject?.id || null,
        parentId: undefined,
      },
    });

    if (!createdThread) {
      console.log("Failed to create thread");
      throw new Error("Failed to create thread");
    }

    const user = await prismadb.users.findUnique({
      where: {
        id: author,
      },
      include: {
        threads: true,
      },
    });
    if (!user) {
      console.log("User not found");
      throw new Error("User not found");
    }

    await prismadb.users.update({
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
    });

    if (communityIdObject) {
      await prismadb.communities.update({
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
      });
    }
    // make sure channges are reflected in the cache immediately
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`);
  }
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  try {
    //  calc skips
    const skipAmount = (pageNumber - 1) * pageSize;

    const threadsQuery = await prismadb.threads.findMany({
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
    });

    const posts = threadsQuery;

    const totalThreadsCount = await prismadb.threads.count({
      where: {
        parentId: undefined,
      },
    });

    const isNext = totalThreadsCount > skipAmount + posts.length;

    return { posts, isNext };
  } catch (error) {}
}

export async function fetchThreadById(id: string) {
  try {
    const thread = await prismadb.threads.findUnique({
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
    });

    return thread;
  } catch (error: any) {
    console.log(error);
    throw new Error(`Failed to fetch thread: ${error.message}`);
  }
}

export async function addCommentToThread({
  threadId,
  commentText,
  userId,
  path,
}: addCommentToThreadProps) {
  try {
    const originalThread = await prismadb.threads.findUnique({
      where: {
        id: threadId,
      },
      include: {
        children: true,
      },
    });

    if (!originalThread) {
      throw new Error("Thread not found");
    }
    const newComment = await prismadb.threads.create({
      data: {
        text: commentText,
        authorId: userId,
        parentId: threadId,
      },
    });

    // add the new thread to the original thread's children
    originalThread.children.push(newComment);

    // Update Thread model in prisma

    await prismadb.threads.update({
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
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`);
  }
}

export async function deleteThread(threadId: string, path: string) {
  try {
    if (!threadId) {
      throw new Error("Thread not found");
    }

    const deleteChildren = async (threadId: string) => {
      const thread = await prismadb.threads.findUnique({
        where: {
          id: threadId,
        },
        include: {
          children: true,
        },
      });

      if (!thread) {
        throw new Error("Thread not found");
      }
      if (thread.children.length > 0) {
        for (const child of thread.children) {
          await deleteChildren(child.id);
        }
      }
      await prismadb.threads.update({
        where: {
          id: thread.id,
        },
        data: {
          children: {
            disconnect: {
              id: threadId,
            },
          },
        },
      });
      await prismadb.threads.delete({
        where: {
          id: thread.id,
        },
      });
      // remove likes from users

      if (thread.likedByIds.length > 0) {
        for (const userId of thread.likedByIds) {
          await prismadb.users.update({
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
          });
        }
      }

      const communityId = thread.communityId;
      if (communityId) {
        await prismadb.communities.update({
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
        });
      }
    };

    await deleteChildren(threadId);
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`);
  }
}

export async function editThread({
  threadId,
  text,
  path,
}: {
  threadId: string;
  text: string;
  path: string;
}) {
  try {
    const thread = await prismadb.threads.update({
      where: {
        id: threadId,
      },
      data: {
        text,
      },
    });

    if (!thread) {
      throw new Error("Thread not found");
    }

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`);
  }
}

export async function fetchLikedThreads(userId: string) {
  try {
    const user = await fetchUser(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const likedThreads = await prismadb.threads.findMany({
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
    });

    return likedThreads;
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`);
  }
}

export async function toggleLikeThread(
  threadId: string,
  userId: string,
  path: string
) {
  try {
    const thread = await fetchThreadById(threadId);
    // await User.updateMany({}, {$set: {likedThreads: []}})
    // await Thread.updateMany({}, {$set: {likes: []}})

    if (!thread) {
      throw new Error("Thread not found");
    }
    // add the thread to the user's likedThreads
    const user = await fetchUser(userId);

    if (!user) {
      throw new Error("User not found");
    }
    let isLiked = false;
    if (user.likedThreads.map((thread) => thread.id).includes(threadId)) {
      await prismadb.users.update({
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
      });
      await prismadb.threads.update({
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
      });
      isLiked = false;
    } else {
      await prismadb.users.update({
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
      });
      await prismadb.threads.update({
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
      });
      isLiked = true;
    }
    revalidatePath(path);
    return { isLiked, likes: thread.likedByIds.length };
  } catch (error: any) {
    console.error(`Failed to fetch thread: ${error.message}`);
  }
}

export async function isLikedThread(threadId: string, userId: string) {
  try {
    const thread = await fetchThreadById(threadId);
    const user = await fetchUser(userId);

    if (!thread) {
      throw new Error("Thread not found");
    }
    if (!user) {
      throw new Error("User not found");
    }

    return thread.likedByIds.includes(user.id);
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`);
  }
}

export async function fetchLikeCount(threadId: string) {
  try {
    const thread = await fetchThreadById(threadId);

    if (!thread) {
      throw new Error("Thread not found");
    }

    return thread.likedByIds.length;
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`);
  }
}

// to prisma from line 1 to 344
