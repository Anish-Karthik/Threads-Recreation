"use client"
import Image from 'next/image';
import React from 'react'
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import JoinOrLeave from '../thread-actions/JoinOrLeave';
import { acceptUserRequest, addModerator, rejectUserRequest, removeModerator, removeUserFromCommunity } from '@/lib/actions/community.actions';
import { acceptCommunityInvite, rejectCommunityInvite } from '@/lib/actions/user.actions';
import { useAuth } from '@clerk/nextjs';

interface UserCardProps {
  id: string;
  name: string;
  username: string;
  imgUrl: string;
  personType: "User" | "Community";
  inviteType?: "Requests" | "Invites";
  communityId?: string;
  userId?: string;
  isMember?: boolean;
  isModerator?: boolean;
  isCreator?: boolean;
  viewerIsModerator?: boolean;
}

const UserCard = ({
  id,
  name,
  username,
  imgUrl,
  personType,
  inviteType,
  communityId,
  userId,
  isMember = false,
  isModerator = false,
  isCreator = false,
  viewerIsModerator = false,
}: UserCardProps) => {
  const router = useRouter();
  const currentUser = useAuth();

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
          <div className='flex justify-start items-center gap-1'>
            <h4 className='text-base-semibold text-light-1 w-fit !mr-6'>{name}</h4>
            {isCreator && <p className='bg-[#33353F] text-light-1 text-small-regular rounded-md flex items-center justify-center px-2'>Creator</p>}
            {isModerator && <p className='bg-light-4 text-light-1 text-small-regular rounded-md flex items-center justify-center px-2'>Admin</p>}
          </div>
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
      {inviteType && userId && communityId && 
        <JoinOrLeave 
          communityId={communityId}
          isMember={false}
          onActionCallback={inviteType === "Invites"? acceptCommunityInvite: acceptUserRequest}
          memberId={userId}
          action='Accept'
        />
      }
      {inviteType && userId && communityId && 
        <JoinOrLeave 
          communityId={communityId}
          isMember={false}
          onActionCallback={inviteType === "Invites"? rejectCommunityInvite: rejectUserRequest}
          memberId={userId}
          action='Reject'
        />
      }
      {!isCreator && currentUser.userId !==id && communityId && isMember && viewerIsModerator &&(
        <JoinOrLeave
          communityId={communityId}
          isMember={isMember}
          onActionCallback={removeUserFromCommunity}
          memberId={userId}
          action="Remove" 
        />
      )}
      {!isCreator && currentUser.userId !==id && communityId && isMember && viewerIsModerator &&(
        <JoinOrLeave
          communityId={communityId}
          isMember={isMember}
          onActionCallback={isModerator ? removeModerator : addModerator}
          memberId={userId}
          action={isModerator ? "Demote" : "Promote"}
        />
      )}

    </article>
  )
}

export default UserCard