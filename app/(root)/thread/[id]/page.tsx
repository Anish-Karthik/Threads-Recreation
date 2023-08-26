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
  if(!user) return null;

  const userInfo = await fetchUser(user.id);
  if(!userInfo?.onboarded) redirect('/onboarding');

  const thread = await fetchThreadById(id);

  return (
    <section className='relative'>
      <div>
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
      </div>

      <div className='mt-7'>
        <Comment 
          threadId={thread.id}
          currentUserImg={userInfo.image}
          currentUserId={JSON.stringify(userInfo._id)} 
        />
      </div>

      <div className='mt-7'>
        {thread.children.map((comment : any) => (
        <ThreadCard 
            key={comment._id}
            id={comment._id}
            currentUserId={user?.id || ''}
            parentId={comment.parentId}
            comments={comment.children}
            content={comment.text}
            author={comment.author}
            community={comment.community}
            createdAt={comment.createdAt}
            isComment={true}
        />
        ))}
      </div>

    </section>
  )
}

export default ThreadDetailsPage