'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import API from '@/lib/api'
import { saveSession, loadSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(()=>{
    const s = loadSession()
    if (s) router.replace('/chat')
  },[router])

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setError(null)
    try{
      const res = await axios.post(`${API}/auth/login`, { username, password })
      saveSession({ token: res.data.access_token, role: res.data.role })
      router.replace('/chat')
    }catch(err:any){
      setError(err?.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <div className="card" style={{maxWidth: 520, margin: '40px auto'}}>
      <div className="logo-box">
        <Image src="/td-logo.svg" alt="TD" width={48} height={48} />
        <div>
          <h2 style={{margin:0}}>Sign in</h2>
          <p style={{margin:0, color:'#3a4a4a'}}>Use admin/admin or frp/pass</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{marginTop: 16}}>
        <div style={{marginBottom: 12}}>
          <label>Username</label><br/>
          <input className="input" value={username} onChange={e=>setUsername(e.target.value)} />
        </div>
        <div style={{marginBottom: 12}}>
          <label>Password</label><br/>
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        {error && <div style={{color:'#b00020', marginBottom: 8}}>{error}</div>}
        <button className="td-btn" type="submit">Sign in</button>
      </form>
    </div>
  )
}
