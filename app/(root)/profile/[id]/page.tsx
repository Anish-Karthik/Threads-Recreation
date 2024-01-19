import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs"

import ProfileHeader from "@/components/shared/ProfileHeader"
import ProfileTabs from "@/components/tabs/profile-tabs"
import { serverClient } from "@/app/_trpc/serverClient"

const ProfilePage = async ({ params }: { params: { id: string } }) => {
  const user = await currentUser()
  if (!user) return redirect("/sign-in")

  const userInfo = await serverClient.user.get(params.id)
  if (!userInfo || !userInfo.onboarded) redirect("/") //TODO 404 page

  const communityInvites = await serverClient.user.community.invited.getAll(
    userInfo.uid
  )
  const visitingUser = await serverClient.user.get(user.id)
  if (!visitingUser || !visitingUser?.onboarded) return redirect("/onboarding")

  const visitingUserCommunities = visitingUser.moderatedCommunities.map(
    (community) => community.cid
  )
  const currentUserCommunities = new Set(
    [...userInfo.communities, ...userInfo.invitedCommunities].map(
      (community) => community.cid
    )
  )
  const notJoinedCommunities = visitingUserCommunities.filter(
    (community) => !currentUserCommunities.has(community)
  )

  const result = await serverClient.user.thread.getAll(userInfo.uid)

  const isNotSameUser = user.id !== params.id

  return (
    <section>
      <ProfileHeader
        accountId={userInfo.uid}
        authUserId={user.id}
        name={userInfo.name}
        username={userInfo.username}
        imgUrl={userInfo.image}
        bio={userInfo.bio}
        editable={user.id === userInfo.uid}
        notJoinedCommunities={notJoinedCommunities}
      />
      {/* user.id !== userInfo.uid */}
      <div className="mt-9">
        <ProfileTabs
          isNotSameUser={isNotSameUser}
          result={result}
          userInfo={visitingUser}
          communityInvites={communityInvites}
        />
      </div>
    </section>
  )
}

export default ProfilePage
