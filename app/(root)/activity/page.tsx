import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs"

import {
  getLikedUserThreads,
  getRepliesToUserThreads,
} from "@/lib/actions/activity.actions"
import { serverClient } from "@/app/_trpc/serverClient"

const ActivityPage = async () => {
  const user = await currentUser()

  if (!user) return redirect("/sign-in")

  const userInfo = await serverClient.user.get(user.id)
  if (!userInfo?.onboarded) redirect("/onboarding")

  const replies = await getRepliesToUserThreads(userInfo.id)
  const LikedThreads = (await getLikedUserThreads(userInfo.id)) || []

  return (
    <section>
      <h1 className="head-text mb-10">Activity</h1>
      <section className="mt-10 flex flex-col gap-5">
        {(replies.length > 0 && (
          <>
            {replies.map((activity, ind) => (
              <Link key={ind} href={`/thread/${activity.parentId}`}>
                <article className="activity-card">
                  <Image
                    src={activity.author.image}
                    alt="user"
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                  <p className="!text-small-regular text-light-1">
                    <span className="mr-1 text-primary-500">
                      {String(activity.author.id) !== String(userInfo.id)
                        ? activity.author.name
                        : "You"}
                    </span>{" "}
                    replied to your thread
                  </p>
                </article>
              </Link>
            ))}
          </>
        )) ||
        LikedThreads.length > 0 ? (
          <>
            {LikedThreads.map((activity, ind) => (
              <Link key={ind} href={`/thread/${activity.id}`}>
                <article className="activity-card">
                  <Image
                    src={activity.author.image}
                    alt="user"
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                  <p className="!text-small-regular text-light-1">
                    <span className="mr-1 text-primary-500">
                      {String(activity.author.id) !== String(userInfo.id)
                        ? activity.author.name
                        : "You"}
                    </span>{" "}
                    liked your thread
                  </p>
                </article>
              </Link>
            ))}
          </>
        ) : (
          <p className="!text-base-regular text-light-3">No activity yet</p>
        )}
      </section>
    </section>
  )
}

export default ActivityPage
