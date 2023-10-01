import CommunityCard from "@/components/cards/CommunityCard";
import { fetchCommunities } from "@/lib/actions/community.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation';

const CommunityPage = async () => {
  const user = await currentUser()

  if(!user)  return null;
  const userInfo = await fetchUser(user.id);
  if(!userInfo?.onboarded) redirect('/onboarding');

  const {communities} = await fetchCommunities({});

  return (
    <section>
      <h1 className="head-text mb-10">Search</h1>
      {/* Search Bar */}
      <div className='mt-14 flex flex-wrap gap-9'>
        {!communities || communities.length === 0 ? (
          <p className='no-result'>No Communities</p>
        ) : (
          <>
            {communities.map((community) => (
              <CommunityCard key={community.id} 
                id={community.id}
                name={community.name}
                username={community.username}
                imgUrl={community.image}
                bio={community.bio}
                members={community.members}
              />
          ))}
          </>
        )}
      </div>
    </section>
  )
}

export default CommunityPage