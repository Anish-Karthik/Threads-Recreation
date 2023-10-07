"use client"
import Image from 'next/image';
import React from 'react'
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import JoinOrLeave from '../thread-actions/JoinOrLeave';
import { acceptUserRequest, addModerator, rejectUserRequest, removeModerator, removeUserFromCommunity } from '@/lib/actions/community.actions';
import { acceptCommunityInvite, rejectCommunityInvite } from '@/lib/actions/user.actions';

interface UserCardProps {
  key: string;
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
  viewerIsModerator?: boolean;
}

const UserCard = ({
  key,
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
  viewerIsModerator = false,
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
      {communityId && isMember && viewerIsModerator &&(
        <JoinOrLeave
          communityId={communityId}
          isMember={isMember}
          onActionCallback={removeUserFromCommunity}
          memberId={userId}
          action="Remove" 
        />
      )}
      {communityId && isMember && viewerIsModerator &&(
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