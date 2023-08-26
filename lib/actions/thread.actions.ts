"use server"

import Thread from "@/lib/models/thread.model";
import { connectToDB } from "@/lib/mongoose";
import User from "@/lib/models/user.model";
import { revalidatePath } from "next/cache";

interface ThreadProps {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({ text, author, communityId, path}: ThreadProps) {
  try {
    connectToDB();

    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });

    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });
    // make sure channges are reflected in the cache immediately
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`)
  }
}