"use server";

import { revalidatePath } from "next/cache";
import prismadb from "./prismadb";

export async function getActivityRepliedToUser(userId: string) {
  try {
    // connectToDB();

    // find all threads and comments by user

    const userThreads = await prismadb.threads.findMany({
      where: {
        authorId: userId,
      },
      select: {
        children: {
          select: {
            id: true,
          },
        }
      },
    });
    // get all child thread ids, and remove duplicates and flatten array to 1d

    const childThreadIds = userThreads
      .map((userThread) => {
        return userThread.children.map((child) => child.id);
      }).flat();

    const replies = await prismadb.threads.findMany({
      where: {
        id: { in: childThreadIds },
      },
      select: {
        id: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        createdAt: true,
        parentId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    

    return replies;
  } catch (error: any) {
    throw new Error(`Failed to fetch user activity: ${error.message}`);
  }
}

export async function getActivityLikedToUser(userId: string) { 
  try {
    // find users who liked the user's threads
    if (!userId) {
      throw new Error("User not found");
    }

    let likedThreads = (await prismadb.users.findUnique({
      where: {
        id: userId,
      },
      include: {
        threads: {
          include: {
            likedBy: true,
          }
        }
      },
    }));

    if(!likedThreads) {
      return [];
    }

    let liked = likedThreads.threads.map((thread) => {
      return thread.likedBy.map((user) => {
          return {id: thread.id, author: user};
        }
      );
    }).flat();



    return liked || [];
  } catch (error) {
    
  }
}


export async function getActivityLikedByUser(userId: string) {
  try {
    // find threads whose parent is not null, ans select only parentThreads
    const likedThreadIds = (await prismadb.threads.findMany({
      where: {
        authorId: userId,
        parentId: null,
      },
      select: {
        id: true,
      },
    })).map((thread) => thread.id);

    const liked = await prismadb.threads.findMany({
      where: {
        id: { in: likedThreadIds },
      },
      select: {
        id: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    

    return liked;
  } catch (error: any) {
    throw new Error(`Failed to fetch user activity: ${error.message}`);
  }
}