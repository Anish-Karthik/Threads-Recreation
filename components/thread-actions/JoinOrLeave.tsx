"use client"

import { memo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"

import { InviteValidation } from "@/lib/validations/community"
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

import { SelectCommunity } from "../forms/PostThread"
import { Form } from "../ui/form"

const positiveActions = new Set(["Invite", "Join", "Accept", "Promote"])
const negativeActions = new Set(["Leave", "Reject", "Remove", "Demote"])

type props = {
  communityId: string
  memberId: string
  onActionCallback: any
  isMember: boolean
  action:
    | "Invite"
    | "Join"
    | "Leave"
    | "Request"
    | "Accept"
    | "Reject"
    | "Remove"
    | "Promote"
    | "Demote"
  notJoinedCommunities?: string[]
}

const JoinOrLeave = ({
  communityId,
  memberId,
  onActionCallback,
  isMember,
  action,
  notJoinedCommunities = [],
}: props) => {
  const pathname = usePathname()
  const router = useRouter()
  const [isSubmiting, setIsSubmiting] = useState(false)
  const form = useForm({
    resolver: zodResolver(InviteValidation),
  })
  const handleAction = async () => {
    setIsSubmiting(true)
    try {
      await onActionCallback(communityId, memberId)
      toast.success(`Successfully ${action} the community`)
      router.refresh()
    } catch (error) {
      toast.error(error.message)
    }
    setIsSubmiting(false)
  }

  const onSubmit = async (values: z.infer<typeof InviteValidation>) => {
    setIsSubmiting(true)
    try {
      await onActionCallback(values.cid, memberId)
      toast.success(`Successfully Invited user to the community`)
    } catch (error) {
      toast.error(error.message)
    }
    setIsSubmiting(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={negativeActions.has(action) ? "negative" : "userbtn"}
          className="cursor-pointer text-subtle-medium"
        >
          {action}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-dark-2 text-light-2 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-light-2">
            {action + " Community"}
          </DialogTitle>
          <DialogDescription>
            {action == "Invite" && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col justify-start gap-10"
                >
                  <SelectCommunity
                    form={form}
                    name="cid"
                    communities={notJoinedCommunities}
                  />
                  <div className="flex flex-wrap justify-end gap-5">
                    <DialogPrimitive.Close>
                      <Button variant={"secondary"}>Cancel</Button>
                    </DialogPrimitive.Close>
                    <DialogPrimitive.Close>
                      <Button
                        variant="userbtn"
                        disabled={isSubmiting}
                        type="submit"
                      >
                        Invite
                      </Button>
                    </DialogPrimitive.Close>
                  </div>
                </form>
              </Form>
            )}
            {action !== "Invite" &&
              (isMember
                ? "Are you sure you want to leave this community?"
                : "Do you want to join this community?")}
            .
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {action !== "Invite" && (
            <div className="flex flex-wrap justify-end gap-5">
              <DialogPrimitive.Close>
                <Button variant={"secondary"}>Cancel</Button>
              </DialogPrimitive.Close>
              <DialogPrimitive.Close>
                <Button
                  variant={
                    negativeActions.has(action) ? "destructive" : "secondary"
                  }
                  disabled={isSubmiting}
                  onClick={handleAction}
                >
                  {action}
                </Button>
              </DialogPrimitive.Close>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default memo(JoinOrLeave)
