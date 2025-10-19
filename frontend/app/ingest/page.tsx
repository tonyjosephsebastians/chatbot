'use client'
import React, { useEffect, useState } from 'react'
import API from '@/lib/api'
import { loadSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function IngestPage(){
  const [files, setFiles] = useState<FileList | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const router = useRouter()
  const session = loadSession()

  useEffect(()=>{
    if(!session) router.replace('/login')
    if(session && session.role !== 'admin') router.replace('/chat')
  },[router])

  async function handleUpload(){
    if(!session || !files) return
    const data = new FormData()
    Array.from(files).forEach(f=>data.append('files', f))
    const res = await fetch(`${API}/ingest/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.token}` },
      body: data
    })
    if(!res.ok){ setMsg('Upload failed'); return }
    const out = await res.json()
    setMsg(`Uploaded: ${(out.saved || []).join(', ')}`)
  }

  async function handleBuild(){
    if(!session) return
    const res = await fetch(`${API}/ingest/build`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.token}` }
    })
    if(!res.ok){ setMsg('Index build failed'); return }
    setMsg('Index built.')
  }

  return (
    <div>
      <div className="headbar"><h2>Ingest (Admin)</h2></div>
      <div className="card">
        <p>Upload <strong>Excel (.xlsx, .csv)</strong> and <strong>Word (.docx)</strong> files.</p>
        <input type="file" multiple onChange={e=>setFiles(e.target.files)} />
        <div style={{marginTop:8, display:'flex', gap:8}}>
          <button className="td-btn" onClick={handleUpload}>Upload</button>
          <button className="td-btn" onClick={handleBuild}>Build Index</button>
        </div>
        {msg && <p>{msg}</p>}
      </div>
    </div>
  )
}
