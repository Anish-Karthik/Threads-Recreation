"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"

import { EditThreadValidation } from "@/lib/validations/thread"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { trpc } from "@/app/_trpc/client"

import { CustomTextArea } from "../form-fields"
import Editor from "../shared/Editor"

const EditThread = ({
  userId,
  threadId,
  text,
  isComment = true,
}: {
  isComment?: boolean
  userId: string
  threadId: string
  text: string
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const editThread = trpc.thread.update.useMutation()

  const form = useForm({
    resolver: zodResolver(EditThreadValidation),
    defaultValues: {
      text: text,
      threadId: userId,
    },
  })
  async function onSubmit(values: z.infer<typeof EditThreadValidation>) {
    setIsSubmitting(true)
    try {
      await editThread.mutateAsync({
        text: values.text,
        threadId: threadId,
        path: pathname,
      })

      router.push(`/thread/${threadId}`)
      toast.success("Thread Edited Successfully")
    } catch (error: any) {
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
        {isComment ? (
          <CustomTextArea form={form} name="text" alt="Edit Thread" />
        ) : (
          <Editor
            onChange={(value) => form.setValue("text", value)}
            initialContent={form.watch("text")}
            editable={true}
          />
        )}
        <Button
          type="submit"
          className="bg-primary-500"
          disabled={isSubmitting}
        >
          Edit Thread
        </Button>
      </form>
    </Form>
  )
}

export default EditThread
