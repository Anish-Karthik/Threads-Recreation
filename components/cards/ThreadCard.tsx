import { fetchCommunityDetails } from '@/lib/actions/community.actions';
import { cn, formatDateString } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'path';
import React from 'react'
import DeleteThread from '../actions/DeleteThread';

interface ThreadCardProps {
  key: string;
  id: string;
  currentUserId: string;
  parentId: string | null;
  content: string;
  author: {
    id: string;
    image: string;
    name: string;
  }
  community: string | null;
  createdAt: string
  comments: {
    author: {
      image: string;
    }
  }[]
  isComment?: boolean;
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
}: 
  ThreadCardProps
) => {
  const communityDetails = await fetchCommunityDetails(community ?? "");


  return (
    <article className={cn('flex flex-col w-full rounded-xl', isComment? 'px-0 xs:px-7 py-3': 'bg-dark-2 p-7')}>
      <div className='flex items-start justify-between'>
        {/* Author name */}
        <div className='flex w-full flex-1 flex-row gap-4'>
          <div className='flex flex-col items-center'>
            <Link href={`/profile/${author.id}`} className='relative h-11 w-11'>
              <Image 
                src={author.image}
                alt='profile image'
                className='rounded-full cursor-pointer'
                layout='fill'
              />
            </Link>
            <div className='thread-card_bar' />
          </div>

          <div className='flex w-full flex-col'>
            <Link href={`/profile/${author.id}`} className='w-fit'>
              <h4 className='cursor-pointer text-base-semibold text-light-2'>{author.name}</h4>
            </Link>

            <p className='mt-2 text-small-regular text-light-2'>{content}</p>

            <div className={cn('mt-5 flex flex-col gap-3', isComment ? 'mb-10': '')}>
              <div className='flex gap-3.5'>
                <Image src="/assets/heart-gray.svg" alt='heart' width={24} height={24} className='cursor-pointer object-contain' />
                <Link href={`/thread/${id}`} className='flex items-center'>
                  <Image src="/assets/reply.svg" alt='reply' width={24} height={24} className='cursor-pointer object-contain' />
                </Link>
                <Image src="/assets/repost.svg" alt='repost' width={24} height={24} className='cursor-pointer object-contain' />
                <Image src="/assets/share.svg" alt='share' width={24} height={24} className='cursor-pointer object-contain' />
                <DeleteThread id={id} author={author.id} currentUserId={currentUserId} />
              </div>
              {/* Commented user Profiles */}
              {(!isComment && comments.length > 0) && (
                <Link href={`/thread/${id}`} className='flex flex-start gap-4'>
                  <p className='mt-1 text-subtle-medium text-gray-1'>
                    {comments.length} {comments.length === 1 ? 'reply' : 'replies'}
                  </p>
                  {comments.length > 0 && (
                    <div className='flex items-center'>
                      { 
                      [... new Set(comments.map((item) => item.author))]
                      .slice(0,3).map((author, index) => (
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
      {!isComment && community && (
        <Link href={`/communities/${communityDetails.id}`} className='mt-5 flex items-center'>
          <p className='text-subtle-medium text-gray-1'>{formatDateString(createdAt)} - {communityDetails.name} Community</p>
          <Image 
            src={communityDetails.image}
            alt={communityDetails.name}
            className='ml-1 rounded-full cursor-pointer object-cover'
            width={14}
            height={14}
          />
        </Link>
      )}
    </article>
  )
}

export default ThreadCard

