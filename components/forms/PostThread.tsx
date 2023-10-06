"use client";
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

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, usePathname } from 'next/navigation';
import { ThreadValidation } from "@/lib/validations/thread";
import { createThread } from "@/lib/actions/thread.actions";
import { communities } from "@prisma/client";
import toast from "react-hot-toast";
import { useState } from "react";
import { CustomTextArea } from "../form-fields";

const PostThread = ({ userId, communities }: { userId: string, communities: communities[] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread: '',
      accountId: userId,
      communityId: 'individual',
    }
  });
  async function onSubmit(values: z.infer<typeof ThreadValidation>) {
    setIsSubmitting(true);
    try {
      await createThread({
        text: values.thread,
        author: userId,
        communityId: values.communityId === 'individual' ? null : values.communityId,
        path: pathname,
      });
      toast.success('Thread Posted Successfully');
      router.push('/')
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}> 
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-start gap-10">
        <SelectCommunity form={form} name="communityId" communities={communities}/>
        <CustomTextArea form={form} name="thread" alt="content" />
        <Button type="submit" className="bg-primary-500" disabled={isSubmitting}>
          Post Thread
        </Button>
      </form>
    </Form>
  )
}

export default PostThread

type ThreadFormFieldProps = {
  form: any;
  name: string;
  defaultValue?: string;
}



export function SelectCommunity({ form, name, defaultValue, communities } : ThreadFormFieldProps & { communities: communities[] | string[] }) {

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className='flex flex-col gap-3 w-full'>
          <FormLabel className='text-base-semibold text-light-2'>
            Type of Thread
          </FormLabel>
          <FormControl>
            <Select 
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <SelectTrigger className="w-[180px] bg-dark-2 text-light-2 border-none">
                <SelectValue placeholder="Post Via" />
              </SelectTrigger>
              <SelectContent className="bg-dark-2 text-light-2 border-none">
                {communities[0] && communities[0]['id'] && <SelectItem value="individual">Individual</SelectItem>}
                {communities.map((community, ind) => (
                  <SelectItem key={ind} value={community?.cid?.toString() || community}>
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