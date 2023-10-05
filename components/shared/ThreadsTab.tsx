import { fetchUserPosts } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';
import React from 'react'
import ThreadCard from '../cards/ThreadCard';
import { fetchCommunityPosts } from '@/lib/actions/community.actions';

interface ThreadsTabProps {
  currentUserId: string;
  accountId: string;
  accountType: "User" | "Community";
}

const ThreadsTab = async ({
  currentUserId,
  accountId,
  accountType,
}: ThreadsTabProps) => {
  if(accountType === 'User') {  
    const result = await fetchUserPosts(accountId);
    if(!result) return null;

    return (
      <section className='mt-9 flex flex-col gap-10'>
        {result && result.threads.map((thread) => (
          <ThreadCard
            key={thread.id}
            id={thread.id}
            currentUserId={currentUserId}
            parentId={thread.parentId}
            comments={thread.children}
            content={thread.text}
            author={result} //todo
            community={thread.communityId} //todo
            createdAt={thread.createdAt.toDateString()}
            isComment={true}
          />
        ))

        }
      </section>
    )
  } 
  const result = await fetchCommunityPosts(accountId);
  console.log(result);
  if(!result) return <>{result?.id}</>;
  return (
    <section className='mt-9 flex flex-col gap-10'>
      hi
      {result && result.threads.map((thread) => (
        <ThreadCard
          key={thread.id}
          id={thread.id}
          currentUserId={currentUserId}
          parentId={thread.parentId}
          comments={thread.children}
          content={thread.text}
          author={thread.author}
          community={thread.communityId} //todo
          createdAt={thread.createdAt.toDateString()}
          isComment={true}
        />
      ))

      }
    </section>
  );
}

export default ThreadsTab