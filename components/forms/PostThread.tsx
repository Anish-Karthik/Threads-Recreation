"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { communities } from "@prisma/client"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"

import { ThreadValidation } from "@/lib/validations/thread"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { trpc } from "@/app/_trpc/client"

import { CustomTextArea } from "../form-fields"
import Editor from "../shared/Editor"

const PostThread = ({
  userId,
  communities,
  isComment = false,
}: {
  isComment?: boolean
  userId: string
  communities: communities[]
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createThread = trpc.thread.create.useMutation()

  const form = useForm({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread: "",
      accountId: userId,
      communityId: "individual",
    },
  })
  async function onSubmit(values: z.infer<typeof ThreadValidation>) {
    setIsSubmitting(true)
    try {
      await createThread.mutateAsync({
        text: values.thread,
        author: userId,
        communityId:
          values.communityId === "individual" ? null : values.communityId,
        path: pathname,
      })
      toast.success("Thread Posted Successfully")
      router.push("/")
    } catch (error: any) {
      console.log(error)
      toast.error(error.message)
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col justify-start gap-10"
      >
        <SelectCommunity
          form={form}
          name="communityId"
          communities={communities}
        />
        {isComment ? (
          <CustomTextArea form={form} name="thread" alt="content" />
        ) : (
          <Editor
            onChange={(value) => form.setValue("thread", value)}
            initialContent={form.watch("thread")}
            editable={true}
          />
        )}
        <Button
          type="submit"
          className="bg-primary-500"
          disabled={isSubmitting}
        >
          Post Thread
        </Button>
      </form>
    </Form>
  )
}

export default PostThread

type ThreadFormFieldProps = {
  form: any
  name: string
  defaultValue?: string
}

export function SelectCommunity({
  form,
  name,
  defaultValue,
  communities,
}: ThreadFormFieldProps & { communities: communities[] | string[] }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex w-full flex-col gap-3">
          <FormLabel className="text-base-semibold text-light-2">
            Type of Thread
          </FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="w-[180px] border-none bg-dark-2 text-light-2">
                <SelectValue placeholder="Post Via" />
              </SelectTrigger>
              <SelectContent className="border-none bg-dark-2 text-light-2">
                {communities[0] && communities[0]["id"] && (
                  <SelectItem value="individual">Individual</SelectItem>
                )}
                {communities.map((community, ind) => (
                  <SelectItem
                    key={ind}
                    value={community?.cid?.toString() || community}
                  >
                    {community?.name || community}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
