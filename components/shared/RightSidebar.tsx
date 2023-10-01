import React from 'react'
import CommunityCard from '../cards/CommunityCard'
import { fetchCommunities } from '@/lib/actions/community.actions';
import { fetchUsers } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import UserCard from '../cards/UserCard';

async function RightSidebar() {
  const user = await currentUser();
  if(!user) return null;
  const communities = await fetchCommunities({
    pageNumber: 1,
    pageSize: 2,
    sortBy: "desc",
  });
  const users = await fetchUsers({
    userId: user.id,
    pageNumber: 1,
    pageSize: 3,
    sortBy: "desc",
  });
  return (
    <section className='custom-scrollbar rightsidebar'>
      <div className='flex flex-1 flex-col justify-start'>
        <h3 className='text-light-1 text-heading4-medium'>Suggested Communities</h3>
        <div className='flex flex-col gap-2'>
          {communities?.communities.map((community) => (
            <CommunityCard
              key={community._id}
              id={community._id}
              name={community.name}
              username={community.username}
              imgUrl={community.image}
              bio={community.description}
              members={community.members}
            />
          ))}
        </div>
      </div>
      <div className='flex flex-1 flex-col justify-start'>
        <h3 className='text-light-1 text-heading4-medium'>Suggested Users</h3>
        <div className='mt-2 flex flex-col gap-2'>
          {users?.users.map((user) => (
            <UserCard
              key={user.id}
              id={user._id}
              name={user.name}
              username={user.username}
              imgUrl={user.image}
              personType='User'
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default RightSidebar