
import Image from 'next/image'
import Link from 'next/link';
import DeleteEntity from '../forms/DeleteEntity';
import { deleteUser, requestToJoinCommunity } from '@/lib/actions/user.actions';
import { addMemberToCommunity, deleteCommunity, inviteUserToCommunity, removeUserFromCommunity } from '@/lib/actions/community.actions';
import JoinOrLeave from '../thread-actions/JoinOrLeave';

interface ProfileHeaderProps {
  accountId: string;
  authUserId: string;
  name: string;
  username: string;
  imgUrl: string;
  bio: string;
  type?: 'User' | 'Community';
  editable?: boolean;
  isMember?: boolean;
  canRequest?: boolean;
  notJoinedCommunities?: string[];
  joinMode?: string;
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
  isMember = false,
  canRequest = true,
  notJoinedCommunities = [],
  joinMode = 'open'
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
          <div className='flex gap-1'>
            {editable && (
              <div>
                <Link href={ type === 'User'? `/profile/${accountId}/edit`: `/communities/${accountId}/edit`}>
                  <Image src={'/assets/edit.svg'} alt='edit' width={30} height={30} />
                </Link>
                <DeleteEntity id={accountId} type={type} deleteCallback={type==="User"? deleteUser: deleteCommunity}/>
              </div>
            )}
          </div>
        </div>  
          
        <div className='flex gap-2'>
          {!isMember && canRequest && (type === "Community" && joinMode === "approval"? (
            <JoinOrLeave action={"Request"} isMember={isMember} communityId={accountId} memberId={authUserId} onActionCallback={requestToJoinCommunity} />
          ): (<>{notJoinedCommunities && notJoinedCommunities.length > 0 &&
            <JoinOrLeave action={"Invite"} notJoinedCommunities={notJoinedCommunities} isMember={isMember} communityId={accountId} memberId={accountId} onActionCallback={inviteUserToCommunity} />}</>
          ))}

          { type === "Community" && (isMember ? (
            <JoinOrLeave isMember={isMember} communityId={accountId} memberId={authUserId} onActionCallback={removeUserFromCommunity} action='Leave' />
          ): joinMode === "open" && (
            <JoinOrLeave isMember={isMember} communityId={accountId} memberId={authUserId} onActionCallback={addMemberToCommunity} action='Join' />
          ))}
          
        </div>
        
      </div>

      <p className='mt-6 max-w-lg text-base-regular text-light-2'>{bio}</p>

      <div className='mt-12 h-0.5 w-full bg-dark-3'/>
      
    </section>
  )
}

export default ProfileHeader