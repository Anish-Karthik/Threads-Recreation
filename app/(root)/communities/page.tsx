import CommunityCard from "@/components/cards/CommunityCard";
import Pagination from "@/components/shared/Pagination";
import Searchbar from "@/components/shared/Searchbar";
import { fetchCommunities } from "@/lib/actions/community.actions";
import Image from "next/image";
import { PlusCircleIcon } from "lucide-react";
import Link from "next/link";

const CommunityPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {


  const result = await fetchCommunities({
    searchString: searchParams?.q || '',
    pageNumber: searchParams?.page ? +searchParams.page : 1,
    pageSize: 2 + Number((searchParams.page|| 1) !== 1 ),
  });

  return (  
    <section>
      <div className='flex items-center gap-9'>
        <h1 className='head-text'>Search</h1>
        <Searchbar routeType='communities'/>
      </div>
      <div className='mt-14 flex flex-col gap-3 sm:grid sm:grid-cols-2 md:grid-cols-3'>
        {Number(searchParams.page || 1) === 1 && <CreateCommunityCard />}
        {!result.communities || result.communities.length === 0 ? (
        
          <p className='no-result flex items-center'>No Communities Yet</p>
        ) : (
          <>
            {result.communities.map((community) => (
              <CommunityCard key={community.id} 
                id={community.id}
                cid={community.cid}
                name={community.name}
                imgUrl={community.image}
                bio={community.bio}
                members={community.members}
              />
          ))}
          </>
        )}
      </div>
      <Pagination
        path='communities'
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
    </section>
  )
}

export default CommunityPage

function CreateCommunityCard() {
  return (
    <Link className='community-card  text-light-4 hover:bg-light-3 hover:text-dark-4' href={'/create-community'}>
      <div className='flex flex-col items-center gap-4'>
        <PlusCircleIcon size={90} />
        <p className='text-heading3-bold'>Create Community</p>
      </div>
    </Link>
  )
}