
import CreateCommunity from "@/components/forms/CreateCommunity";
import { fetchCommunityDetails } from "@/lib/actions/community.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"

async function EditCommunityPage({ params }: { params: {id: string } }) {

  const user = await currentUser()
  if (!user) return redirect('/');

  const userInfo = await fetchUser(user.id)

  if(!userInfo?.onboarded) redirect('/onboarding');

  const communityDetails = await fetchCommunityDetails(params.id);

  return (
    <div className="flex flex-col gap-4 -mt-8">
      <h1 className='head-text text-left'>Edit Community</h1>

      <CreateCommunity userId={userInfo.uid} communityDetails={communityDetails} />
    </div>
  )
}

export default EditCommunityPage