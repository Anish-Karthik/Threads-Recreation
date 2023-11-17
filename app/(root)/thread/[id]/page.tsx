import React from "react"
import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs"
import { communities, threads } from "@prisma/client"

import { fetchThreadById } from "@/lib/actions/thread.actions"
import ThreadCard from "@/components/cards/ThreadCard"
import Comment from "@/components/forms/Comment"
import { serverClient } from "@/app/_trpc/serverClient"

const ThreadDetailsPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params
  if (!id) return redirect("/") // TODO 404 page

  const thread = await fetchThreadById(id, true)
  if (!thread) redirect("/") // TODO 404 page

  const user = await currentUser()
  if (!user) redirect("/sign-in")

  const userInfo = await serverClient.user.get(user.id)
  if (!userInfo?.onboarded) redirect("/onboarding")

  return (
    <section className="relative">
      <div>
        <ThreadCard
          key={thread.id}
          id={thread.id}
          currentUserId={user.id}
          parentId={thread.parentId}
          comments={thread.children}
          content={thread.text}
          author={thread.author}
          userInfo={userInfo}
          likeCount={thread.likedByIds.length}
          isLiked={userInfo?.likedThreadIds.includes(thread.id)}
          communityDetails={
            thread.community as communities & { threads: threads[] }
          }
          createdAt={thread.createdAt.toDateString()}
        />
      </div>

      <div className="mt-7">
        <Comment
          threadId={thread.id}
          currentUserImg={userInfo.image}
          currentUserId={JSON.stringify(userInfo.id)}
        />
      </div>

      <div className="mt-7">
        {thread.children.map((comment) => (
          <ThreadCard
            key={comment.id}
            id={comment.id}
            currentUserId={user.id}
            parentId={comment.parentId}
            comments={comment.children}
            content={comment.text}
            author={comment.author}
            userInfo={userInfo}
            likeCount={comment.likedByIds.length}
            isLiked={userInfo?.likedThreadIds.includes(comment.id)}
            communityDetails={
              comment.community as communities & { threads: threads[] }
            }
            createdAt={comment.createdAt.toDateString()}
            isComment={true}
          />
        ))}
      </div>
    </section>
  )
}

export default ThreadDetailsPage
