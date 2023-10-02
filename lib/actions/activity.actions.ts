"use server";

import { revalidatePath } from "next/cache";
import User from "@/lib/models/user.model";
import { connectToDB } from "@/lib/mongoose";
import Thread from "@/lib/models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

export async function getActivityRepliedToUser(userId: string) {
  try {
    connectToDB();

    // find all threads and comments by user

    const userThreads = await Thread.find({ author: userId }).exec();
    // get all child thread ids, and remove duplicates and flatten array to 1d
    const childThreadIds = userThreads
      .map((userThread) => {
        return userThread.children;
      })
      .flat();

    const replies = await Thread.find(
      {
        _id: { $in: childThreadIds },
      },
      { _id: 1, author: 1, createdAt: 1, parentId: 1 }
    )
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        model: User,
        select: "_id name image",
      })
      .exec();
    const result = replies.map((reply) => {
      return {
        ...reply._doc,
        updatedAt: reply.createdAt,
      };
    });
    

    return result;
  } catch (error: any) {
    throw new Error(`Failed to fetch user activity: ${error.message}`);
  }
}

export async function getActivityLikedToUser(userId: string) {
  try {
    connectToDB();
    // find users who liked the user's threads
    if (!userId) {
      throw new Error("User not found");
    }
    const LikedThreads = await Thread.find(
      { author: userId, likes: { $ne: [] } },
      { _id: 1, likes: 1 }
    )
      .populate({
        path: "likes",
        model: User,
        select: "_id name image updatedAt",
      })
      .sort({ updatedAt: -1 });

    const result = LikedThreads.map((thread) => {
      return thread.likes.map((user: any) => {
        return {
          author: user,
          updatedAt: user.updatedAt,
          threadId: thread._id,
        };
      });
    }).flat();

    

    return result;
  } catch (error: any) {
    throw new Error(`Failed to fetch user activity: ${error.message}`);
  }
}

export async function getActivityLikedByUser(userId: string) {
  try {
    connectToDB();
    // find threads whose parent is not null, ans select only parentThreads
    const likedThreadIds = await User.findById(userId, {
      likedThreads: 1,
      _id: 0,
    }).exec();

    // get author of parent threads
    const liked = await Thread.find({
      _id: { $in: likedThreadIds },
    })
      .populate({
        path: "author",
        model: User,
        select: "_id name image updatedAt",
      })
      .sort({ updatedAt: -1 })
      .exec();

    return liked;
  } catch (error: any) {
    throw new Error(`Failed to fetch user activity: ${error.message}`);
  }
}

export async function getActivityRepliedByUser(userId: string) {
  try {
    connectToDB();
    // find threads whose parent is not null, ans select only parentThreads
    const parentThreadIds = await Thread.find(
      { author: userId, parentId: { $ne: null } },
      { parentId: 1, _id: 0 }
    ).exec();

    // get author of parent threads
    const replied = await Thread.find({
      _id: { $in: parentThreadIds },
    })
      .populate({
        path: "author",
        model: User,
        select: "_id name image updatedAt",
      })
      .sort({ updatedAt: -1 })
      .exec();

    return replied;
  } catch (error: any) {
    throw new Error(`Failed to fetch user activity: ${error.message}`);
  }
}
