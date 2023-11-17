import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

import { Button } from "../ui/button"

interface Props {
  id: string
  name: string
  cid: string
  imgUrl: string
  bio: string
  width?: boolean
  members: {
    image: string
  }[]
}

function CommunityCard({ id, name, cid, imgUrl, bio, members, width }: Props) {
  return (
    <article className={cn("community-card", width ? "!w-[18rem]" : "")}>
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/communities/${cid}`} className="relative h-12 w-12">
          <Image
            src={imgUrl}
            alt="community_logo"
            fill
            className="rounded-full object-cover"
          />
        </Link>

        <div>
          <Link href={`/communities/${cid}`}>
            <h4 className="text-base-semibold text-light-1">{name}</h4>
          </Link>
          <p className="text-small-medium text-gray-1">@{cid}</p>
        </div>
      </div>

      <p className="mt-4 text-subtle-medium text-gray-1">{bio}</p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/communities/${cid}`}>
          <Button size="sm" className="community-card_btn">
            View
          </Button>
        </Link>

        {members.length > 0 && (
          <div className="flex items-center">
            {members.map((member, index) => (
              <Image
                key={index}
                src={member.image}
                alt={`user_${index}`}
                width={28}
                height={28}
                className={`${
                  index !== 0 && "-ml-2"
                } rounded-full object-cover`}
              />
            ))}
            {members.length > 3 && (
              <p className="ml-1 text-subtle-medium text-gray-1">
                {members.length}+ Users
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default CommunityCard
