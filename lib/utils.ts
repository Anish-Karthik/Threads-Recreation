import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { toggleLikeThread } from "./actions/thread.actions"

// generated by shadcn
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isBase64Image(imageData: string) {
  const base64Regex = /^data:image\/(png|jpe?g|gif|webp);base64,/
  return base64Regex.test(imageData)
}

export function formatDateString(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }

  const date = new Date(dateString)
  const formattedDate = date.toLocaleDateString(undefined, options)

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })

  return `${time} - ${formattedDate}`
}

export function formatThreadCount(count: number): string {
  if (count === 0) {
    return "No Threads"
  } else {
    const threadCount = count.toString().padStart(2, "0")
    const threadWord = count === 1 ? "Thread" : "Threads"
    return `${threadCount} ${threadWord}`
  }
}

export function debounce<T extends (...args: any[]) => void>(
  wait: number,
  callback: T,
  immediate = false
) {
  // This is a number in the browser and an object in Node.js,
  // so we'll use the ReturnType utility to cover both cases.
  let timeout: ReturnType<typeof setTimeout> | null
  let count = 0
  return function <U>(this: U, ...args: Parameters<typeof callback>) {
    const context = this
    const later = () => {
      timeout = null

      if (!immediate) {
        callback.apply(context, args)
      }
    }
    const callNow = immediate && !timeout

    if (typeof timeout === "number") {
      clearTimeout(timeout)
    }

    timeout = setTimeout(later, wait)

    if (callNow) {
      callback.apply(context, args)
    }
  }
}

export function debounceLike<T extends (...args: any[]) => void>(
  fn: T,
  t: number
) {
  let timeoutId: ReturnType<typeof setTimeout> | null
  let count = 0
  return function (...args: Parameters<typeof fn>) {
    clearTimeout(timeoutId)
    count++
    console.log(count)
    timeoutId = setTimeout(() => {
      if (count % 2) fn(...args)
      console.log(count)
    }, t)
  }
}
