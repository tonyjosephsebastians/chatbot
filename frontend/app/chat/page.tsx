'use client'
import React, { useEffect, useState } from 'react'
import API from '@/lib/api'
import { loadSession, clearSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'

type Citation = { source?: string, chunk?: number, preview?: string }
type ChatResp = { answer: string, citations: Citation[] }

export default function ChatPage(){
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [cites, setCites] = useState<Citation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const router = useRouter()
  const session = loadSession()

  useEffect(()=>{
    if(!session) router.replace('/login')
  },[router])

  async function ask(){
    if(!session) return
    setError(null)
    try{
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${session.token}` },
        body: JSON.stringify({ question })
      })
      if(!res.ok) throw new Error((await res.json()).detail || 'Chat failed')
      const data: ChatResp = await res.json()
      setAnswer(data.answer)
      setCites(data.citations || [])
    }catch(e:any){
      setError(e.message)
    }
  }

  async function openPreview(c: Citation){
    if(!session || !c.source || c.chunk === undefined) return
    try{
      const url = `${API}/view?source=${encodeURIComponent(c.source)}&chunk=${c.chunk}`
      const res = await fetch(url, { headers: { Authorization: `Bearer ${session.token}` } })
      const html = await res.text()
      setPreviewHtml(html)
      setPreviewOpen(true)
    }catch(e){
      console.error(e)
    }
  }

  async function exportDoc(){
    if(!session) return
    const res = await fetch(`${API}/export/summary.docx`, { headers: { Authorization: `Bearer ${session.token}` } })
    if(!res.ok){ alert('Export failed'); return }
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'summary.docx'
    a.click()
  }

  return (
    <div style={{position:'relative'}}>
      <div className="headbar">
        <h2>Chat</h2>
        <div>
          <span style={{marginRight: 8, color:'#3a4a4a'}}>{session?.role?.toUpperCase()}</span>
          <button className="td-btn" onClick={()=>{ clearSession(); router.replace('/login')}}>Logout</button>
        </div>
      </div>
      <div className="card">
        <textarea value={question} onChange={e=>setQuestion(e.target.value)} rows={4} style={{width:'100%'}} className="input" placeholder="Ask about your Excel or Word documents..." />
        <div style={{marginTop: 8, display:'flex', gap:8}}>
          <button className="td-btn" onClick={ask}>Ask</button>
          <button className="td-btn" onClick={exportDoc}>Export Summary</button>
        </div>
        {error && <div style={{color:'#b00020', marginTop:8}}>{error}</div>}
        {answer && (
          <div style={{marginTop:16}}>
            <h3>Answer</h3>
            <p>{answer}</p>
          </div>
        )}
        {cites.length>0 && (
          <div style={{marginTop:16}}>
            <h3>Citations</h3>
            <ul>
              {cites.map((c,i)=>(
                <li key={i} className="citation">
                  <a href="#" onClick={(e)=>{e.preventDefault(); openPreview(c)}}>
                    <strong>{c.source}</strong> (chunk {c.chunk})
                  </a><br/>
                  <span>{c.preview}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Right preview drawer */}
      {previewOpen && (
        <div style={{position:'fixed', top:0, right:0, width:'48%', height:'100vh', background:'#fff', borderLeft:'1px solid #e6e6e6', boxShadow:'-2px 0 8px rgba(0,0,0,0.06)', zIndex:50}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderBottom:'1px solid #e6e6e6', background:'#f6f9f7'}}>
            <strong>Source Preview</strong>
            <button className="td-btn" onClick={()=>setPreviewOpen(false)}>Close</button>
          </div>
          <div style={{height:'calc(100% - 48px)', overflow:'auto'}} dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      )}
    </div>
  )
}
