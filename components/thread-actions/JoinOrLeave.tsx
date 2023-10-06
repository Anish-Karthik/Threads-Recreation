"use client"

import React, { useState } from 'react'
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
import { Form } from '../ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InviteValidation } from '@/lib/validations/community';
import { SelectCommunity } from '../forms/PostThread';
import { z } from 'zod';

type props = {
  communityId: string;
  memberId: string;
  onActionCallback: any;
  isMember: boolean;
  text?: "Invite" | "Join" | "Leave" | "Request" | "Accept" | "Reject";
  notJoinedCommunities?: string[];
}

const JoinOrLeave = ({ communityId, memberId, onActionCallback, isMember, text, notJoinedCommunities = [] }: props) => {
  
  const pathname = usePathname();
  const router = useRouter();
  const [isSubmiting, setIsSubmiting] = useState(false);
  const form = useForm({
    resolver: zodResolver(InviteValidation),
  });
  const handleAction = async () => {
    setIsSubmiting(true);
    try {
      await onActionCallback(communityId, memberId);
      toast.success(`Successfully ${isMember? "Left": text+"ed to" || "Joined"} the community`);
    } catch (error) {
      toast.error(error.message);
    }
    setIsSubmiting(false);
  }

  const onSubmit = async (values: z.infer<typeof InviteValidation>) => {
    setIsSubmiting(true);
    try {
      const result = await onActionCallback(values.cid, memberId);
      toast.success(`Successfully Invited user to the community`);
    } catch (error) {
      toast.error(error.message);
    }
    setIsSubmiting(false);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={isMember?"destructive":"default"}  className={cn('text-subtle-medium cursor-pointer',isMember ?"text-light-2":"user-card_btn")}>{isMember? "Leave": text || "Join"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-dark-2 text-light-2"  >
        <DialogHeader>
          <DialogTitle className='text-light-2'>{(isMember?"Leave": text || "Join") + " Community"}</DialogTitle>
          <DialogDescription>
            {text == "Invite" && (
              <Form {...form}> 
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-start gap-10">
                  <SelectCommunity form={form} name="cid" communities={notJoinedCommunities}/>
                  <div className='flex justify-end gap-5 flex-wrap'>
                    <DialogPrimitive.Close>
                      <Button variant={"secondary"} >Cancel</Button>
                    </DialogPrimitive.Close>
                    <DialogPrimitive.Close>
                      <Button variant="secondary" disabled={isSubmiting} type='submit' >Invite</Button>
                    </DialogPrimitive.Close>
                  </div>
                </form>
              </Form>
            )}
            {text !== "Invite" && (isMember? "Are you sure you want to leave this community?" : "Do you want to join this community?")}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {text !== "Invite" && <div className='flex justify-end gap-5 flex-wrap'>
            <DialogPrimitive.Close>
              <Button variant={"secondary"} >Cancel</Button>
            </DialogPrimitive.Close>
            <DialogPrimitive.Close>
              <Button variant={isMember?"destructive":"secondary"} disabled={isSubmiting} onClick={handleAction} >{isMember?"Leave": text || "Join"}</Button>
            </DialogPrimitive.Close>
          </div>}
        </DialogFooter>
      </DialogContent>
    </Dialog>

  )
}

export default JoinOrLeave