// @ts-ignore
import { getActivityLikedToUser, getActivityRepliedToUser } from '@/lib/actions/activity.actions';
import { fetchUser } from '@/lib/actions/user.actions';
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
  const replies = await getActivityRepliedToUser(userInfo.id);
  const LikedThreads = await getActivityLikedToUser(userInfo.id) || [];



  return (
    <section>
      <h1 className="head-text mb-10">Activity</h1>
      <section className='mt-10 flex flex-col gap-5'>
        {replies.length > 0 && (
          <>

            {replies.map((activity: any, ind) => (
              <Link key={ind} href={`/thread/${activity.parentId}`}>
                <article className='activity-card'>
                  <Image src={activity.author.image} alt='user' width={20} height={20} className='rounded-full object-cover'/>
                  <p className='!text-small-regular text-light-1'>
                    <span className='mr-1 text-primary-500'>
                      {String(activity.author.id) !== String(userInfo.id)? activity.author.name: "You"}
                    </span> {" "}
                    replied to your thread
                  </p>
                </article>
              </Link>
            ))}
            
          </>
          
        ) || LikedThreads.length > 0 ? (
          <>
            {LikedThreads.map((activity: any, ind) => (
              <Link key={ind} href={`/thread/${activity.id}`}>
                <article className='activity-card'>
                  <Image src={activity.author.image} alt='user' width={20} height={20} className='rounded-full object-cover'/>
                  <p className='!text-small-regular text-light-1'>
                    <span className='mr-1 text-primary-500'>
                      {String(activity.author.id) !== String(userInfo.id)? activity.author.name: "You"}
                    </span> {" "}
                    liked your thread
                  </p>
                </article>
              </Link>
            ))}
            
          </>
        )

        :(
          <p className='!text-base-regular text-light-3'>No activity yet</p>
        )}
      </section>
    </section>
  )
}

export default ActivityPage