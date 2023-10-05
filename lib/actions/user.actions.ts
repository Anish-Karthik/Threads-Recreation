"use server";

import { revalidatePath } from "next/cache";
import prismadb from "./prismadb";
import { deleteThread } from "./thread.actions";
import { getActivityLikedByUser } from "./activity.actions";
import { deleteCommunity } from "./community.actions";

type UpdateUserProps = {
  userId: string;
  username: string;
  name: string;
  image: string;
  bio: string;
  path: string;
};

export async function updateUser({
  userId,
  username,
  name,
  image,
  bio,
  path,
}: UpdateUserProps): Promise<void> {
  try {
    await prismadb.users.upsert({
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
    });

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    console.log(error);
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    return await prismadb.users.findUnique({
      where: {
        uid: userId,
      },
      include: {
        communities: true,
        threads: true,
        likedThreads: true,
      },
    });
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    const threads = await prismadb.users.findUnique({
      where: {
        uid: userId,
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
    });

    return threads;
  } catch (error: any) {
    throw new Error(`Failed to fetch user posts: ${error.message}`);
  }
}

export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: "asc" | "desc";
}) {
  try {
    const skipAmount = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, "i");

    type QueryType = {
      OR: [
        {
          name: {
            contains: string;
            mode: "insensitive";
          };
        },
        {
          username: {
            contains: string;
            mode: "insensitive";
          };
        }
      ];
      NOT: {
        uid: string;
      };
    };

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
    };

    const users = await prismadb.users.findMany({
      where: query,
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
    });

    // const totalUsersCount = await User.countDocuments(query);
    const totalUsersCount = await prismadb.users.count({
      where: query,
    });

    const isNext = totalUsersCount > skipAmount + users.length;
    return { users, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}

export async function deleteUser(uid: string, path: string) {
  try {
    const user = fetchUser(uid);
    // Delete user's threads
    // TODO: Optimize this with group by get and delete, using skip
    const userThreads = await prismadb.threads.findMany({
      where: {
        authorId: uid,
      },
    });
    userThreads.forEach(async (thread) => {
      await deleteThread(thread.id, path);
    });

    // Delete user's liked threads
    const userLikedThreads = await getActivityLikedByUser(uid);
    userLikedThreads.forEach(async (thread) => {
      await prismadb.threads.update({
        where: {
          id: thread.id,
        },
        data: {
          likedBy: {
            disconnect: {
              id: uid,
            },
          },
        },
      });
    });

    // TODO: Delete user created communities if no other moderators
    const userCreatedCommunities = await prismadb.communities.findMany({
      where: {
        createdById: uid,
      },
    });

    userCreatedCommunities.forEach(async (community) => {
      await deleteCommunity(community.cid, path);
    });

    // Delete user
    await prismadb.users.delete({
      where: {
        uid,
      },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
}
