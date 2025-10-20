'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import API from '@/lib/api'
import { saveSession, loadSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const s = loadSession()
    if (s) router.replace('/chat')
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const res = await axios.post(`${API}/auth/login`, { username, password })
      saveSession({ token: res.data.access_token, role: res.data.role })
      router.replace('/chat')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 560, margin: '60px auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Image src="/td-logo.svg" alt="TD" width={54} height={54} />
        <div>
          <h1>Welcome to SOP Docs Chat</h1>
          <p style={{ margin: 0, color: '#3a4a4a' }}>
            Sign in below to start exploring your SOP and document knowledge base.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <div style={{ marginBottom: 14 }}>
          <label>Username</label><br />
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label>Password</label><br />
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>
        {error && <div style={{ color: '#b00020', marginBottom: 8 }}>{error}</div>}
        <button className="td-btn" type="submit" disabled={busy}>
          {busy ? <span className="spinner" /> : <LogIn size={18} />} Sign in
        </button>
      </form>
    </div>
  )
}
