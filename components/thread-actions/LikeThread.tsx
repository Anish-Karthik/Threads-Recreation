"use client";

import { toggleLikeThread } from '@/lib/actions/thread.actions';
import { useAuth } from '@clerk/nextjs';
import { set } from 'mongoose';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

interface LikeThreadProps {
  isLiked: boolean;
  threadId: string;
  userId: string;
  path: string;
  likeCount: number;
}

const LikeThread = ({isLiked, threadId, userId, likeCount = 0 , path}: LikeThreadProps) => {

  const [likes, setLikes] = useState<any>({
    isLiked: isLiked,
    likes: likeCount,
  }); // [likeObj, setLikeObj] = useState({})
  const user = useAuth();
  const router = useRouter();
  const toggleHeart = async () => {
    if(!user || !user.userId) return router.push('/sign-in');
    const result = await toggleLikeThread(threadId, userId, path);
    if(result == undefined) return console.log('error');
    setLikes(result);
  }
  return (
    <div className='flex items-center justify-start gap-1 text-light-4'>
      <Image src={likes.liked?'/assets/heart-filled.svg': '/assets/heart-gray.svg'} alt='heart' width={24} height={24} className='cursor-pointer object-contain' onClick={toggleHeart}/>
      {likes>0 && likes}
    </div>
  )
}

export default LikeThread