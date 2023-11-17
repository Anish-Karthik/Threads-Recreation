import { z } from "zod"

import { getLikedUserThreads } from "@/lib/actions/activity.actions"
import {
  addCommentToThread,
  createThread,
  deleteThread,
  editThread,
  fetchLikeCount,
  fetchThreadById,
  fetchThreads,
  isLikedThread,
  toggleLikeThread,
} from "@/lib/actions/thread.actions"

import { publicProcedure, router } from "../trpc"

export const threadRouter = router({
  create: publicProcedure
    .input(
      z.object({
        text: z.string(),
        author: z.string(),
        communityId: z.string().nullable(),
        path: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { text, author, communityId, path } = input
      try {
        await createThread({ text, author, communityId, path })
      } catch (error: any) {
        throw new Error(`Failed to fetch thread: ${error.message}`)
      }
    }),

  getAll: publicProcedure
    .input(
      z.object({
        pageNumber: z.number().optional(),
        pageSize: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const { pageNumber, pageSize } = input
      try {
        return await fetchThreads(pageNumber, pageSize)
      } catch (error) {}
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { id } = input
      try {
        return await fetchThreadById(id)
      } catch (error: any) {
        console.error(`Failed to fetch thread: ${error.message}`)
        throw new Error(`Failed to fetch thread: ${error.message}`)
      }
    }),

  addComment: publicProcedure
    .input(
      z.object({
        threadId: z.string(),
        commentText: z.string(),
        userId: z.string(),
        path: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { threadId, commentText, userId, path } = input
      try {
        return await addCommentToThread({ threadId, commentText, userId, path })
      } catch (error: any) {
        throw new Error(`Failed to fetch thread: ${error.message}`)
      }
    }),

  delete: publicProcedure
    .input(
      z.object({
        threadId: z.string(),
        path: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { threadId, path } = input
      try {
        return await deleteThread(threadId, path)
      } catch (error: any) {
        throw new Error(`Failed to fetch thread: ${error.message}`)
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        threadId: z.string(),
        text: z.string(),
        path: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { threadId, text, path } = input
      try {
        return await editThread({ threadId, text, path })
      } catch (error: any) {
        throw new Error(`Failed to fetch thread: ${error.message}`)
      }
    }),

  getLiked: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const { userId } = input
      try {
        return await getLikedUserThreads(userId)
      } catch (error: any) {
        throw new Error(`Failed to fetch thread: ${error.message}`)
      }
    }),

  toggleLike: publicProcedure
    .input(
      z.object({
        threadId: z.string(),
        userId: z.string(),
        path: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { threadId, userId, path } = input
      try {
        return await toggleLikeThread(threadId, userId, path)
      } catch (error: any) {
        console.error(`Failed to fetch thread: ${error.message}`)
      }
    }),

  isLiked: publicProcedure
    .input(
      z.object({
        threadId: z.string(),
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { threadId, userId } = input
      try {
        return await isLikedThread(threadId, userId)
      } catch (error: any) {
        throw new Error(`Failed to fetch thread: ${error.message}`)
      }
    }),

  likeCount: publicProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ input }) => {
      const { threadId } = input
      try {
        return await fetchLikeCount(threadId)
      } catch (error: any) {
        throw new Error(`Failed to fetch thread: ${error.message}`)
      }
    }),
})
