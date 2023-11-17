import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs"

import { fetchUser } from "@/lib/actions/user.actions"
import CreateCommunity from "@/components/forms/CreateCommunity"

async function CreateCommmunityPage() {
  const user = await currentUser()

  if (!user) return null

  const userInfo = await fetchUser(user.id)

  if (!userInfo?.onboarded) redirect("/onboarding")

  return (
    <div className="-mt-8 flex flex-col gap-4">
      <h1 className="head-text text-left">Create Community</h1>

      <CreateCommunity userId={userInfo.uid} />
    </div>
  )
}

export default CreateCommmunityPage
