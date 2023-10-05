"use server";

import prismadb from "./prismadb";
import { fetchUser } from "./user.actions";

type SortOrder = "asc" | "desc";

export async function isAlreadyCommunity(cid: string) {
  try {
    const community = await prismadb.communities.findUnique({
      where: {
        cid: cid,
      },
    });
    return !!community;
  } catch (error) {
    // Handle any errors
    console.error("Error checking if community exists:", error);
    throw error;
  }
}

export async function createCommunity({
  name,
  cid,
  image,
  bio,
  createdById 
}:{
  name: string,
  cid: string,
  image: string,
  bio: string,
  createdById: string 
}) {
  try {

    // Find the user with the provided unique id
    const user = await fetchUser(createdById);

    if (!user) {
      throw new Error("User not found"); // Handle the case if the user with the id is not found
    }
    if (await isAlreadyCommunity(cid)) {
      throw new Error("Community with this cid already exists"); // Handle the case if the user with the id is not found
    }

    const newCommunity = await prismadb.communities.create({
      data: {
        name,
        cid,
        image,
        bio,
        createdById: user.id,
      },
    });

    // Update User model
    await prismadb.users.update({
      where: {
        id: user.id,
      },
      data: {
        communities: {
          connect: {
            cid: newCommunity.cid,
          },
        },
      },
    });

    return newCommunity;
  } catch (error) {
    // Handle any errors
    console.error("Error creating community:", error);
    throw error;
  }
}

export async function fetchCommunityDetails(id: string | null) {
  try {
    if (!id) return null;

    const communityDetails = await prismadb.communities.findUnique({
      where: {
        cid: id,
      },
      include: {
        createdBy: true,
        members: true,
        threads: true,
      },
    });

    return communityDetails ?? null;
  } catch (error) {
    // Handle any errors
    console.error("Error fetching community details:", error);
    throw error;
  }
}

export async function fetchCommunityPosts(id: string) {
  try {

    const communityPosts = await prismadb.communities.findUnique({
      where: {
        cid: id,
        OR: [{ id: id }],
      },
      include: {
        threads: {
          include: {
            author: true,
            children: {
              include: {
                author: true,
              },
            },
          },
        },
      },
    });

    return communityPosts;
  } catch (error) {
    // Handle any errors
    console.error("Error fetching community posts:", error);
    throw error;
  }
}

export async function fetchCommunities({
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    // Calculate the number of communities to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Create an initial query object to filter communities.

    type QueryType =
      {
          OR: [
            {
              name: {
                contains: string;
                mode: "insensitive";
              };
              cid: {
                contains: string;
                mode: "insensitive";
              };
            }
          ];
        }
    // what condition to use if searchString is empty ,then return all communities?

    const query: QueryType = {
      OR: [
        {
          name: {
            contains: searchString,
            mode: "insensitive",
          },
          cid: {
            contains: searchString,
            mode: "insensitive",
          },
        },
      ],
    }

    // Define the sort options for the fetched communities based on createdAt field and provided sort order.
    const sortOptions = { createdAt: sortBy };

    const communities = await prismadb.communities.findMany({
      where: {
        ...query,
      },
      orderBy: {
        createdAt: sortBy,
      },
      skip: skipAmount,
      take: pageSize,
      include: {
        members: true,
      },
    });

    // Count the total number of communities that match the search criteria (without pagination).
    const totalCommunitiesCount = await prismadb.communities.count({
      where: {
        ...query,
      },
    });

    // Check if there are more communities beyond the current page.
    const isNext = totalCommunitiesCount > skipAmount + communities.length;

    return { communities, isNext };
  } catch (error) {
    console.error("Error fetching communities:", error);
    throw error;
  }
}

export async function addMemberToCommunity(
  communityId: string,
  memberId: string
) {
  try {
    // Find the community by its unique id
    const community = await prismadb.communities.findUnique({
      where: {
        cid: communityId,
      },
      include: {
        members: true,
      },
    });

    if (!community) {
      throw new Error("Community not found");
    }

    // Find the user by their unique id
    const user = await fetchUser(memberId);

    if (!user) {
      throw new Error("User not found");
    }

    // Check if the user is already a member of the community
    if (community.membersIds.includes(user.id)) {
      throw new Error("User is already a member of the community");
    }

    // Add the user's _id to the members array in the community
    await prismadb.communities.update({
      where: {
        cid: communityId,
      },
      data: {
        members: {
          connect: {
            id: memberId,
          },
        },
      },
    });
    // Add the community's _id to the communities array in the user
    await prismadb.users.update({
      where: {
        id: memberId,
      },
      data: {
        communities: {
          connect: {
            cid: communityId,
          },
        },
      },
    });

    return community;
  } catch (error) {
    // Handle any errors
    console.error("Error adding member to community:", error);
    throw error;
  }
}

export async function removeUserFromCommunity(
  userId: string,
  communityId: string
) {
  try {
    const userIdObject = (await fetchUser(userId))?.id;
    const communityIdObject = (await fetchCommunityDetails(communityId))?.id;

    if (!userIdObject) {
      throw new Error("User not found");
    }

    if (!communityIdObject) {
      throw new Error("Community not found");
    }

    await prismadb.communities.update({
      where: {
        cid: communityId,
      },
      data: {
        members: {
          disconnect: {
            id: userId,
          },
        },
      },
    });

    await prismadb.users.update({
      where: {
        id: userId,
      },
      data: {
        communities: {
          disconnect: {
            cid: communityId,
          },
        },
      },
    });

    return { success: true };
  } catch (error) {
    // Handle any errors
    console.error("Error removing user from community:", error);
    throw error;
  }
}

export async function updateCommunityInfo(
  communityId: string,
  name: string,
  image: string
) {
  try {
    const updatedCommunity = await prismadb.communities.update({
      where: {
        cid: communityId,
      },
      data: {
        name,
        image,
      },
    });

    if (!updatedCommunity) {
      throw new Error("Community not found");
    }

    return updatedCommunity;
  } catch (error) {
    // Handle any errors
    console.error("Error updating community information:", error);
    throw error;
  }
}

export async function deleteCommunity(communityId: string) {
  try {
    // Find the community by its ID and delete it
    const deletedCommunity = await prismadb.communities.delete({
      where: {
        cid: communityId,
      },
    });

    if (!deletedCommunity) {
      throw new Error("Community not found");
    }

    // Delete all threads associated with the community

    await prismadb.threads.deleteMany({
      where: {
        communityId: communityId,
      },
    });

    // Find all users who are part of the community
    const communityUsers = await prismadb.users.findMany({
      where: {
        communities: {
          some: {
            cid: communityId,
          },
        },
      },
    });
    const updateUserPromises = communityUsers.map((user) => {
      return prismadb.users.update({
        where: {
          id: user.id,
        },
        data: {
          communities: {
            disconnect: {
              cid: communityId,
            },
          },
        },
      });
    });

    await Promise.all(updateUserPromises);

    return deletedCommunity;
  } catch (error) {
    console.error("Error deleting community: ", error);
    throw error;
  }
}
