"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { sidebarLinks } from "@/constants"
import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  useAuth,
} from "@clerk/nextjs"
import { LogInIcon, LogOutIcon } from "lucide-react"

function LeftSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { userId } = useAuth()

  return (
    <section className="custom-scrollbar leftsidebar">
      <div className="flex w-full flex-1 flex-col gap-6 px-6">
        {sidebarLinks.map((link, ind) => {
          const isActive = pathname === link.route

          if (link.route === "/profile") link.route = `/profile/${userId}`

          return (
            <div key={ind}>
              <Link
                href={link.route}
                key={link.label}
                className={`leftsidebar_link ${isActive && "bg-primary-500"}`}
              >
                <Image
                  src={link.imgURL}
                  alt={link.label}
                  width={24}
                  height={24}
                />
                <p className="text-light-2 max-lg:hidden">{link.label}</p>
              </Link>
            </div>
          )
        })}
      </div>
      <div className="mt-10 px-6">
        <SignedIn>
          <SignOutButton signOutCallback={() => router.push("/")}>
            <div className="flex cursor-pointer gap-6 px-4 text-slate-200">
              <LogOutIcon width={24} height={24} />
              <p className="text-light-2 max-lg:hidden">logout</p>
            </div>
          </SignOutButton>
        </SignedIn>
        <SignedOut>
          <SignInButton afterSignInUrl="/" afterSignUpUrl="/">
            <div className="flex cursor-pointer gap-6 px-4 text-slate-200">
              <LogInIcon width={24} height={24} />
              <p className="text-light-2 max-lg:hidden">login</p>
            </div>
          </SignInButton>
        </SignedOut>
      </div>
    </section>
  )
}

export default LeftSidebar
