"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model"
import { connectToDB } from "../mongoose"


export async function updateUser(
  userId: string,
  username: string,
  name: string,
  image: string,
  bio: string,
  path: string,
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