import * as z from "zod"

export const CommunityValidation = z.object({
  name: z.string().min(3, { message: "Minimum 3 characters" }),
  image: z.string().url(),
  cid: z.string().min(3).max(30),
  bio: z.string().min(3).max(1000),
  joinMode: z.enum(["open", "approval", "closed"]),
})

export const InviteValidation = z.object({
  cid: z.string().min(3).max(30),
})
