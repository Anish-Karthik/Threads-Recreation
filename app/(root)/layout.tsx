import '../globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

import '../globals.css'
import { Topbar, Bottombar, LeftSidebar, RightSidebar } from '@/components/shared/'
import { ToasterProvider } from '@/components/shared/ToastProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Threads',
  description: 'A Next.js 13 Meta Threads Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ToasterProvider />
          <Topbar />
          <main className='flex flex-row'>
            <LeftSidebar />
            
            <section className='main-container'>
              <div className='w-full max-w-4xl'>
                
                {children}
              </div>
            </section>
            
            <RightSidebar />
          </main>
          <Bottombar />
        </body>
      </html>
    </ ClerkProvider>
  )
}
