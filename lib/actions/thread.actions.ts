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

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  try {
    connectToDB();
    //  calc skips
    const skipAmount = (pageNumber - 1) * pageSize;

    // top level threads
    const threadsQuery = await Thread.find({parentId: { $in: [null, undefined] }})
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({path: "author", model: "User"})
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: "User",
          select: "_id name parentId image",
        },
      })
      .exec();
    const posts = threadsQuery;
    
    const totalThreadsCount = await Thread.countDocuments({parentId: { $in: [null, undefined] }});


    const isNext = totalThreadsCount > skipAmount + posts.length;

    return {posts, isNext};

  } catch (error) {
    
  }
}

export async function fetchThreadById(id: string) {
  try {
    connectToDB();

    // TODO: populate Commmunity
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: "User", 
        select: "_id id name image"
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: "User",
            select: "_id id name parentId image"
          },
          {
            path: "children",
            model: "Thread",
            populate: {
              path: "author",
              model: "User",
              select: "_id id name parentId image"
            }
          }
        ]
      }).exec();

    return thread;
  } catch (error: any) {
    console.log(error);
    throw new Error(`Failed to fetch thread: ${error.message}`)
  }
}