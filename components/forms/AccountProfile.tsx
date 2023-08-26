"use client";
import React, { useState, useEffect } from 'react'
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserValidation } from '@/lib/validations/user';
import { z } from 'zod';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { isBase64Image } from '@/lib/utils';
import { useUploadThing } from '@/lib/hooks/uploadthing';

interface UserProps {
  id: string;
  objectId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
}

interface AccountProfileProps {
  user: UserProps;
  btnTitle: string;
}

interface AccountFormFieldProps {
  user: UserProps;
  form: any;
  name: string;
}

const AccountProfile = ({ user, btnTitle }: AccountProfileProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const { startUpload } = useUploadThing("media");

  const form = useForm({
    resolver: zodResolver(UserValidation),
    defaultValues: {
      username: user.username || '',
      name: user.name || '',
      bio: user.bio || '',
      profile_photo: user.image,
    }
  });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) {
    e.preventDefault();
    const fileReader = new FileReader();

    if(e.target?.files && e.target.files.length > 0) {
      const file = e.target?.files[0];
      setFiles(Array.from(e.target.files));

      if(!file.type.includes('image')) return;

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || '';
        onChange(imageDataUrl);
      }

      fileReader.readAsDataURL(file);
    }
  }

  async function onSubmit(values: z.infer<typeof UserValidation>) {
    const blob = values.profile_photo;
    
    const hasImageChanged = isBase64Image(blob);

    if(hasImageChanged) {
      const imgRes = await startUpload(files);

      if (imgRes && imgRes[0].fileUrl) {
        values.profile_photo = imgRes[0].fileUrl;
      }
    }
    // TODO: Update user profile
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-start gap-10">
        <AccountProfilePhoto user={user} form={form} handleImageChange={handleImageChange} name='profile' />
        <AccountInputField user={user} form={form} name='name' />
        <AccountInputField user={user} form={form} name='username' />
        <AccountTextArea user={user} form={form} name='bio' />

        <Button type="submit" className='bg-primary-500'>Submit</Button>
      </form>
    </Form>
  )
}

export default AccountProfile

function AccountProfilePhoto({ user, form, handleImageChange, name } : AccountFormFieldProps & { handleImageChange: (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => void }) {
  return (
    <FormField
          control={form.control}
          name="profile_photo"
          render={({ field }) => (
            <FormItem className='flex items-center gap-4'>
              <FormLabel className='account-form_image-label'>
                {field.value ?(
                  <Image
                    src={field.value}
                    alt="Profile Photo"
                    width={96} height={96}
                    priority={true}
                    className='rounded-full object-contain'
                  />)
                :(
                  <Image
                    src={"assets/profile.svg"}
                    alt="Profile Photo"
                    width={30} height={30}
                    className='rounded-full object-contain'
                  />)}
              </FormLabel>
              <FormControl className='flex-1 text-base-semibold text-gray-200'>
                <Input
                  type="file"
                  accept='image/*'
                  placeholder='Upload a profile photo'
                  className='account-form_image-input'
                  onChange={(e) => handleImageChange(e, field.onChange)}
                />
              </FormControl>
            </FormItem>
          )}
        />
  )
}

function AccountInputField({ user, form, name } : AccountFormFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className='flex flex-col gap-3 w-full'>
          <FormLabel className='text-base-semibold text-light-2'>
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </FormLabel>
          <FormControl>
            <Input
              placeholder={`Enter your ${name}`}
              className='account-form_input no-focus'
              {...field}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}

function AccountTextArea({ user, form, name } : AccountFormFieldProps) {
  return (
    <FormField
      control={form.control}
      name={"name"}
      render={({ field }) => (
        <FormItem className='flex flex-col gap-3 w-full'>
          <FormLabel className='text-base-semibold text-light-2'>
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </FormLabel>
          <FormControl>
            <Textarea
              rows={10}
              className='account-form_input no-focus'
              {...field}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}