"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookmarkPlusIcon,
  FacebookIcon,
  Link2Icon,
  LinkedinIcon,
  MailCheckIcon,
  MailIcon,
  MessageSquareIcon,
  Share2Icon,
  ShareIcon,
  TwitterIcon,
} from "lucide-react"
import toast from "react-hot-toast"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ShareThread = ({ threadId }: { threadId?: string }) => {
  const pathname = usePathname()
  // replace this with correct method
  const baseUrl = window.location.href.replace(pathname, "/")
  const curentUrl = "thread/" + threadId
  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(baseUrl + curentUrl)
      toast.success("Link copied")
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Image
            src="/assets/share.svg"
            alt="share"
            width={24}
            height={24}
            className="cursor-pointer object-contain"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-fit border-dark-4 bg-dark-1 text-light-2"
        >
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="hover:!bg-dark-2 hover:!text-light-1"
              onClick={handleCopy}
            >
              <Link2Icon className="mr-2 h-4 w-4" />
              <span>Copy Link</span>
            </DropdownMenuItem>

            <DialogTrigger asChild>
              <DropdownMenuItem className="hover:!bg-dark-2 hover:!text-light-1 ">
                <ShareIcon className="mr-2 h-4 w-4" />
                <span>Share Thread via ...</span>
              </DropdownMenuItem>
            </DialogTrigger>

            <DropdownMenuItem className="hover:!bg-dark-2 hover:!text-light-1">
              <MailIcon className="mr-2 h-4 w-4" />
              <span>Send via Direct Message</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="hover:!bg-dark-2 hover:!text-light-1">
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

function ShareThreadViaThirdParty({ url }: { url: string }) {
  const pathname = usePathname()
  const baseUrl = window.location.href.replace(pathname, "/")

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(baseUrl + url)
      toast.success("Link copied")
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }
  return (
    <DialogContent className="max-w-[21rem] bg-dark-2 text-light-2 sm:max-w-sm">
      <DialogHeader className="!max-w-[18rem] sm:!max-w-[21rem]">
        <DialogTitle className="v mt-3 text-heading4-medium">Share</DialogTitle>
        <DialogDescription className="">
          <div className="mt-3 flex flex-col gap-2 text-light-2 ">
            <section className="flex items-center justify-between ">
              <div className="flex !w-[60%] items-center justify-start gap-1">
                <MessageSquareIcon />
                <p className="!w-[80%] !overflow-hidden !overflow-ellipsis">
                  {url}
                </p>
              </div>
              <div
                className="flex items-center justify-start gap-1"
                onClick={handleCopy}
              >
                <Link2Icon className="mr-2 h-4 w-4" />
                <span className="text-small-medium">Copy Link</span>
              </div>
            </section>

            <section className="border border-light-4"></section>

            <section>
              <div>Share with others</div>
              <div className="mt-3 grid grid-cols-5 gap-2">
                <Link
                  href={`https://www.facebook.com/sharer/sharer.php?u=${
                    baseUrl + url
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-1 ">
                    <FacebookIcon />
                    <p className="text-tiny-medium">Facebook</p>
                  </div>
                </Link>
                <Link
                  href={`https://twitter.com/intent/tweet?text=&url=${
                    baseUrl + url
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-1 ">
                    <TwitterIcon />
                    <p className="text-tiny-medium">Twitter</p>
                  </div>
                </Link>
                <Link
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${
                    baseUrl + url
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-1 ">
                    <LinkedinIcon />
                    <p className="text-tiny-medium">LinkedIn</p>
                  </div>
                </Link>

                <Link
                  href={`https://web.whatsapp.com/send?text=${baseUrl + url}`}
                >
                  <div className="flex flex-col items-center justify-center gap-1 ">
                    <Image src={"/whatsapp.svg"} alt="whatsapp" />
                    <p className="text-tiny-medium">Whatsapp</p>
                  </div>
                </Link>

                <Link href={`mailto:?subject=&body=${baseUrl + url}`}>
                  <div className="flex flex-col items-center justify-center gap-1 ">
                    <MailCheckIcon />
                    <p className="text-tiny-medium">Email</p>
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
