"use client"

import { memo } from "react"
import Image from "next/image"
import { profileTabs } from "@/constants"
import { useAuth } from "@clerk/nextjs"
import { communities, users } from "@prisma/client"

import { fetchUserPosts } from "@/lib/actions/user.actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserCard from "@/components/cards/UserCard"
import ThreadsTab from "@/components/shared/ThreadsTab"

const ProfileTabs = ({
  result,
  userInfo,
  communityInvites,
  isNotSameUser = false,
}: {
  result: Awaited<ReturnType<typeof fetchUserPosts>>
  userInfo: users & { communities: communities[] }
  communityInvites: communities[]
  isNotSameUser?: boolean
}) => {
  const { userId } = useAuth()
  const tabs = !isNotSameUser ? profileTabs : profileTabs.slice(0, 2)

  return (
    <Tabs defaultValue="threads" className="w-full">
      <TabsList className="tab">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.label} value={tab.value} className="tab">
            <Image
              src={tab.icon}
              alt={tab.label}
              width={24}
              height={24}
              className="object-contain"
            />
            <p className="max-sm:hidden">{tab.label}</p>

            {userInfo[tab.value]?.length > 0 && (
              <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                {userInfo[tab.value]?.length}
              </p>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent
        key={profileTabs[0].label}
        value={profileTabs[0].value}
        className="w-full text-light-1"
      >
        <ThreadsTab
          result={result}
          currentUserId={userId}
          accountId={userInfo.uid}
          accountType="User"
        />
      </TabsContent>
      <TabsContent
        key={profileTabs[1].label}
        value={profileTabs[1].value}
        className="w-full text-light-1"
      >
        {userInfo.communities &&
          userInfo.communities.map((community) => (
            <UserCard
              key={community.id}
              id={community.cid}
              name={community.name}
              username={community.cid}
              imgUrl={community.image}
              personType="Community"
            />
          ))}
      </TabsContent>
      {userId === userInfo.uid && (
        <TabsContent
          key={profileTabs[2].label}
          value={profileTabs[2].value}
          className="w-full text-light-1"
        >
          {communityInvites &&
            communityInvites.map((invitedCommunity) => (
              <UserCard
                key={invitedCommunity.id}
                id={invitedCommunity.cid}
                name={invitedCommunity.name}
                username={invitedCommunity.cid}
                imgUrl={invitedCommunity.image}
                personType="Community"
                inviteType="Invites"
                communityId={invitedCommunity.cid}
                userId={userInfo.uid}
              />
            ))}
        </TabsContent>
      )}
    </Tabs>
  )
}

export default memo(ProfileTabs)
