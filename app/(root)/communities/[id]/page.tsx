import UserCard from '@/components/cards/UserCard';
import ProfileHeader from '@/components/shared/ProfileHeader';
import ThreadsTab from '@/components/shared/ThreadsTab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { communityTabs } from '@/constants';
import { fetchCommunityDetails, fetchRequestedUsers, isCommunityMember, isCommunityModerator, isPendingRequest } from '@/lib/actions/community.actions';
import { fetchUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs'
import Image from 'next/image';
import { redirect } from 'next/navigation';
import React from 'react'


const CommunityPage = async ({ params }: { params: {id: string } }) => {
  const user = await currentUser()
  if(!user)  return null;
  const userInfo = await fetchUser(user.id);
  if(!userInfo) return redirect('/onboarding');
  if(!userInfo?.onboarded) redirect('/onboarding');
  const isMember = await isCommunityMember(params.id, userInfo.id);


  const communityDetails = await fetchCommunityDetails(params.id);
  if(!communityDetails) return redirect('/');
  const userRequests = await fetchRequestedUsers(communityDetails.cid);
  const isModerator = await isCommunityModerator(communityDetails.cid, userInfo.uid);
  const pendingRequest = await isPendingRequest(communityDetails.cid, userInfo.uid);
  return (
    <section>
      <ProfileHeader 
        accountId={communityDetails.cid}
        authUserId={user.id}
        name={communityDetails.name}
        username={communityDetails.cid}
        imgUrl={communityDetails.image}
        bio={communityDetails.bio}
        type='Community'
        editable={communityDetails.createdBy.uid === user.id}
        canRequest={!pendingRequest}
        isMember={isMember}
      />

      <div className='mt-9'>
        <Tabs defaultValue='threads' className='w-full'>
          <TabsList className='tab'>
            {communityTabs.map((tab) => {
              if(tab.label === "Requests" && !isModerator) { 
                return <></>
              }
              return (
                <TabsTrigger key={tab.label} value={tab.value} className='tab'>
                  <Image
                    src={tab.icon}
                    alt={tab.label}
                    width={24}
                    height={24}
                    className='object-contain'
                  />
                  <p className='max-sm:hidden'>{tab.label}</p>

                  
                  {communityDetails[tab.value] && <p className='ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2'>{communityDetails[tab.value]?.length}</p>}
                </TabsTrigger>)
            })}
          </TabsList>

          <TabsContent value={"threads"} className='w-full text-light-1'>
            <ThreadsTab
              currentUserId={user.id}
              accountId={communityDetails.cid}
              accountType="Community"
            />
          </TabsContent>
          <TabsContent value={"members"} className='w-full text-light-1'>
            <section className='mt-9 flex flex-col gap-10'>
              {communityDetails.members.map((member) => (
                <UserCard
                  key={member.uid}
                  id={member.uid}
                  name={member.name}
                  username={member.username}
                  imgUrl={member.image}
                  personType='User'
                />
              ))}
            </section>

          </TabsContent>          
          {isModerator && <TabsContent value={"requests"} className='w-full text-light-1'>
            {userRequests && userRequests.map((requestedUser) => (
              <UserCard
                key={requestedUser.id}
                id={requestedUser.uid}
                name={requestedUser.name}
                username={requestedUser.username}
                imgUrl={requestedUser.image}
                personType='User'
                inviteType='Requests'
                communityId={communityDetails.cid}
                userId={requestedUser.uid}
              />
            ))}
          </TabsContent>}        
        </Tabs>
      </div>

    </section>
  )
}

export default CommunityPage