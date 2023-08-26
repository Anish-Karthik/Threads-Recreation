"use client"

import React from 'react'
import { sidebarLinks } from '@/constants'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'

function Bottombar() {
  
  const router = useRouter()
  const pathname = usePathname()
  return (
    <section className='bottombar'>
      <div className='bottombar_container'>
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.route;
          
          return <div>
            <Link href={link.route}
              key={link.label}
              className={`bottombar_link ${isActive && 'bg-primary-500'}`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={24}
                height={24}
              />
              <p className='text-light-1 text-subtle-medium max-sm:hidden' >{link.label.split(" ")[0]}</p>
            </Link>
          </div>
        })}
      </div>
    </section>
  )
}

export default Bottombar