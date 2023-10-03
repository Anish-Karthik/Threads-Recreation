
import EditThread from '@/components/forms/EditThread';
import { fetchThreadById } from '@/lib/actions/thread.actions';
import { fetchUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import React from 'react'

const EditThreadpage = async ({ params }: { params: { id : string }}) => {
  const { id } = params
  if (!id) return null;
  
  const user = await currentUser();
  if(!user) return null;

  const userInfo = await fetchUser(user.id);
  if(!userInfo?.onboarded) redirect('/onboarding');

  const thread = await fetchThreadById(id);
  return (
    <EditThread threadId={id} userId={userInfo._id} text={thread.text} />
  )
}

export default EditThreadpage