import './globals.css'
import Image from 'next/image'
import Link from 'next/link'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="page">
          <aside className="sidebar">
            <div className="brand">
              <Image src="/td-logo.svg" alt="TD" width={40} height={40} />
              <h1>DocChat</h1>
            </div>
            <nav style={{marginTop: 12, display: 'grid', gap: 8}}>
              <Link href="/login">Login</Link>
              <Link href="/chat">Chat</Link>
              <Link href="/ingest">Ingest (Admin)</Link>
            </nav>
          </aside>
          <main className="container">{children}</main>
        </div>
      </body>
    </html>
  )
}
