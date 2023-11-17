import React from "react"
import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs"

import { fetchThreadById } from "@/lib/actions/thread.actions"
import EditThread from "@/components/forms/EditThread"
import { serverClient } from "@/app/_trpc/serverClient"

const EditThreadpage = async ({ params }: { params: { id: string } }) => {
  const { id } = params
  if (!id) return null

  const user = await currentUser()
  if (!user) return redirect("/sign-in")

  const userInfo = await serverClient.user.get(user.id)
  if (!userInfo?.onboarded) redirect("/onboarding")

  const thread = await fetchThreadById(id)
  if (!thread) return null
  return (
    <EditThread
      threadId={id}
      userId={userInfo.id}
      text={thread.text}
      isComment={!!thread.parentId}
    />
  )
}

export default EditThreadpage
