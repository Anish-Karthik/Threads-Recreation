import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs"

import PostThread from "@/components/forms/PostThread"
import { serverClient } from "@/app/_trpc/serverClient"

async function CreateThreadPage() {
  const user = await currentUser()

  if (!user) return redirect("/sign-in")

  const userInfo = await serverClient.user.get(user.id)

  if (!userInfo?.onboarded) redirect("/onboarding")

  return (
    <div className="flex flex-col gap-8">
      <h1 className="head-text text-left">Create Thread</h1>

      <PostThread
        userId={userInfo.id}
        communities={userInfo.communities}
        isComment={false}
      />
    </div>
  )
}

export default CreateThreadPage
