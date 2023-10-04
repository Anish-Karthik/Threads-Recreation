import AccountProfile from "@/components/forms/AccountProfile";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";

const ProfilePage = async ({ params }: { params: {id: string } }) => {
  const user = await currentUser()

  if(!user)  return null;

  const userInfo = await fetchUser(params.id);

    const userData = {
    id: user.id,
    objectId: userInfo?._id || "",
    username: userInfo?.username || user.username || "",
    name: userInfo?.name || user.firstName || "",
    bio: userInfo?.bio || "",
    image: userInfo?.image || user.imageUrl || "",
  };

  return (
    <main className='mx-auto flex max-w-3xl flex-col justify-start'>
      <h1 className='head-text mb-4'>Edit Profile</h1>
      <section className='   bg-dark-2 p-10'>
        <AccountProfile user={userData} btnTitle='Save' />
      </section>
    </main>
  );
}

export default ProfilePage;