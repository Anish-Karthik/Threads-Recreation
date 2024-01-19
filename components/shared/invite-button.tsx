import { useCallback } from "react"
import { CheckIcon, Loader } from "lucide-react"

import { trpc } from "@/app/_trpc/client"

import { Button } from "../ui/button"

const InviteButton = ({
  communityId,
  userId,
}: {
  communityId: string
  userId: string
}) => {
  console.log("communityId", communityId, "userId", userId)
  const inviteUserToCommunityHook = trpc.community.user.invite.useMutation()
  const inviteUser = useCallback(async () => {
    await inviteUserToCommunityHook.mutateAsync({
      cid: communityId,
      uid: userId,
    })
  }, [inviteUserToCommunityHook, communityId, userId])
  return (
    <div>
      {inviteUserToCommunityHook.isLoading ? (
        <Button disabled>
          <Loader />
        </Button>
      ) : !inviteUserToCommunityHook.isSuccess ? (
        <Button onClick={inviteUser}>Invite</Button>
      ) : (
        <CheckIcon className="h-5 w-5 text-gray-400" />
      )}
    </div>
  )
}

export default InviteButton
