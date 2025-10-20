'use client'
import './globals.css'
import Header from '@/components/Header'
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showHeader = pathname !== '/login'

  return (
    <html lang="en">
      <body>
        {showHeader && <Header />}
        <main className="container">{children}</main>
      </body>
    </html>
  )
}
