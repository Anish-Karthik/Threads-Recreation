"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { communities } from "@prisma/client"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"

import {
  createCommunity,
  updateCommunityInfo,
} from "@/lib/actions/community.actions"
import { useUploadThing } from "@/lib/hooks/uploadthing"
import { isBase64Image } from "@/lib/utils"
import { CommunityValidation } from "@/lib/validations/community"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import {
  CustomInputField,
  CustomProfilePhoto,
  CustomTextArea,
} from "../form-fields"
import { Input } from "../ui/input"

const CreateCommunity = ({
  userId,
  communityDetails,
}: {
  userId: string
  communityDetails?: communities
}) => {
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { startUpload } = useUploadThing("media")
  const router = useRouter()
  const pathname = usePathname()

  const form = useForm({
    resolver: zodResolver(CommunityValidation),
    defaultValues: {
      name: communityDetails?.name || "",
      cid: communityDetails?.cid || "",
      bio: communityDetails?.bio || "",
      image: communityDetails?.image || "/assets/org.png",
      joinMode: communityDetails?.joinMode || "open",
    },
  })
  if (!userId) return null

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

  async function onSubmit(values: z.infer<typeof CommunityValidation>) {
    setIsSubmitting(true)
    const blob = values.image

    const hasImageChanged = isBase64Image(blob)

    if (hasImageChanged) {
      const imgRes = await startUpload(files)
      // TODO: deprecated
      if (imgRes && imgRes[0].url) {
        values.image = imgRes[0].url
      }
    }
    try {
      if (communityDetails) {
        const updatedCommunity = await updateCommunityInfo({
          cid: communityDetails.cid,
          name: values.name,
          image: values.image,
          bio: values.bio,
          joinMode: values.joinMode,
        })
        router.push(`/communities/${updatedCommunity.cid}`)
        toast.success("Community Updated Successfully")
      } else {
        const newCommunity = await createCommunity({
          name: values.name,
          cid: values.cid,
          image: values.image,
          bio: values.bio,
          createdById: userId,
          joinMode: values.joinMode,
        })
        router.push(`/communities/${newCommunity.cid}`)
        toast.success("Community Created Successfully")
      }
    } catch (error) {
      toast.error(error.message)
      console.log(error)
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
          name="image"
          alt="Community Logo"
        />
        <SelectJoinMode form={form} name={"joinMode"} />
        <CustomInputField form={form} name="name" alt="Community Name" />
        <CustomInputField form={form} name="cid" alt="Unique cid" />
        <CustomTextArea form={form} name="bio" />

        <Button
          type="submit"
          className="bg-primary-500"
          disabled={isSubmitting}
        >
          {communityDetails ? "Edit" : "Create"} Community
        </Button>
      </form>
    </Form>
  )
}

export default CreateCommunity

export function SelectJoinMode({ form, name }: { form: any; name: string }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex w-full flex-col gap-3">
          <FormLabel className="text-base-semibold text-light-2">
            Join Mode
          </FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="w-[180px] border-none bg-dark-2 text-light-2">
                <SelectValue placeholder="Join Mode" />
              </SelectTrigger>
              <SelectContent className="border-none bg-dark-2 text-light-2">
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="approval">Approval</SelectItem>
                {/* <SelectItem value="closed">Closed</SelectItem> */}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
