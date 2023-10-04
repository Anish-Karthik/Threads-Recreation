"use server";

import { revalidatePath } from "next/cache";
import prismadb from "./prismadb";

type UpdateUserProps = {
  userId: string;
  username: string;
  name: string;
  image: string;
  bio: string;
  path: string;
};

export async function updateUser(
  { userId, username, name, image, bio, path }: UpdateUserProps
): Promise<void> {
  try {
    await prismadb.users.update({
      where: {
        uid: userId,
      },
      data: {
        username: username.toLowerCase(),
        name,
        image,
        bio,
        onboarded: true,
        updatedAt: new Date(),
      },
    });

    if (path === '/profile/edit') {
      revalidatePath(path)
    }
  } catch (error: any) {
    console.log(error)
    throw new Error(`Failed to create/update user: ${error.message}`)
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
    throw new Error(`Failed to fetch user: ${error.message}`)
  }
}

export async function fetchUserPosts(userId: string) {
  try {

    // TODO: populate communities
    // const threads = await User
    //   .findOne({ id: userId })
    //   .populate({
    //     path: 'threads',
    //     model: Thread,
    //     populate: {
    //       path: 'children',
    //       model: Thread,
    //       populate: {
    //         path: 'author',
    //         model: 'User',
    //         select: 'id name image'
    //       }
    //     }
    //   }).exec()

    const threads = await prismadb.users.findUnique({
      where: {
        uid: userId,
      },
      select: {
        threads: {
          select: {
            id: true,
            children: {
              select: {
                id: true,
                author: {
                  select: {
                    uid: true,
                    name: true,
                    image: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    return threads
  } catch (error: any) {
    throw new Error(`Failed to fetch user posts: ${error.message}`)
  }
}

export async function fetchUsers({
  userId,
  searchString = '',
  pageNumber = 1,
  pageSize = 20,
  sortBy = 'desc',  
} : {
  userId: string,
  searchString?: string,
  pageNumber?: number,
  pageSize?: number,
  sortBy?: 'asc' | 'desc',
}) {
  try {
    const skipAmount = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, 'i');

    // const query: FilterQuery<typeof User> = {
    //   id: { $ne: userId },
    // }

    // if(searchString.trim() !== '') {
    //   query.$or = [
    //     { name: { $regex: regex } },
    //     { username: { $regex: regex } },
    //   ]
    // }

    // in Prisma
    type QueryType = {
      NOT: {
        uid: string,
        OR?: {
          id: string,
        }[],
      },
      OR?: [
        {
          name: {
            contains: string,
            mode: 'insensitive',
          },
        }, {
          username: {
            contains: string,
            mode: 'insensitive',
          },
        },
      ],
    }

    const query: QueryType = {
      NOT: {
        uid: userId,
        OR: [{
          id: userId,
        }],
      },
    }
    if(searchString.trim() !== '') {
      
      query.OR= [
        {
          name: {
            contains: searchString,
            mode: 'insensitive',
          },
        },
        {
          username: {
            contains: searchString,
            mode: 'insensitive',
          },
        },
      ];
    }


    // const sortOptions = { createdAt: sortBy }

    // const usersQuery = await User.find(query)
    // .sort(sortOptions)
    // .skip(skipAmount)
    // .limit(pageSize).exec();

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
    throw new Error(`Failed to fetch users: ${error.message}`)
  }
}

