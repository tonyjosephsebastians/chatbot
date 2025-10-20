'use client'
import React, { useEffect, useState } from 'react'
import API from '@/lib/api'
import { loadSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Upload, Hammer } from 'lucide-react'

export default function IngestPage(){
  const [files, setFiles] = useState<FileList | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [uploadBusy, setUploadBusy] = useState(false)
  const [buildBusy, setBuildBusy] = useState(false)
  const router = useRouter()
  const session = loadSession()

  useEffect(()=>{
    if(!session) router.replace('/login')
    if(session && session.role !== 'admin') router.replace('/chat')
  },[router])

  async function handleUpload(){
    if(!session || !files) return
    setMsg(null); setUploadBusy(true)
    try{
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
    } finally {
      setUploadBusy(false)
    }
  }

  async function handleBuild(){
    if(!session) return
    setMsg(null); setBuildBusy(true)
    try{
      const res = await fetch(`${API}/ingest/build`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.token}` }
      })
      if(!res.ok){ setMsg('Index build failed'); return }
      setMsg('Index built successfully.')
    } finally {
      setBuildBusy(false)
    }
  }

  return (
    <div className="card">
      <h1>Ingest (Admin)</h1>
      <p>Upload <strong>Excel (.xlsx, .csv)</strong> and <strong>Word (.docx)</strong> files.</p>
      <input type="file" multiple onChange={e=>setFiles(e.target.files)} />
      <div style={{marginTop:12, display:'flex', gap:10}}>
        <button className="td-btn" onClick={handleUpload} disabled={uploadBusy}>
          {uploadBusy ? <span className="spinner"/> : <Upload size={18}/>} Upload
        </button>
        <button className="td-btn" onClick={handleBuild} disabled={buildBusy}>
          {buildBusy ? <span className="spinner"/> : <Hammer size={18}/>} Build Index
        </button>
      </div>
      {msg && <p style={{marginTop:10}}>{msg}</p>}
    </div>
  )
}
