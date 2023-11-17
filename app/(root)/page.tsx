import { currentUser } from "@clerk/nextjs"
import { communities, threads } from "@prisma/client"

import { fetchThreads } from "@/lib/actions/thread.actions"
import { fetchUser } from "@/lib/actions/user.actions"
import ThreadCard from "@/components/cards/ThreadCard"
import Pagination from "@/components/shared/Pagination"
import Searchbar from "@/components/shared/Searchbar"

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const results = await fetchThreads(1, 25, true)
  const user = await currentUser()
  const userInfo = await fetchUser(user?.id || "")

  return (
    <div>
      {/* <div className='flex items-center gap-9'> */}
      <h1 className="head-text text-left">Home</h1>
      {/* <Searchbar routeType='' placeHolder='Search Threads'/>
      </div> */}

      <section className="mt-9 flex flex-col gap-10">
        {results?.posts.length === 0 ? (
          <p className="no-result">No threads found.</p>
        ) : (
          <>
            {results?.posts.map((post) => {
              // const community = await fetchCommunityDetails(post.community)
              return (
                (post.parentId === undefined || post.parentId === null) && (
                  <ThreadCard
                    key={post.id}
                    id={post.id}
                    currentUserId={user?.id || ""}
                    parentId={post.parentId}
                    comments={post.children}
                    content={post.text}
                    author={post.author}
                    communityDetails={
                      post.community as communities & { threads: threads[] }
                    }
                    likeCount={post.likedByIds.length}
                    userInfo={userInfo}
                    isLiked={userInfo?.likedThreadIds.includes(post.id)}
                    createdAt={post.createdAt.toDateString()}
                  />
                )
              )
            })}
          </>
        )}
      </section>
    </div>
  )
}
