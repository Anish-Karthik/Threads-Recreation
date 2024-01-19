"use client"

import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function DeleteEntity({
  id,
  type,
  deleteCallback,
}: {
  id: string
  type: "Thread" | "Community" | "User"
  deleteCallback: (id: string, path: string) => Promise<void>
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()
  const deletePost = async () => {
    try {
      const result = await deleteCallback(id, pathname)
      toast.success(`${type} Deleted Successfully`)
      if (type === "User") {
        router.push("/sign-up")
        signOut()
      } else {
        router.push("/")
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center gap-1.5">
          <Image
            src="/assets/delete.svg"
            alt="delete"
            width={24}
            height={24}
            className="cursor-pointer object-contain"
          />
          <p className="cursor-pointer text-subtle-medium text-gray-1">
            Delete
          </p>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-dark-2 text-light-2 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-light-2">Delete {type}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this {type}?
            {type === "Thread" && " All comments will be deleted as well."}
            {type === "Community" &&
              " All threads and comments will be deleted as well."}
            {type === "User" &&
              " Your existence in this app will be erased without a trace."}
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="flex flex-wrap justify-end gap-5">
            <DialogPrimitive.Close>
              <Button variant={"secondary"}>Cancel</Button>
            </DialogPrimitive.Close>
            <DialogPrimitive.Close>
              <Button variant={"destructive"} onClick={deletePost}>
                Delete
              </Button>
            </DialogPrimitive.Close>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
