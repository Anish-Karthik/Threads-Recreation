import React from "react"

import { fetchCommunityPosts } from "@/lib/actions/community.actions"
import { fetchUserPosts } from "@/lib/actions/user.actions"

import ThreadCard from "../cards/ThreadCard"

interface ThreadsTabProps {
  currentUserId: string
  accountId: string
  accountType: "User" | "Community"
}

const ThreadsTab = async ({
  currentUserId,
  accountId,
  accountType,
}: ThreadsTabProps) => {
  if (accountType === "User") {
    const result = await fetchUserPosts(accountId)
    if (!result) return null

    return (
      <section className="mt-9 flex flex-col gap-10">
        {result &&
          result.threads.map((thread) => (
            <ThreadCard
              key={thread.id}
              id={thread.id}
              currentUserId={currentUserId}
              parentId={thread.parentId}
              comments={thread.children}
              content={thread.text}
              author={result}
              community={thread.communityId}
              createdAt={thread.createdAt.toDateString()}
              isComment={true}
            />
          ))}
      </section>
    )
  }
  const result = await fetchCommunityPosts(accountId)

  if (!result) return <>{result?.id}</>
  return (
    <section className="mt-9 flex flex-col gap-10">
      {result &&
        result.threads.map((thread) => (
          <ThreadCard
            key={thread.id}
            id={thread.id}
            currentUserId={currentUserId}
            parentId={thread.parentId}
            comments={thread.children}
            content={thread.text}
            author={thread.author}
            community={thread.communityId} //todo
            createdAt={thread.createdAt.toDateString()}
            isComment={true}
          />
        ))}
    </section>
  )
}

export default ThreadsTab
