import Link from "next/link"
import { PlusCircleIcon } from "lucide-react"

import { fetchCommunities } from "@/lib/actions/community.actions"
import { Button } from "@/components/ui/button"
import CommunityCard from "@/components/cards/CommunityCard"
import Pagination from "@/components/shared/Pagination"
import Searchbar from "@/components/shared/Searchbar"

const CommunityPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) => {
  const result = await fetchCommunities({
    searchString: searchParams?.q || "",
    pageNumber: searchParams?.page ? +searchParams.page : 1,
    pageSize: 6,
  })

  return (
    <section>
      <div className="flex items-center gap-1">
        <Searchbar routeType="communities" />
        <CreateCommunityCard />
      </div>
      <div className="mt-14 flex flex-col gap-3 sm:grid sm:grid-cols-2 md:grid-cols-3">
        {!result.communities || result.communities.length === 0 ? (
          <p className="no-result flex items-center">No Communities Yet</p>
        ) : (
          <>
            {result.communities.map((community) => (
              <CommunityCard
                key={community.id}
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
        path="communities"
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
    </section>
  )
}

export default CommunityPage

function CreateCommunityCard() {
  return (
    <Link href={"/create-community"}>
      <Button className=" user-card_btn flex h-full items-center gap-4 bg-dark-2 text-light-2 hover:text-dark-2">
        <PlusCircleIcon size={38} />
        <p className="text-body-normal ">Create</p>
      </Button>
    </Link>
  )
}
