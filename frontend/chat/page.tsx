'use client'
import React, { useEffect, useState, useRef } from 'react'
import API from '@/lib/api'
import { loadSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { Send, Download, ExternalLink } from 'lucide-react'

type Citation = { source?: string, chunk?: number, preview?: string, page?: number }
type ChatResp = { answer: string, citations: Citation[] }

export default function ChatPage(){
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [cites, setCites] = useState<Citation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  const session = loadSession()
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{ if(!session) router.replace('/login') },[router])

  async function ask(){
    if(!session || !question.trim()) return
    setError(null); setBusy(true)
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
    }finally{
      setBusy(false)
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
      setTimeout(() => {
        // Scroll smoothly to highlighted section (first <mark>)
        const mark = previewRef.current?.querySelector('mark')
        if(mark) mark.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 500)
    }catch(e){ console.error(e) }
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
      <div className="card">
        <h1>Chat</h1>

        <textarea
          value={question}
          onChange={e=>setQuestion(e.target.value)}
          className="input textarea"
          placeholder="Ask about your SOP, DOCX, or Excel data..."
        />

        <div style={{marginTop: 12, display:'flex', gap:10}}>
          <button className="td-btn" onClick={ask} disabled={busy}>
            {busy ? <span className="spinner"/> : <Send size={18}/>} Ask
          </button>
          <button className="td-btn" onClick={exportDoc}>
            <Download size={18}/> Export Summary
          </button>
        </div>

        {busy && (
          <div style={{marginTop:10, color:'#007c41', fontWeight:600}}>
            Thinking... please wait
          </div>
        )}

        {error && <div style={{color:'#b00020', marginTop:10}}>{error}</div>}

        {answer && (
          <div style={{marginTop:18}}>
            <h2>Answer</h2>
            <div className="md"><ReactMarkdown>{answer}</ReactMarkdown></div>
          </div>
        )}

        {cites.length>0 && (
          <div style={{marginTop:16}}>
            <h3>Sources</h3>
            <ul>
              {cites.map((c,i)=>(
                <li key={i} className="citation">
                  <a href="#" onClick={(e)=>{e.preventDefault(); openPreview(c)}} className="link-btn">
                    <ExternalLink size={14}/> <strong>{c.source}</strong> (page {c.page ?? c.chunk})
                  </a><br/>
                  <span>{c.preview}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {previewOpen && (
        <div className="drawer">
          <div className="drawer-head">
            <strong>Source Preview</strong>
            <button className="td-btn" onClick={()=>setPreviewOpen(false)}>Close</button>
          </div>
          <div
            ref={previewRef}
            style={{height:'calc(100% - 48px)', overflow:'auto', scrollBehavior:'smooth'}}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      )}
    </div>
  )
}
