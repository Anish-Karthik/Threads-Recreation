"use client";
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { useRouter, usePathname } from 'next/navigation';
import { ThreadValidation } from "@/lib/validations/thread";
import { createThread } from "@/lib/actions/thread.actions";

const PostThread = ({ userId }: {userId: string}) => {
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread: '',
      accountId: userId,
    }
  });
  async function onSubmit(values: z.infer<typeof ThreadValidation>) {
    await createThread({
      text: values.thread,
      author: userId,
      communityId: null,
      path: pathname,
    });

    router.push('/')
  }

  return (
    <Form {...form}> 
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-start gap-10">
        <ThreadTextArea form={form} name="thread"/>
        <Button type="submit" className="bg-primary-500">
          Post Thread
        </Button>
      </form>
    </Form>
  )
}

export default PostThread

interface ThreadFormFieldProps {
  form: any;
  name: string;
}


function ThreadTextArea({ form, name } : ThreadFormFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className='flex flex-col gap-3 w-full'>
          <FormLabel className='text-base-semibold text-light-2'>
            Content
          </FormLabel>
          <FormControl>
            <Textarea
              rows={15}
              className='account-form_input no-focus'
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}