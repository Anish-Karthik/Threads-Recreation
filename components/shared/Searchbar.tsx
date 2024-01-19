/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { memo, useEffect, useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { useDebounce } from "use-debounce"

import { Input } from "../ui/input"

interface Props {
  routeType: string
  placeHolder?: string
}

function Searchbar({ routeType, placeHolder }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("q") || "")
  console.log(search, routeType)

  useEffect(() => {
    if (search) {
      router.push(`/${routeType}?q=${search}`)
    } else {
      if (searchParams.get("q")) {
        router.push(`/${routeType}`)
      }
    }
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
        autoFocus={!!search}
        autoComplete="off"
        className="no-focus searchbar_input"
      />
      {search && (
        <X
          className="my-auto cursor-pointer text-slate-600"
          onClick={() => {
            setSearch("")
            router.push(`/${routeType}`)
          }}
        />
      )}
    </div>
  )
}

export default memo(Searchbar)
