"use client"

import { communities } from '@prisma/client';
import React, { useState } from 'react' 
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
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

type props = {
  communityId: string;
  memberId: string;
  onActionCallback: any;
  isMember: boolean;
  text?: string;
}

const JoinOrLeave = ({ communityId, memberId, onActionCallback, isMember, text }: props) => {
  
  const pathname = usePathname();
  const router = useRouter();
  const [isSubmiting, setIsSubmiting] = useState(false);
  const handleAction = async () => {
    setIsSubmiting(true);
    try {
      const result = await onActionCallback(communityId, memberId);
      toast.success(`Successfully ${isMember? "Left": "Joined"} the community`);
    } catch (error) {
      toast.error(error.message);
    }
    setIsSubmiting(false);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={isMember?"destructive":"default"}  className={cn('text-subtle-medium cursor-pointer user-card_btn',isMember ?"":"text-gray-1")}>{isMember? "Leave": text || "Join"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-dark-2 text-light-2"  >
        <DialogHeader>
          <DialogTitle className='text-light-2'>{(isMember?"Leave": text || "Join") + " Community"}</DialogTitle>
          <DialogDescription>
            {isMember? "Are you sure you want to leave this community?" : "Do you want to join this community?"}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className='flex justify-end gap-5 flex-wrap'>
            <DialogPrimitive.Close>
              <Button variant={"secondary"} >Cancel</Button>
            </DialogPrimitive.Close>
            <DialogPrimitive.Close>
              <Button variant={isMember?"destructive":"secondary"} disabled={isSubmiting} onClick={handleAction} >{isMember?"Leave": text || "Join"}</Button>
            </DialogPrimitive.Close>
            
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  )
}

export default JoinOrLeave