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

const positiveActions = new Set(["Invite", "Join", "Accept", "Promote"]);
const negativeActions = new Set(["Leave", "Reject", "Remove", "Demote"]);

type props = {
  communityId: string;
  memberId: string;
  onActionCallback: any;
  isMember: boolean;
  action: "Invite" | "Join" | "Leave" | "Request" | "Accept" | "Reject" | "Remove" | "Promote" | "Demote";
  notJoinedCommunities?: string[];
}

const JoinOrLeave = ({ communityId, memberId, onActionCallback, isMember, action, notJoinedCommunities = [] }: props) => {
  
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
      toast.success(`Successfully ${action} the community`);
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    }
    setIsSubmiting(false);
  }

  const onSubmit = async (values: z.infer<typeof InviteValidation>) => {
    setIsSubmiting(true);
    try {
      await onActionCallback(values.cid, memberId);
      toast.success(`Successfully Invited user to the community`);
    } catch (error) {
      toast.error(error.message);
    }
    setIsSubmiting(false);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={(negativeActions.has(action)) ?"negative":"userbtn"}  className='text-subtle-medium cursor-pointer'>{action}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-dark-2 text-light-2"  >
        <DialogHeader>
          <DialogTitle className='text-light-2'>{action + " Community"}</DialogTitle>
          <DialogDescription>
            {action == "Invite" && (
              <Form {...form}> 
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-start gap-10">
                  <SelectCommunity form={form} name="cid" communities={notJoinedCommunities}/>
                  <div className='flex justify-end gap-5 flex-wrap'>
                    <DialogPrimitive.Close>
                      <Button variant={"secondary"} >Cancel</Button>
                    </DialogPrimitive.Close>
                    <DialogPrimitive.Close>
                      <Button variant="userbtn" disabled={isSubmiting} type='submit'>Invite</Button>
                    </DialogPrimitive.Close>
                  </div>
                </form>
              </Form>
            )}
            {action !== "Invite" && (isMember? "Are you sure you want to leave this community?" : "Do you want to join this community?")}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {action !== "Invite" && <div className='flex justify-end gap-5 flex-wrap'>
            <DialogPrimitive.Close>
              <Button variant={"secondary"} >Cancel</Button>
            </DialogPrimitive.Close>
            <DialogPrimitive.Close>
              <Button variant={negativeActions.has(action)?"destructive":"secondary"} disabled={isSubmiting} onClick={handleAction} >{action}</Button>
            </DialogPrimitive.Close>
          </div>}
        </DialogFooter>
      </DialogContent>
    </Dialog>

  )
}

export default JoinOrLeave