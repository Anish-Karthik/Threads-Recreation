"use client";
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, usePathname } from 'next/navigation';
import { EditThreadValidation } from "@/lib/validations/thread";
import { editThread } from "@/lib/actions/thread.actions";
import { ThreadTextArea } from "./PostThread";

const EditThread = ({ userId, threadId, text }: { userId: string, threadId: string, text: string }) => {
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm({
    resolver: zodResolver(EditThreadValidation),
    defaultValues: {
      text: text,
      threadId: userId,
    }
  });
  async function onSubmit(values: z.infer<typeof EditThreadValidation>) {
    await editThread({
      text: values.text,
      threadId: threadId,
      path: pathname,
    });

    router.push(`/thread/${threadId}`)
  }

  return (
    <Form {...form}> 
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-start gap-10">
        <ThreadTextArea form={form} name="text" defaultValue={text}/>
        <Button type="submit" className="bg-primary-500">
          Edit Thread
        </Button>
      </form>
    </Form>
  )
}

export default EditThread
