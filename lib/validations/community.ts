import * as z from "zod";
import { isAlreadyCommunity } from "../actions/community.actions";

export const CommunityValidation = z.object({
  name: z.string().min(3, { message: "Minimum 3 characters" }),
  image: z.string().url(),
  cid: z.string().min(3).max(30).refine(async (cid) => {
    return !(await isAlreadyCommunity(cid));
  }, "cid already exists"),
  bio: z.string().min(3).max(1000),
});
