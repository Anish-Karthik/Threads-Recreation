"use server"

import { revalidatePath } from "next/cache";
import User from "@/lib/models/user.model"
import { connectToDB } from "@/lib/mongoose"
import Thread from "@/lib/models/thread.model";

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