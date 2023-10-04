"use client"
import React from 'react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  BookmarkPlusIcon,
  Link2Icon,
  MailIcon,
  MessageSquareIcon,
  ShareIcon,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  Share2Icon,
  MailCheckIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from 'next/link'



const ShareThread = ({ threadId }: {threadId?: string}) => {
  const pathname = usePathname()
  const baseUrl = window.location.href.replace(pathname, '/');
  const curentUrl = 'thread/' + threadId;
  const handleCopy = () => {
    try {
      
      navigator.clipboard.writeText(baseUrl+curentUrl);
      toast.success('Link copied')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }
    
  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Image src="/assets/share.svg" alt='share' width={24} height={24} className='cursor-pointer object-contain' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className="w-fit bg-dark-1 text-light-2 border-dark-4" >
          <DropdownMenuGroup>

            <DropdownMenuItem className='hover:!bg-dark-2 hover:!text-light-1' onClick={handleCopy}>
              <Link2Icon className="mr-2 h-4 w-4" />
              <span>Copy Link</span>
            </DropdownMenuItem>

            <DialogTrigger asChild>
              <DropdownMenuItem className='hover:!bg-dark-2 hover:!text-light-1 '>
                <ShareIcon className="mr-2 h-4 w-4" />
                <span>Share Thread via ...</span>
              </DropdownMenuItem>
            </DialogTrigger>

            <DropdownMenuItem className='hover:!bg-dark-2 hover:!text-light-1'>
              <MailIcon className="mr-2 h-4 w-4" />
              <span>Send via Direct Message</span>
            </DropdownMenuItem>

            <DropdownMenuItem className='hover:!bg-dark-2 hover:!text-light-1'>
              <BookmarkPlusIcon className="mr-2 h-4 w-4" />
              <span>Bookmark</span>
            </DropdownMenuItem>

          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <ShareThreadViaThirdParty url={curentUrl} />
    </Dialog>
  )
}

export default ShareThread

function ShareThreadViaThirdParty({url}: {url: string}) {
  const pathname = usePathname();
  const baseUrl = window.location.href.replace(pathname, '/');

  const handleCopy = () => {
    try {
      
      navigator.clipboard.writeText(baseUrl+url);
      toast.success('Link copied')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }
  return (
    <DialogContent className='bg-dark-2 text-light-2 max-w-[21rem] sm:max-w-sm'>
      <DialogHeader className='!max-w-[18rem] sm:!max-w-[21rem]'>
        <DialogTitle className='v text-heading4-medium mt-3' >Share</DialogTitle>
        <DialogDescription className=''>
          <div className='flex flex-col gap-2 text-light-2 mt-3 '>

            <section className='flex justify-between items-center '>
              <div className='flex justify-start items-center gap-1 !w-[60%]'>
                <MessageSquareIcon/>
                <p className='!w-[80%] !overflow-hidden !overflow-ellipsis'>{url}</p>
              </div>
              <div className='flex justify-start items-center gap-1' onClick={handleCopy}>
                <Link2Icon className="mr-2 h-4 w-4" />
              <span className='text-small-medium' >Copy Link</span>
              </div>
            </section>

            <section className='border border-light-4'></section>

            <section>
              <div>
                Share with others
              </div>
              <div className='grid grid-cols-5 gap-2 mt-3'>
                <Link href={`https://www.facebook.com/sharer/sharer.php?u=${baseUrl+url}`}>
                  <div className='flex flex-col justify-center items-center gap-1 '>
                    <FacebookIcon />
                    <p className='text-tiny-medium'>Facebook</p>
                  </div>
                </Link>
                <Link href={`https://twitter.com/intent/tweet?text=&url=${baseUrl+url}`}>
                  <div className='flex flex-col justify-center items-center gap-1 '>
                    <TwitterIcon />
                    <p className='text-tiny-medium'>Twitter</p>
                  </div>
                </Link>
                <Link href={`https://www.linkedin.com/sharing/share-offsite/?url=${baseUrl+url}`}>
                  <div className='flex flex-col justify-center items-center gap-1 '>
                    <LinkedinIcon />
                    <p className='text-tiny-medium'>LinkedIn</p>
                  </div>
                </Link>

                <Link href={`https://web.whatsapp.com/send?text=${baseUrl+url}`}>
                  <div className='flex flex-col justify-center items-center gap-1 '>
                    <img src={'/whatsapp.svg'} alt='whatsapp' />
                    <p className='text-tiny-medium'>Whatsapp</p>
                  </div>
                </Link>

                <Link href={`mailto:?subject=&body=${baseUrl+url}`}>
                  <div className='flex flex-col justify-center items-center gap-1 '>
                    <MailCheckIcon />
                    <p className='text-tiny-medium'>Email</p>
                  </div>
                </Link>

              </div>
            </section>
          </div>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  )
}