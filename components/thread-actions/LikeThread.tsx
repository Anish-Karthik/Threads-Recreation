"use client";

import { toggleLikeThread } from '@/lib/actions/thread.actions';
import { useAuth } from '@clerk/nextjs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import toast from 'react-hot-toast';

interface LikeThreadProps {
  isLiked: boolean;
  threadId: string;
  userId: string;
  path: string;
  likeCount: number;
}

const LikeThread = ({isLiked, threadId, userId, likeCount = 0 , path}: LikeThreadProps) => {

  const [liked, setLiked] = useState(isLiked);
  // const [likes, setLikes] = useState(likeCount);
  const user = useAuth();
  const router = useRouter();
  const toggleHeart = async () => {
    if(!user || !user.userId) return router.push('/sign-in');
    try {
      const result = await toggleLikeThread(threadId, userId, path);
      if(!result) {
        toast.error('Something went wrong');
        return;
      }
      setLiked(result.isLiked);
      // setLikes(result.likes);
    } catch (error) {
      toast.error('Something went wrong');
    }
  }


  return (
    <div className='flex items-center justify-start gap-1 text-light-4'>
      <Image src={liked?'/assets/heart-filled.svg': '/assets/heart-gray.svg'} alt='heart' width={24} height={24} className='cursor-pointer object-contain' onClick={toggleHeart}/>
      {likeCount + (liked?1:0) - 1 > 0 && likeCount + (liked?1:0) - 1 }
    </div>
  )
}

export default LikeThread