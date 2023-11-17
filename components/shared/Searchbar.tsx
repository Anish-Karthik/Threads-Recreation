/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { memo, useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { Input } from "../ui/input"

interface Props {
  routeType: string
  placeHolder?: string
}

function Searchbar({ routeType, placeHolder }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState("")

  // query after 0.3s of no input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search) {
        router.push(`/${routeType}?q=` + search)
      } else {
        router.push(`/${routeType}`)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [search, routeType])

  return (
    <div className="searchbar w-full">
      <Image
        src="/assets/search-gray.svg"
        alt="search"
        width={24}
        height={24}
        className="object-contain"
      />
      <Input
        id="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={
          placeHolder ||
          `${routeType !== "search" ? "Search communities" : "Search creators"}`
        }
        autoComplete="off"
        className="no-focus searchbar_input"
      />
    </div>
  )
}

export default memo(Searchbar)
