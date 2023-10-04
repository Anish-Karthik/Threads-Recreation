"use client"
import Image from 'next/image';
import React from 'react'
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface UserCardProps {
  key: string;
  id: string;
  name: string;
  username: string;
  imgUrl: string;
  personType: "User" | "Community";
}

const UserCard = ({
  key,
  id,
  name,
  username,
  imgUrl,
  personType,
}: UserCardProps) => {
  const router = useRouter();

  const isCommunity = personType === "Community";
  return (
    <article className='user-card'>
      <div className='user-card_avatar'>
        <div className='relative h-12 w-12'>
          <Image
            src={imgUrl}
            alt='user_logo'
            fill
            className='rounded-full object-cover'
          />
        </div>

        <div className='flex-1 text-ellipsis'>
          <h4 className='text-base-semibold text-light-1'>{name}</h4>
          <p className='text-small-medium text-gray-1'>@{username}</p>
        </div>
      </div>

      <Button
        className='user-card_btn'
        onClick={() => {
          if (isCommunity) {
            router.push(`/communities/${id}`);
          } else {
            router.push(`/profile/${id}`);
          }
        }}
      >
        View
      </Button>
    </article>
  )
}

export default UserCard