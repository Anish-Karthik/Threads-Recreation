"use client"

import React, { memo } from "react"
import Image from "next/image"
import { communityTabs } from "@/constants"
import { useAuth } from "@clerk/nextjs"
import { communities, users } from "@prisma/client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserCard from "@/components/cards/UserCard"
import ThreadsTab from "@/components/shared/ThreadsTab"

const CommunityTabs = ({
  communityDetails,
  isModerator,
  joinRequests,
}: {
  communityDetails: communities & { members: users[]; createdBy: users }
  isModerator: boolean
  joinRequests: users[]
}) => {
  const { userId } = useAuth()
  return (
    <Tabs defaultValue="threads" className="w-full">
      <TabsList className="tab">
        {communityTabs.map((tab) => {
          if (tab.label === "Requests" && !isModerator) {
            return <></>
          }
          return (
            <TabsTrigger key={tab.label} value={tab.value} className="tab">
              <Image
                src={tab.icon}
                alt={tab.label}
                width={24}
                height={24}
                className="object-contain"
              />
              <p className="max-sm:hidden">{tab.label}</p>
              {communityDetails[tab.value]?.length > 0 && (
                <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                  {communityDetails[tab.value].length}
                </p>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>

      <TabsContent value={"threads"} className="w-full text-light-1">
        <ThreadsTab
          currentUserId={userId}
          accountId={communityDetails.cid}
          accountType="Community"
        />
      </TabsContent>
      <TabsContent value={"members"} className="w-full text-light-1">
        <section className="mt-9 flex flex-col gap-10">
          {communityDetails.members.map((member) => (
            <UserCard
              key={member.uid}
              id={member.uid}
              name={member.name}
              username={member.username}
              imgUrl={member.image}
              personType="User"
              userId={member.uid}
              communityId={communityDetails.cid}
              isMember={true}
              isModerator={member.moderatedCommunityIds.includes(
                communityDetails.id
              )}
              isCreator={member.id === communityDetails.createdBy.id}
              viewerIsModerator={isModerator}
            />
          ))}
        </section>
      </TabsContent>
      {isModerator && (
        <TabsContent value={"requests"} className="w-full text-light-1">
          {joinRequests &&
            joinRequests.map((requestedUser) => (
              <UserCard
                key={requestedUser.id}
                id={requestedUser.uid}
                name={requestedUser.name}
                username={requestedUser.username}
                imgUrl={requestedUser.image}
                personType="User"
                inviteType="Requests"
                communityId={communityDetails.cid}
                userId={requestedUser.uid}
              />
            ))}
        </TabsContent>
      )}
    </Tabs>
  )
}

export default memo(CommunityTabs)
