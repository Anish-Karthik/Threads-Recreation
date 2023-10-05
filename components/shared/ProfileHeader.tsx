import React from 'react'
import Image from 'next/image'
import Link from 'next/link';
import DeleteThread from '../forms/DeleteEntity';
import DeleteEntity from '../forms/DeleteEntity';
import { deleteUser } from '@/lib/actions/user.actions';
import { deleteCommunity } from '@/lib/actions/community.actions';

interface ProfileHeaderProps {
  accountId: string;
  authUserId: string;
  name: string;
  username: string;
  imgUrl: string;
  bio: string;
  type?: 'User' | 'Community';
  editable?: boolean;
}

const ProfileHeader = ({
  accountId,
  authUserId,
  name,
  username,
  imgUrl,
  bio,
  type = 'User',
  editable = false,
}: ProfileHeaderProps) => {
  return (
    <section className='flex w-full flex-col justify-start'>
      <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='relative h-20 w-20 object-cover'>
              <Image 
                src={imgUrl}
                alt={name}
                fill
                className='rounded-full object-cover shadow-2xl'
              />
            </div>
            <div className='flex-1'>
              <h2 className='text-left text-light-1 text-heading3-bold'>{name}</h2>
              <p className='text-gray-1 text-base-medium'>@{username}</p>
            </div>
          </div>  
          {editable && (
            <div >
              <DeleteEntity id={accountId} type={type} deleteCallback={type==="User"? deleteUser: deleteCommunity}/>
              <Link href={ type === 'User'? `/profile/${accountId}/edit`: `/communities/${accountId}/edit`}>
                <Image src={'/assets/edit.svg'} alt='edit' width={30} height={30} />
              </Link>
            </div>
          )}
        
      </div>
      {/* TODO: community */}

      <p className='mt-6 max-w-lg text-base-regular text-light-2'>{bio}</p>

      <div className='mt-12 h-0.5 w-full bg-dark-3'/>
      
    </section>
  )
}

export default ProfileHeader