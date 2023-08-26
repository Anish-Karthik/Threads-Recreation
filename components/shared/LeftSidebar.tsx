"use client"

import React from 'react'
import { sidebarLinks } from '@/constants'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { SignedIn, SignOutButton } from '@clerk/nextjs'

function LeftSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  return (
    <section className='custom-scrollbar leftsidebar'>
      <div className='flex flex-col gap-6 px-6 w-full flex-1'>
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.route;
          
          return <div>
            <Link href={link.route}
              key={link.label}
              className={`leftsidebar_link ${isActive && 'bg-primary-500'}`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={24}
                height={24}
              />
              <p className='text-light-2 max-lg:hidden' >{link.label}</p>
            </Link>
          </div>
        })}
      </div>
      <div className='mt-10 px-6'>
        <SignedIn>
          <SignOutButton signOutCallback={() => router.push('/sign-in')}>
            <div className='flex cursor-pointer gap-6 px-4'>
              <Image src={"/assets/logout.svg"} alt="logout" width={24} height={24} />
              <p className='text-light-2 max-lg:hidden' >logout</p>
            </div>
          </SignOutButton>
          
        </SignedIn>
      </div>
    </section>
  )
}

export default LeftSidebar