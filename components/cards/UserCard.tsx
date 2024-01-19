"use client"

import { memo, useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { trpc } from "@/app/_trpc/client"

import InviteButton from "../shared/invite-button"
import JoinOrLeave from "../thread-actions/JoinOrLeave"

interface UserCardProps {
  id: string
  name: string
  username: string
  imgUrl: string
  personType: "User" | "Community"
  inviteType?: "Requests" | "Invites"
  communityId?: string
  userId?: string
  isMember?: boolean
  isModerator?: boolean
  isCreator?: boolean
  viewerIsModerator?: boolean
  showInviteButton?: boolean
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
  showInviteButton = false,
}: UserCardProps) => {
  const router = useRouter()
  const currentUser = useAuth()

  const acceptUserRequestHook = trpc.community.user.request.accept.useMutation()
  const addModeratorHook = trpc.community.user.moderator.add.useMutation()
  const rejectUserRequestHook = trpc.community.user.request.reject.useMutation()
  const removeModeratorHook = trpc.community.user.moderator.remove.useMutation()
  const removeUserFromCommunityHook = trpc.community.user.remove.useMutation()
  const acceptCommunityInviteHook =
    trpc.user.community.invite.accept.useMutation()
  const rejectCommunityInviteHook =
    trpc.user.community.invite.reject.useMutation()

  const acceptUserRequest = useCallback(
    async (cid: string, uid: string) => {
      await acceptUserRequestHook.mutateAsync({ cid, uid })
    },
    [acceptUserRequestHook]
  )
  const addModerator = useCallback(
    async (cid: string, uid: string) => {
      await addModeratorHook.mutateAsync({ cid, uid })
    },
    [addModeratorHook]
  )
  const rejectUserRequest = useCallback(
    async (cid: string, uid: string) => {
      await rejectUserRequestHook.mutateAsync({ cid, uid })
    },
    [rejectUserRequestHook]
  )
  const removeModerator = useCallback(
    async (cid: string, uid: string) => {
      await removeModeratorHook.mutateAsync({ cid, uid })
    },
    [removeModeratorHook]
  )
  const removeUserFromCommunity = useCallback(
    async (cid: string, uid: string) => {
      await removeUserFromCommunityHook.mutateAsync({ cid, uid })
    },
    [removeUserFromCommunityHook]
  )
  const acceptCommunityInvite = useCallback(
    async (cid: string, uid: string) => {
      await acceptCommunityInviteHook.mutateAsync({ cid, uid })
    },
    [acceptCommunityInviteHook]
  )
  const rejectCommunityInvite = useCallback(
    async (cid: string, uid: string) => {
      await rejectCommunityInviteHook.mutateAsync({ cid, uid })
    },
    [rejectCommunityInviteHook]
  )
  console.log(communityId)
  const isCommunity = personType === "Community"
  return (
    <article className="user-card">
      <div className="user-card_avatar">
        <div className="relative h-12 w-12">
          <Image
            src={imgUrl}
            alt="user_logo"
            fill
            className="rounded-full object-cover"
          />
        </div>

        <div className="flex-1 text-ellipsis">
          <div className="flex items-center justify-start gap-1">
            <h4 className="!mr-6 w-fit text-base-semibold text-light-1">
              {name}
            </h4>
            {isCreator && (
              <p className="flex items-center justify-center rounded-md bg-[#33353F] px-2 text-small-regular text-light-1">
                Creator
              </p>
            )}
            {isModerator && (
              <p className="flex items-center justify-center rounded-md bg-light-4 px-2 text-small-regular text-light-1">
                Admin
              </p>
            )}
          </div>
          <p className="text-small-medium text-gray-1">@{username}</p>
        </div>
      </div>

      <Button
        className="user-card_btn"
        onClick={() => {
          if (isCommunity) {
            router.push(`/communities/${id}`)
          } else {
            router.push(`/profile/${id}`)
          }
        }}
      >
        View
      </Button>
      {showInviteButton && (
        <InviteButton communityId={communityId} userId={id} />
      )}

      {inviteType && userId && communityId && (
        // Accept Invite from community (or) Accept Request from user to join community
        <JoinOrLeave
          communityId={communityId}
          isMember={false}
          onActionCallback={
            inviteType === "Invites" ? acceptCommunityInvite : acceptUserRequest
          }
          memberId={userId}
          action="Accept"
        />
      )}
      {/* if Invite, it is displayed on user profile on Invites tab */}
      {/* if Request,  it is displayed on user community on Requests tab  */}
      {inviteType && userId && communityId && (
        // Reject Invite from community (or) Reject Request from user to join community
        <JoinOrLeave
          communityId={communityId}
          isMember={false}
          onActionCallback={
            inviteType === "Invites" ? rejectCommunityInvite : rejectUserRequest
          }
          memberId={userId}
          action="Reject"
        />
      )}

      {/* Community members view */}
      {!isCreator &&
        currentUser.userId !== id &&
        communityId &&
        isMember &&
        viewerIsModerator && (
          // Remove user from community if viewer is moderator
          <JoinOrLeave
            communityId={communityId}
            isMember={isMember}
            onActionCallback={removeUserFromCommunity}
            memberId={userId}
            action="Remove"
          />
        )}
      {/* Community members view */}
      {!isCreator &&
        currentUser.userId !== id &&
        communityId &&
        isMember &&
        viewerIsModerator && (
          // Promote/Demote user to/from moderator if viewer is moderator
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

export default memo(UserCard)
