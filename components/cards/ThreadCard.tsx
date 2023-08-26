import React from 'react'

interface ThreadCardProps {
  key: string;
  id: string;
  currentUserId?: string;
  parentId: string | null;
  content: string;
  author: {
    id: string;
    image: string;
    name: string;
  }
  community: {
    id: string;
    name: string;
    image: string;
  } | null;
  createdAt: string
  comments: {
    author: {
      image: string;
    }
  }[]
  isComment?: boolean;
}


const ThreadCard = ({
  key,
  id,
  currentUserId,
  parentId,
  content,
  author,
  community,
  createdAt,
  comments,
}: 
  ThreadCardProps
) => {
  return (
    <article>

    </article>
  )
}

export default ThreadCard