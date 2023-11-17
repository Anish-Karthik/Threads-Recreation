"use client"

import React, { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import toast from "react-hot-toast"

import { toggleLikeThread } from "@/lib/actions/thread.actions"

interface LikeThreadProps {
  isLiked: boolean
  threadId: string
  userId: string
  path: string
  likeCount: number
}

const LikeThread = ({
  isLiked,
  threadId,
  userId,
  likeCount = 0,
  path,
}: LikeThreadProps) => {
  const [like, setLike] = useState({
    isLiked: isLiked,
    likes: likeCount,
  })
  const user = useAuth()
  const router = useRouter()
  const toggleHeart = async () => {
    if (!user || !user.userId) return router.push("/sign-in")
    try {
      const result = await toggleLikeThread(threadId, userId, path)
      if (!result) {
        toast.error("Something went wrong")
        return
      }
      setLike(result)
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  return (
    <div className="flex items-center justify-start gap-1 text-light-4">
      <Image
        src={
          like.isLiked ? "/assets/heart-filled.svg" : "/assets/heart-gray.svg"
        }
        alt="heart"
        width={24}
        height={24}
        className="cursor-pointer object-contain"
        onClick={toggleHeart}
      />
      {like.likes > 0 && like.likes}
    </div>
  )
}

export default LikeThread
