import React from "react"
import Image from "next/image"
import Link from "next/link"

import { fetchCommunityDetailsById } from "@/lib/actions/community.actions"
import {
  deleteThread,
  fetchLikeCount,
  isLikedThread,
} from "@/lib/actions/thread.actions"
import { fetchUser } from "@/lib/actions/user.actions"
import { cn, formatDateString } from "@/lib/utils"

import DeleteThread from "../forms/DeleteEntity"
import DeleteEntity from "../forms/DeleteEntity"
import LikeThread from "../thread-actions/LikeThread"
import ShareThread from "../thread-actions/ShareThread"

interface ThreadCardProps {
  key: string
  id: string
  currentUserId: string
  parentId: string | null
  content: string
  author: {
    uid: string
    id: string
    image: string
    name: string
  }
  community: string | null
  createdAt: string
  comments: {
    author: {
      image: string
    }
  }[]
  isComment?: boolean
}

const ThreadCard = async ({
  key,
  id,
  currentUserId,
  parentId,
  content,
  author,
  community,
  createdAt,
  comments,
  isComment,
}: ThreadCardProps) => {
  const communityDetails = await fetchCommunityDetailsById(community || "")
  const likeCount = await fetchLikeCount(id)
  const userInfo = await fetchUser(currentUserId)
  const isLiked = userInfo ? await isLikedThread(id, currentUserId) : false

  return (
    <article
      className={cn(
        "flex w-full flex-col rounded-xl",
        isComment ? "px-0 py-3 xs:px-7" : "bg-dark-2 p-7"
      )}
    >
      <div className="flex items-start justify-between">
        {/* Author name */}
        <div className="flex w-full flex-1 flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link
              href={`/profile/${author.uid}`}
              className="relative h-11 w-11"
            >
              <Image
                src={author.image}
                alt="profile image"
                className="cursor-pointer rounded-full"
                layout="fill"
              />
            </Link>
            <div className="thread-card_bar" />
          </div>

          <div className="flex w-full flex-col">
            <div className="flex flex-row items-center justify-between">
              <Link href={`/profile/${author.uid}`} className="w-fit">
                <h4 className="cursor-pointer text-base-semibold text-light-2">
                  {author.name}
                </h4>
              </Link>

              {((currentUserId && currentUserId == author.uid) ||
                (community &&
                  communityDetails &&
                  communityDetails.moderatorsIds.includes(userInfo?.id))) && (
                <div className="flex gap-2">
                  <DeleteEntity
                    id={id}
                    type="Thread"
                    deleteCallback={deleteThread}
                  />
                  <Link href={`/thread/${id}/edit`}>
                    <Image
                      src="/assets/edit.svg"
                      alt="edit"
                      width={24}
                      height={24}
                      className="cursor-pointer object-contain"
                    />
                  </Link>
                </div>
              )}
            </div>

            <p className="mt-2 text-small-regular text-light-2">{content}</p>

            <div
              className={cn(
                "mt-5 flex flex-col gap-3",
                isComment ? "mb-10" : ""
              )}
            >
              <div className="flex gap-3.5">
                <LikeThread
                  threadId={id}
                  userId={currentUserId}
                  isLiked={isLiked}
                  path="/"
                  likeCount={likeCount}
                />
                <Link href={`/thread/${id}`} className="flex items-center">
                  <Image
                    src="/assets/reply.svg"
                    alt="reply"
                    width={24}
                    height={24}
                    className="cursor-pointer object-contain"
                  />
                </Link>
                <Image
                  src="/assets/repost.svg"
                  alt="repost"
                  width={24}
                  height={24}
                  className="cursor-pointer object-contain"
                />
                <ShareThread threadId={id} />
              </div>
              {/* Commented user Profiles */}
              {comments.length > 0 && (
                <Link href={`/thread/${id}`} className="flex-start flex gap-4">
                  <p className="mt-1 text-subtle-medium text-gray-1">
                    {comments.length}{" "}
                    {comments.length === 1 ? "reply" : "replies"}
                  </p>
                  {comments.length > 0 && (
                    <div className="flex items-center">
                      {[...new Set(comments.map((item) => item.author))]
                        .slice(0, 3)
                        .map((author, index) => (
                          <Image
                            key={index}
                            src={author.image}
                            alt={`user_${index}`}
                            width={28}
                            height={28}
                            className={`${
                              index !== 0 && "-ml-2"
                            } rounded-full object-cover`}
                          />
                        ))}
                    </div>
                  )}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      {!isComment && community && communityDetails && (
        <Link
          href={`/communities/${communityDetails.cid}`}
          className="mt-5 flex items-center"
        >
          <p className="text-subtle-medium text-gray-1">
            {formatDateString(createdAt)} - {communityDetails.name} Community
          </p>
          <Image
            src={communityDetails.image}
            alt={communityDetails.name}
            className="ml-1 cursor-pointer rounded-full object-cover"
            width={14}
            height={14}
          />
        </Link>
      )}
    </article>
  )
}

export default ThreadCard
