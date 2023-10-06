
import CreateCommunity from "@/components/forms/CreateCommunity";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"

async function CreateCommmunityPage() {
  const user = await currentUser()

  if (!user) return null;

  const userInfo = await fetchUser(user.id)

  if(!userInfo?.onboarded) redirect('/onboarding');

  return (
    <div className="flex flex-col gap-4 -mt-8">
      <h1 className='head-text text-left'>Create Community</h1>

      <CreateCommunity userId={userInfo.uid} />
    </div>
  )
}

export default CreateCommmunityPage