import ThreadCard from '@/components/cards/ThreadCard'
import React from 'react'
import { currentUser } from '@clerk/nextjs'
import { fetchUser } from '@/lib/actions/user.actions'
import { redirect } from 'next/navigation'
import { fetchThreadById } from '@/lib/actions/thread.actions'

const ThreadDetailsPage = async ({ params }: { params: { id : string }}) => {
  const { id } = params
  if (!id) return null;
  
  const user = await currentUser();
  if(!user) return null;

  const userInfo = await fetchUser(user.id);
  if(!userInfo?.onboarded) redirect('/onboarding');

  const thread = await fetchThreadById(id);

  return (
    <ThreadCard 
      key={thread._id}
      id={thread._id}
      currentUserId={user?.id || ''}
      parentId={thread.parentId}
      comments={thread.children}
      content={thread.text}
      author={thread.author}
      community={thread.community}
      createdAt={thread.createdAt}
    />
  )
}

export default ThreadDetailsPage