import ThreadCard from '@/components/cards/ThreadCard'
import React from 'react'
import { currentUser } from '@clerk/nextjs'
import { fetchUser } from '@/lib/actions/user.actions'
import { redirect } from 'next/navigation'
import { fetchThreadById } from '@/lib/actions/thread.actions'
import Comment from '@/components/forms/Comment'

const ThreadDetailsPage = async ({ params }: { params: { id : string }}) => {
  const { id } = params
  if (!id) return null;
  
  const user = await currentUser();
  if(!user) redirect('/sign-in');

  const userInfo = await fetchUser(user.id);
  if(!userInfo?.onboarded) redirect('/onboarding');

  const thread = await fetchThreadById(id);
  if(!thread) redirect('/')

  return (
    <section className='relative'>
      <div>
        <ThreadCard 
          key={thread.id}
          id={thread.id}
          currentUserId={user.id}
          parentId={thread.parentId}
          comments={thread.children}
          content={thread.text}
          author={thread.author}
          community={thread.communityId}
          createdAt={thread.createdAt.toDateString()}
        />
      </div>

      <div className='mt-7'>
        <Comment 
          threadId={thread.id}
          currentUserImg={userInfo.image}
          currentUserId={JSON.stringify(userInfo.id)} 
        />
      </div>

      <div className='mt-7'>
        {thread.children.map((comment) => (
        <ThreadCard 
          key={comment.id}
          id={comment.id}
          currentUserId={user.id}
          parentId={comment.parentId}
          comments={comment.children}
          content={comment.text}
          author={comment.author}
          community={comment.communityId}
          createdAt={comment.createdAt.toDateString()}
          isComment={true}
        />
        ))}
      </div>

    </section>
  )
}

export default ThreadDetailsPage