"use client"

import React from 'react'

interface AcountProfileProps {
  user: {
    id: string
    objectId: string
    username: string
    name: string
    bio: string
    Image: string
  }
  btnTitle: string
}

const AcountProfile = ({user, btnTitle} : AcountProfileProps) => {
  return (
    <div>AcountProfile</div>
  )
}

export default AcountProfile