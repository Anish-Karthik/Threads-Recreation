"use client"
import { deleteThread } from '@/lib/actions/thread.actions';
import Image from 'next/image';
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

import * as DialogPrimitive from "@radix-ui/react-dialog"


export default function DeleteThread({ id, author, currentUserId }: { id: string, author: string, currentUserId: string }) {

  const deletePost = async () => {
    const result = await deleteThread(id, '/');
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        {author === currentUserId &&
          <div className='flex items-center gap-1.5'>
            <Image src="/assets/delete.svg" alt='delete' width={24} height={24} className='cursor-pointer object-contain' />
            <p className='text-subtle-medium text-gray-1 cursor-pointer'>Delete</p>
          </div>
        }
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-dark-2 text-light-2"  >
        <DialogHeader>
          <DialogTitle className='text-light-2'>Delete Thread</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this thread? 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className='flex justify-end gap-5 flex-wrap'>
            <DialogPrimitive.Close>
              <Button variant={"secondary"} >Cancel</Button>
            </DialogPrimitive.Close>
            <DialogPrimitive.Close>
              <Button variant={"destructive"} onClick={deletePost} >Delete</Button>
            </DialogPrimitive.Close>
            
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


