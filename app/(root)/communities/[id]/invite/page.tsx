import { currentUser } from "@clerk/nextjs"

import { fetchUsers } from "@/lib/actions/user.actions"
import db from "@/lib/db"
import UserCard from "@/components/cards/UserCard"
import Pagination from "@/components/shared/Pagination"
import Searchbar from "@/components/shared/Searchbar"
import { serverClient } from "@/app/_trpc/serverClient"

const SearchPage = async ({
  searchParams,
  params,
}: {
  searchParams: { [key: string]: string | undefined }
  params: { id: string }
}) => {
  const user = await currentUser()
  const community = await db.communities.findUnique({
    where: {
      cid: params.id,
    },
  })

  const result = await fetchUsers({
    userId: user?.id || "",
    searchString: searchParams.q || "",
    pageNumber: searchParams.page ? +searchParams.page : 1,
    pageSize: 25,
    communityId: community?.id,
  })

  return (
    <section>
      <div className="flex items-center gap-9">
        <h1 className="head-text">Search</h1>
        <Searchbar />
      </div>

      <div className="mt-14 flex flex-col gap-9">
        {result.users.length === 0 ? (
          <p className="no-result">No users</p>
        ) : (
          <>
            {result.users.map((person) => (
              <UserCard
                key={person.uid}
                id={person.uid}
                name={person.name}
                username={person.username}
                imgUrl={person.image}
                personType="User"
                communityId={params.id}
                showInviteButton={true}
              />
            ))}
          </>
        )}
      </div>

      <Pagination
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
    </section>
  )
}

export default SearchPage
