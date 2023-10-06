"use server";

import { revalidatePath } from "next/cache";
import prismadb from "./prismadb";
import { fetchUser } from "./user.actions";
import { deleteThread } from "./thread.actions";

type SortOrder = "asc" | "desc";

export async function isAlreadyCommunity(cid: string) {
  try {
    const community = await prismadb.communities.findUnique({
      where: {
        cid: cid,
      },
    });
    return !!community && cid !== community?.cid;
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
  createdById,
}: {
  name: string;
  cid: string;
  image: string;
  bio: string;
  createdById: string;
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
        members: {
          connect: {
            id: user.id,
          },
        },
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
        moderators: true,
        requests: true,
        invites: true,
      },
    });

    return communityDetails ?? null;
  } catch (error) {
    // Handle any errors
    console.error("Error fetching community details:", error);
    throw error;
  }
}
export async function fetchCommunityDetailsById(id: string | null) {
  try {
    if (!id) return null;

    const communityDetails = await prismadb.communities.findUnique({
      where: {
        id: id,
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

    type QueryType = {
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
    };
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
    };

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
    // Find the user by their unique id
    const user = await fetchUser(memberId);

    if (!community) {
      throw new Error("Community not found");
    }
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
            id: user.id,
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
  communityId: string,
  userId: string
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
            id: userIdObject,
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

export async function updateCommunityInfo({
  name,
  cid,
  image,
  bio,
}: {
  name: string;
  cid: string;
  image: string;
  bio: string;
}) {
  try {
    const updatedCommunity = await prismadb.communities.update({
      where: {
        cid: cid,
      },
      data: {
        name,
        image,
        bio,
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

export async function deleteCommunity(cid: string, path: string) {
  try {
    // Find the community by its ID and delete it
    const community = await fetchCommunityDetails(cid);

    if (!community) {
      throw new Error("Community not found");
    }

    // Delete all threads associated with the community
    // TODO: Optimize this to delete by pagination instead of all at once (if there are a lot of threads)
    const threads = await prismadb.threads.findMany({
      where: {
        communityId: community.id,
      },
    });

    threads.forEach(async (thread) => {
      await deleteThread(thread.id, path);
    });

    // Delete the community
    const deletedCommunity = await prismadb.communities.delete({
      where: {
        cid: cid,
      },
    });

    revalidatePath("/");
    return deletedCommunity;
  } catch (error) {
    console.error("Error deleting community: ", error);
    throw error;
  }
}

export async function isCommunityMember(cid: string, id: string) {
  try {
    const communities = await fetchCommunityDetails(cid);

    if (!communities) {
      throw new Error("Community not found");
    }


    return !!communities.membersIds.includes(id);
  } catch (error) {}
}

export async function inviteUserToCommunity(cid: string, uid: string) {
  try {
    const community = await fetchCommunityDetails(cid);
    const user = await fetchUser(uid);
    if (!community) {
      throw new Error("Community not found");
    }
    if (!user) {
      throw new Error("User not found");
    }

    await prismadb.communities.update({
      where: {
        cid: cid,
      },
      data: {
        invites: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    await prismadb.users.update({
      where: {
        uid: uid,
      },
      data: {
        invitedCommunities: {
          connect: {
            id: community.id,
          },
        },
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error inviting user to community: ", error);
    throw error;
  }
}

export async function acceptUserRequest(cid: string, uid: string) {
  try {
    const user = await fetchUser(uid);
    const community = await fetchCommunityDetails(cid);

    if (!community) {
      throw new Error("Community not found");
    }
    if (!user) {
      throw new Error("User not found");
    }

    // update community
    await prismadb.communities.update({
      where: {
        cid: cid,
      },
      data: {
        requests: {
          disconnect: {
            id: user.id,
          },
        },
        members: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    // update user
    await prismadb.users.update({
      where: {
        uid: uid,
      },
      data: {
        requestedCommunities: {
          disconnect: {
            id: community.id,
          },
        },
        communities: {
          connect: {
            id: community.id,
          },
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error accepting community request: ", error);
    throw error;
  }
}

export async function fetchRequestedUsers(cid: string) {
  try {
    const requests = await prismadb.communities.findUnique({
      where: {
        cid: cid,
      },
      include: {
        requests: true,
      },
    });

    return requests.requests;
  } catch (error) {
    console.error("Error fetching community invites: ", error);
    throw error;
  }
}

export async function isCommunityModerator(cid: string, uid: string) {
  try {
    const user = await fetchUser(uid);
    const community = await fetchCommunityDetails(cid);

    if (!community) {
      throw new Error("Community not found");
    }
    if (!user) {
      throw new Error("User not found");
    }

    return community.moderatorsIds.includes(user.id);
  } catch (error) {
    console.error("Error checking if user is moderator: ", error);
    throw error;
  }
}

export async function isPendingRequest(cid: string, uid: string) {
  try {
    const user = await fetchUser(uid);
    const community = await fetchCommunityDetails(cid);

    if (!community) {
      throw new Error("Community not found");
    }
    if (!user) {
      throw new Error("User not found");
    }

    return community.requestsIds.includes(user.id);
  } catch (error) {
    console.error("Error checking if user is moderator: ", error);
    throw error;
  }
}
