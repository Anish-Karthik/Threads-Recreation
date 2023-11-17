"use client"

import React from "react"
import { communities, threads, users } from "@prisma/client"

import { fetchCommunityPosts } from "@/lib/actions/community.actions"
import { fetchUserPosts } from "@/lib/actions/user.actions"

import ThreadCard from "../cards/ThreadCard"

interface ThreadsTabProps {
  currentUserId: string
  accountId: string
  accountType: "User" | "Community"
  userInfo?: users
  result: Awaited<ReturnType<typeof fetchUserPosts>>
}

const ThreadsTab = ({
  currentUserId,
  accountId,
  accountType,
  userInfo,
  result,
}: ThreadsTabProps) => {
  if (!result) return null
  if (accountType === "User") {
    return (
      <section className="mt-9 flex flex-col gap-10">
        {result &&
          result.map((thread) => (
            <ThreadCard
              key={thread.id}
              id={thread.id}
              currentUserId={currentUserId}
              parentId={thread.parentId}
              comments={thread.children}
              content={thread.text}
              author={thread.author}
              userInfo={userInfo}
              likeCount={thread.likedByIds.length}
              isLiked={!!userInfo?.likedThreadIds.includes(thread.id)}
              communityDetails={
                thread.community as communities & { threads: threads[] }
              }
              createdAt={thread.createdAt.toDateString()}
              isComment={true}
            />
          ))}
      </section>
    )
  }

  return (
    <section className="mt-9 flex flex-col gap-10">
      {result &&
        result.map((thread) => (
          <ThreadCard
            key={thread.id}
            id={thread.id}
            currentUserId={currentUserId}
            parentId={thread.parentId}
            comments={thread.children}
            content={thread.text}
            author={thread.author}
            userInfo={userInfo}
            likeCount={thread.likedByIds.length}
            isLiked={!!userInfo?.likedThreadIds.includes(thread.id)}
            communityDetails={
              thread.community as communities & { threads: threads[] }
            }
            createdAt={thread.createdAt.toDateString()}
            isComment={true}
          />
        ))}
    </section>
  )
}

export default ThreadsTab
