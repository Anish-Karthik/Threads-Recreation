import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs"

import CreateCommunity from "@/components/forms/CreateCommunity"
import { serverClient } from "@/app/_trpc/serverClient"

async function EditCommunityPage({ params }: { params: { id: string } }) {
  const user = await currentUser()
  if (!user) return redirect("/")
  const userInfo = await serverClient.user.get(user.id)
  if (!userInfo?.onboarded) redirect("/onboarding")

  const communityDetails = await serverClient.community.get(params.id)
  if (!communityDetails) return redirect("/")
  // TODO: show unauthorized page
  if (communityDetails.createdBy.id !== userInfo.id) return redirect("/")

  return (
    <div className="mt-6 flex flex-col gap-4">
      <h1 className="head-text text-left">Edit Community</h1>

      <CreateCommunity
        userId={userInfo.uid}
        communityDetails={communityDetails}
      />
    </div>
  )
}

export default EditCommunityPage
