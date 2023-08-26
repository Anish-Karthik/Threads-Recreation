import ProfileHeader from '@/components/shared/ProfileHeader';
import ThreadsTab from '@/components/shared/ThreadsTab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { profileTabs } from '@/constants';
import { fetchUser, fetchUsers } from '@/lib/actions/user.actions';
import User from '@/lib/models/user.model';
import { currentUser } from '@clerk/nextjs'
import Image from 'next/image';
import { redirect } from 'next/navigation';

const SearchPage = async () => {
  const user = await currentUser()

  if(!user)  return null;

  const userInfo = await fetchUser(user.id);
  if(!userInfo?.onboarded) redirect('/onboarding');

  // Fetch users
  const result = await fetchUsers({
    userId: user.id,
    searchString: '',
    pageNumber: 1,
    pageSize: 25,
  });

  return (
    <section>
      <h1 className="head-text mb-10">Search</h1>
      {/* Search Bar */}


    </section>
  )
}

export default SearchPage