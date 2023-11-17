"use client"

import React, { ReactDOM } from "react"

import Editor from "./Editor"

const Content = ({ content }: { content: string }) => {
  try {
    return (
      <p className="mt-2 text-small-regular text-light-2">
        {JSON.parse(content) && (
          <Editor initialContent={content} editable={false} />
        )}
      </p>
    )
  } catch (error) {
    return <p className="mt-2 text-small-regular text-light-2">{content}</p>
  }
}

export default Content
