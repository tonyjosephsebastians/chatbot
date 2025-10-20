'use client'
import Image from 'next/image'
import Link from 'next/link'
import { loadSession, clearSession } from '@/lib/auth'
import { useEffect, useState } from 'react'
import { LogOut, MessageCircle, FileUp } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

export default function Header() {
  const [role, setRole] = useState<'admin'|'user'|null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const s = loadSession()
    setRole(s?.role ?? null)
  }, [pathname])

  function doLogout(){
    clearSession()
    router.replace('/login')
  }

  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <Image src="/td-logo.svg" alt="TD" width={32} height={32} />
          <div className="brand-title">SOP Doc Chat</div>
        </div>
        <nav className="nav">
          <Link className="link-btn" href="/chat"><MessageCircle size={18}/> Chat</Link>
          {role === 'admin' && (
            <Link className="link-btn" href="/ingest"><FileUp size={18}/> Ingest</Link>
          )}
          <button className="td-btn" onClick={doLogout}><LogOut size={18}/> Logout</button>
        </nav>
      </div>
    </header>
  )
}
