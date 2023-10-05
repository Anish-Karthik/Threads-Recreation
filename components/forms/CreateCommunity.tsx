"use client"


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
import { createCommunity } from '@/lib/actions/community.actions';
import { Input } from '../ui/input';

import React, { useState, useEffect } from 'react'
import Image from 'next/image';
import { isBase64Image } from '@/lib/utils';
import { useUploadThing } from '@/lib/hooks/uploadthing';
import { CommunityValidation } from "@/lib/validations/community";
import toast from "react-hot-toast";
import { CustomInputField, CustomProfilePhoto, CustomTextArea } from "../form-fields";

const CreateCommunity = ({ userId }: { userId: string }) => {
  

  const [files, setFiles] = useState<File[]>([]);
  const { startUpload } = useUploadThing("media");
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm({
    resolver: zodResolver(CommunityValidation),
    defaultValues: {
      image: '/assets/org.png',
    }
  });
  if(!userId) return null;

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) {
    e.preventDefault();
    const fileReader = new FileReader();

    if (e.target?.files && e.target.files.length > 0) {
      const file = e.target?.files[0];
      setFiles(Array.from(e.target.files));

      if (!file.type.includes('image')) return;

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || '';
        onChange(imageDataUrl);
      }

      fileReader.readAsDataURL(file);
    }
  }

  async function onSubmit(values: z.infer<typeof CommunityValidation>) {
    const blob = values.image;

    const hasImageChanged = isBase64Image(blob);

    if (hasImageChanged) {
      const imgRes = await startUpload(files);
      // TODO: deprecated
      if (imgRes && imgRes[0].url) {
        values.image = imgRes[0].url;
      }
    }
    try {
      const newCommunity = await createCommunity({ 
        name: values.name,
        cid: values.cid,
        image: values.image,
        bio: values.bio,
        createdById: userId,
      });
  
      router.push(`/communities/${newCommunity.cid}`);
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-start gap-10">
        <CustomProfilePhoto form={form} handleImageChange={handleImageChange} name='image' alt='Community Logo' />
        <CustomInputField form={form} name='name' alt="Community Name" />
        <CustomInputField form={form} name='cid' alt="Unique cid" />
        <CustomTextArea form={form} name='bio' />

        <Button type="submit" className='bg-primary-500'>Create Community</Button>
      </form>
    </Form>
  )
}

export default CreateCommunity
