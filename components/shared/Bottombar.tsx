"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { sidebarLinks } from "@/constants"
import { useAuth } from "@clerk/nextjs"

function Bottombar() {
  const { userId } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  return (
    <section className="bottombar">
      <div className="bottombar_container">
        {sidebarLinks.map((link, ind) => {
          const isActive = pathname === link.route

          if (link.route === "/profile") link.route = `/profile/${userId}`

          return (
            <div key={ind}>
              <Link
                href={link.route}
                key={link.label}
                className={`bottombar_link ${isActive && "bg-primary-500"}`}
              >
                <Image
                  src={link.imgURL}
                  alt={link.label}
                  width={24}
                  height={24}
                />
                <p className="text-subtle-medium text-light-1 max-sm:hidden">
                  {link.label.split(" ")[0]}
                </p>
              </Link>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default Bottombar
