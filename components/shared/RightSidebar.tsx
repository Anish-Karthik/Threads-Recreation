import React from 'react'
import CommunityCard from '../cards/CommunityCard'
import { fetchCommunities } from '@/lib/actions/community.actions';
import { fetchUsers } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import UserCard from '../cards/UserCard';

async function RightSidebar() {
  const user = await currentUser();
  // if(!user) return null;
  const communities = await fetchCommunities({
    pageNumber: 1,
    pageSize: 4,
    sortBy: "desc",
  });
  const users = await fetchUsers({
    userId: user?.id || '',
    pageNumber: 1,
    pageSize: 4,
    sortBy: "desc",
  });
  return (
    <section className='custom-scrollbar rightsidebar'>
      <div className='flex flex-1 flex-col justify-start'>
        <h3 className='text-light-1 text-heading4-medium'>Suggested Communities</h3>
        <div className='flex flex-col gap-3'>
          {communities ? communities.communities.map((community) => (
            <UserCard
              key={community.cid}
              id={community.cid}
              name={community.name}
              username={community.cid}
              imgUrl={community.image}
              personType='Community'
            />
          )):(
            <p>No Communities</p>
          )}
        </div>
      </div>
      <div className='flex flex-1 flex-col justify-start'>
        <h3 className='text-light-1 text-heading4-medium'>Suggested Users</h3>
        <div className='mt-2 flex flex-col gap-3'>
          {users ? users.users.map((user) => (
            <UserCard
              key={user.uid}
              id={user.uid}
              name={user.name}
              username={user.username}
              imgUrl={user.image}
              personType='User'
            />
          )):(
            <p>No Users</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default RightSidebar