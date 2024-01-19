import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs"

import ProfileHeader from "@/components/shared/ProfileHeader"
import CommunityTabs from "@/components/tabs/community-tabs"
import { serverClient } from "@/app/_trpc/serverClient"

const CommunityPage = async ({ params }: { params: { id: string } }) => {
  const user = await currentUser()
  if (!user) return redirect("/sign-in")

  const userInfo = await serverClient.user.get(user.id)
  if (!userInfo || !userInfo.onboarded) return redirect("/onboarding")

  const communityDetails = await serverClient.community.get(params.id)
  if (!communityDetails) return redirect("/")

  const isMember = userInfo.communityIds.includes(communityDetails.id)
  const isModerator = userInfo.moderatedCommunityIds.includes(
    communityDetails.id
  )
  const joinRequests = communityDetails.requests
  const pendingRequest = communityDetails.requestsIds.includes(userInfo.id)

  const result = await serverClient.community.thread.getAll(
    communityDetails.cid
  )
  console.log(isModerator)
  return (
    <section>
      <ProfileHeader
        accountId={communityDetails.cid}
        authUserId={user.id}
        name={communityDetails.name}
        username={communityDetails.cid}
        imgUrl={communityDetails.image}
        bio={communityDetails.bio}
        type="Community"
        editable={communityDetails.createdBy.uid === user.id}
        canRequest={!pendingRequest}
        isMember={isMember}
        joinMode={communityDetails.joinMode}
        isModerator={isModerator}
      />

      <div className="mt-9">
        <CommunityTabs
          result={result}
          communityDetails={communityDetails}
          isModerator={isModerator}
          joinRequests={joinRequests}
        />
      </div>
    </section>
  )
}

export default CommunityPage
