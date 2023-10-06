
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import Image from 'next/image';
import { Input } from "@/components/ui/input"
import { Textarea } from '@/components/ui/textarea';

type CustomFormFieldProps = {
  form: any;
  name: string;
  alt?: string;
}

export function CustomProfilePhoto({ form, handleImageChange, name="profile_photo", alt="Profile Photo" }: CustomFormFieldProps & { handleImageChange: (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => void }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className='flex items-center gap-4'>
          <FormLabel className='account-form_image-label'>
            {field.value ? (
              <Image
                src={field.value}
                alt={alt}
                width={96} height={96}
                priority={true}
                className='rounded-full object-contain'
              />)
              : (
              <Image
                src={"assets/profile.svg"}
                alt={alt}
                width={30} height={30}
                className='rounded-full object-contain'
              />)
              }
          </FormLabel>
          <FormControl className='flex-1 text-base-semibold text-gray-200'>
            <Input
              type="file"
              accept='image/*'
              placeholder={`Upload a ${alt}`}
              className='account-form_image-input'
              onChange={(e) => handleImageChange(e, field.onChange)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function CustomInputField({ form, name, alt }: CustomFormFieldProps ) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className='flex flex-col gap-3 w-full'>
          <FormLabel className='text-base-semibold text-light-2'>
            {alt? alt : name.charAt(0).toUpperCase() + name.slice(1)}
          </FormLabel>
          <FormControl>
            <Input
              placeholder={`Enter your ${alt? alt : name}`}
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

export function CustomTextArea({ form, name, rows = 10, alt }: CustomFormFieldProps & { rows?: number} ) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className='flex flex-col gap-3 w-full'>
          <FormLabel className='text-base-semibold text-light-2'>
            {alt? alt :name.charAt(0).toUpperCase() + name.slice(1)}
          </FormLabel>
          <FormControl>
            <Textarea
              rows={rows}
              className='account-form_input no-focus'
              placeholder={`Enter your ${alt? alt : name}`}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}