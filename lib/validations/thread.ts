import * as z from "zod"

export const ThreadValidation = z.object({
  thread: z.string().nonempty().min(3, { message: "Minimum 3 characters" }),
  accountId: z.string(),
  communityId: z.string(),
})

export const CommentValidation = z.object({
  thread: z.string().nonempty().min(3, { message: "Minimum 3 characters" }),
})

export const EditThreadValidation = z.object({
  threadId: z.string().nonempty(),
  text: z.string().nonempty().min(3, { message: "Minimum 3 characters" }),
})
