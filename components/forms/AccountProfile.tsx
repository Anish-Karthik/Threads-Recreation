"use client"

import React, { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"

import { useUploadThing } from "@/lib/hooks/uploadthing"
import { isBase64Image } from "@/lib/utils"
import { UserValidation } from "@/lib/validations/user"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { trpc } from "@/app/_trpc/client"

import {
  CustomInputField,
  CustomProfilePhoto,
  CustomTextArea,
} from "../form-fields"

type UserProps = {
  id: string
  objectId: string
  username: string
  name: string
  bio: string
  image: string
}

type AccountProfileProps = {
  user: UserProps
  btnTitle: string
}

const AccountProfile = ({ user, btnTitle }: AccountProfileProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const { startUpload } = useUploadThing("media")
  const router = useRouter()
  const pathname = usePathname()
  const updateUser = trpc.user.update.useMutation()

  const form = useForm({
    resolver: zodResolver(UserValidation),
    defaultValues: {
      username: user.username || "",
      name: user.name || "",
      bio: user.bio || "",
      profile_photo: user.image || "",
    },
  })

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) {
    e.preventDefault()
    const fileReader = new FileReader()

    if (e.target?.files && e.target.files.length > 0) {
      const file = e.target?.files[0]
      setFiles(Array.from(e.target.files))

      if (!file.type.includes("image")) return

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || ""
        onChange(imageDataUrl)
      }

      fileReader.readAsDataURL(file)
    }
  }

  async function onSubmit(values: z.infer<typeof UserValidation>) {
    setIsSubmitting(true)
    try {
      const blob = values.profile_photo

      const hasImageChanged = isBase64Image(blob)

      if (hasImageChanged) {
        const imgRes = await startUpload(files)

        if (imgRes && imgRes[0].url) {
          values.profile_photo = imgRes[0].url
        }
      }

      await updateUser.mutateAsync({
        userId: user.id,
        username: values.username,
        name: values.name,
        bio: values.bio,
        image: values.profile_photo,
        path: pathname,
      })

      if (pathname === "/profile/edit") {
        router.back()
      } else {
        router.push("/")
      }
      toast.success("Profile Updated Successfully")
    } catch (error) {
      console.log(error)
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
        <CustomProfilePhoto
          form={form}
          handleImageChange={handleImageChange}
          name="profile_photo"
        />
        <CustomInputField form={form} name="name" />
        <CustomInputField form={form} name="username" />
        <CustomTextArea form={form} name="bio" />

        <Button
          type="submit"
          className="bg-primary-500"
          disabled={isSubmitting}
        >
          {btnTitle}
        </Button>
      </form>
    </Form>
  )
}

export default AccountProfile
