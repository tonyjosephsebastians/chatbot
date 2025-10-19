export type Session = { token: string; role: 'admin'|'user' }
const KEY = 'docchat_session'
export function saveSession(s: Session){ localStorage.setItem(KEY, JSON.stringify(s)) }
export function loadSession(): Session | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : null
}
export function clearSession(){ localStorage.removeItem(KEY) }
