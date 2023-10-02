
import { getActivityLikedToUser, getActivityRepliedToUser } from '@/lib/actions/activity.actions';
import { fetchUser, fetchUsers, getActivity } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs'
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const ActivityPage = async () => {
  const user = await currentUser()

  if(!user)  return null;

  const userInfo = await fetchUser(user.id);
  if(!userInfo?.onboarded) redirect('/onboarding');

  // getActivity or getNotifications
  const replies = await getActivityRepliedToUser(userInfo._id);
  const LikedThreads = await getActivityLikedToUser(userInfo._id);
  // TODO: sort by date using merge k sorted lists algorithm
  const activities = [...replies, ...LikedThreads];


  return (
    <section>
      <h1 className="head-text mb-10">Activity</h1>
      <section className='mt-10 flex flex-col gap-5'>
        {activities.length > 0 ? (
          <>
            {activities.map((activity, ind) => (
              <Link key={ind} href={`/thread/${activity.parentId || activity.threadId}`}>
                <article className='activity-card'>
                  <Image src={activity.author.image} alt='user' width={20} height={20} className='rounded-full object-cover'/>
                  <p className='!text-small-regular text-light-1'>
                    <span className='mr-1 text-primary-500'>
                      {String(activity.author._id) !== String(userInfo._id)? activity.author.name: "You"}
                    </span> {" "}
                    {activity.parentId? "replied to your thread": "liked your thread"}
                  </p>
                </article>
              </Link>
            ))}
            
          </>
        ):(
          <p className='!text-base-regular text-light-3'>No activity yet</p>
        )}
      </section>
    </section>
  )
}

export default ActivityPage