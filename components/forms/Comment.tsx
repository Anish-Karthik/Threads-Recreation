"use client"

import { useState } from "react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"

import { addCommentToThread } from "@/lib/actions/thread.actions"
import { CommentValidation } from "@/lib/validations/thread"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface CommentProps {
  threadId: string
  currentUserImg: string
  currentUserId: string
}

const Comment = ({ threadId, currentUserId, currentUserImg }: CommentProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const form = useForm({
    resolver: zodResolver(CommentValidation),
    defaultValues: {
      thread: "",
    },
  })
  async function onSubmit(values: z.infer<typeof CommentValidation>) {
    setIsSubmitting(true)
    try {
      await addCommentToThread({
        threadId,
        userId: JSON.parse(currentUserId),
        commentText: values.thread,
        path: pathname,
      })

      router.push(pathname)
      toast.success("Comment Posted Successfully")
    } catch (error) {
      toast.error(error.message)
      setIsSubmitting(false)
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="comment-form">
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex w-full flex-row items-center gap-3">
              <FormLabel>
                <Image
                  src={currentUserImg}
                  alt="user profile image"
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              </FormLabel>
              <FormControl className="border-none bg-transparent">
                <Input
                  placeholder={`Comment on this thread...`}
                  className="no-focus text-light-1 outline-none"
                  {...field}
                  autoComplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="comment-form_btn"
          disabled={isSubmitting}
        >
          Reply
        </Button>
      </form>
    </Form>
  )
}

export default Comment
