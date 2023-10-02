"use server"

import { revalidatePath } from "next/cache";
import User from "@/lib/models/user.model"
import { connectToDB } from "@/lib/mongoose"
import Thread from "@/lib/models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";
interface UpdateUserProps {
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
  connectToDB()
  try {
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        image,
        bio,
        onboarded: true,
        updatedAt: new Date(),
      },
      { upsert: true }
    );
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
    connectToDB();

    return await User
      .findOne({ id: userId })
      // .populate({
      //   path: 'communities',
      //   model: 'Community',
      // })
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`)
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();

    // TODO: populate communities
    const threads = await User
      .findOne({ id: userId })
      .populate({
        path: 'threads',
        model: Thread,
        populate: {
          path: 'children',
          model: Thread,
          populate: {
            path: 'author',
            model: 'User',
            select: 'id name image'
          }
        }
      }).exec()

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
  sortBy?: SortOrder,
}) {
  try {
    connectToDB();
    const skipAmount = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, 'i');

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    }

    if(searchString.trim() !== '') {
      query.$or = [
        { name: { $regex: regex } },
        { username: { $regex: regex } },
      ]
    }

    const sortOptions = { createdAt: sortBy }

    const usersQuery = await User.find(query)
    .sort(sortOptions)
    .skip(skipAmount)
    .limit(pageSize).exec();

    const totalUsersCount = await User.countDocuments(query);

    const users = usersQuery;

    const isNext = totalUsersCount > skipAmount + users.length;
    return { users, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`)
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();

    // find all threads and comments by user

    const userThreads = await Thread.find({ author: userId }).exec()

    //  find all comments by user
    // const childThreadIds = userThreads.reduce((acc, userThread) => {
    //   return acc.concat(userThread.children)
    // }, [])
    
    const childThreadIds = userThreads.map(userThread => {
      return userThread.children
    }).flat()
    

    const replies = await Thread.find({ 
      _id: { $in: childThreadIds },
      author: { $ne: userId },
    }).populate({
      path: 'author',
      model: User,
      select: '_id name image'
    }).exec()

    return replies
  } catch (error: any) {
    throw new Error(`Failed to fetch user activity: ${error.message}`)
  }
}