import { TRPCError } from "@trpc/server"
import { z } from "zod"

import db from "@/lib/db"

import { publicProcedure, router } from "../trpc"

export const activityRouter = router({
  getRepliesToUserThreads: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const userId = input
        const userThreads = await db.threads.findMany({
          where: {
            authorId: userId,
          },
          select: {
            children: {
              select: {
                id: true,
              },
            },
          },
        })
        const childThreadIds = userThreads
          .map((userThread) => {
            return userThread.children.map((child) => child.id)
          })
          .flat()
        const replies = await db.threads.findMany({
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
        })
        return replies
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch user activity: ${error.message}`,
        })
      }
    }),

  getLikedUserThreads: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const userId = input
        if (!userId) {
          throw new Error("User not found")
        }
        const likedThreads = await db.users.findUnique({
          where: {
            id: userId,
          },
          include: {
            threads: {
              include: {
                likedBy: true,
              },
            },
          },
        })
        if (!likedThreads) {
          return []
        }
        const liked = likedThreads.threads
          .map((thread) => {
            return thread.likedBy.map((user) => {
              return { id: thread.id, author: user }
            })
          })
          .flat()
        return liked
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch user activity: ${error.message}`,
        })
      }
    }),

  getThreadsLikedByUser: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const userId = input
        const likedThreadIds = (
          await db.threads.findMany({
            where: {
              authorId: userId,
              parentId: null,
            },
            select: {
              id: true,
            },
          })
        ).map((thread) => thread.id)
        const liked = await db.threads.findMany({
          where: {
            id: { in: likedThreadIds },
          },
          include: {
            author: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        })
        return liked
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch user activity: ${error.message}`,
        })
      }
    }),
})
