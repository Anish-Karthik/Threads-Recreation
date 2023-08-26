
import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"

async function CreateThreadPage() {
  const user = await currentUser()

  if (!user) return null;

  const userInfo = await fetchUser(user.id)

  if(!userInfo?.onboarded) redirect('/onboarding');

  return (
    <div>
      <h1 className='head_text'>Create Thread</h1>

      <PostThread userId={userInfo._id} />
    </div>
  )
}

export default CreateThreadPage