import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs"

import CreateCommunity from "@/components/forms/CreateCommunity"
import { serverClient } from "@/app/_trpc/serverClient"

async function CreateCommmunityPage() {
  const user = await currentUser()

  if (!user) return redirect("/sign-in")

  const userInfo = await serverClient.user.get(user.id)

  if (!userInfo?.onboarded) redirect("/onboarding")

  return (
    <div className="-mt-8 flex flex-col gap-4">
      <h1 className="head-text text-left">Create Community</h1>

      <CreateCommunity userId={userInfo.uid} />
    </div>
  )
}

export default CreateCommmunityPage
