
import ThreadCard from "@/components/cards/ThreadCard";
import Pagination from "@/components/shared/Pagination";
import Searchbar from "@/components/shared/Searchbar";
import { fetchThreads } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs";

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const results = await fetchThreads(1, 25);
  const user = await currentUser();

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
              {results?.posts.map( (post) => {
                // const community = await fetchCommunityDetails(post.community)
                return ( 
                <ThreadCard 
                  key={post.id}
                  id={post.id}
                  currentUserId={user?.id || ''}
                  parentId={post.parentId}
                  comments={post.children}
                  content={post.text}
                  author={post.author}
                  community={post.communityId}
                  createdAt={post.createdAt.toDateString()}
                />
              )})}
            </>
        )}
      </section>
    </div>
  )
}