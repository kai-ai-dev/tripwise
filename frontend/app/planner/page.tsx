'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PREFERENCES = ['美食', '历史文化', '自然风光', '购物', '艺术', '户外运动', '亲子', '摄影']
const PACE_OPTIONS = [
  { value: 'budget', label: '省钱优先', desc: '住青旅、吃街边小吃', icon: '💰' },
  { value: 'standard', label: '均衡安排', desc: '性价比住宿、本地餐厅', icon: '⚖️' },
  { value: 'deep', label: '深度游', desc: '品质酒店、深入体验', icon: '✨' },
]

export default function PlannerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [form, setForm] = useState({
    origin: '', destination: '', start_date: '', end_date: '',
    budget: '', preferences: [] as string[], pace: 'standard',
  })

  const togglePref = (p: string) => setForm(f => ({
    ...f,
    preferences: f.preferences.includes(p)
      ? f.preferences.filter(x => x !== p)
      : [...f.preferences, p],
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('正在提交规划请求...')
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API}/api/trips/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, budget: Number(form.budget) }),
      })
      const data = await res.json()
      const tripId = data.trip_id
      setStatus('AI 正在生成行程，请稍候...')
      const poll = setInterval(async () => {
        const sr = await fetch(`${API}/api/trips/${tripId}/status`)
        const sd = await sr.json()
        if (sd.status === 'success') {
          clearInterval(poll)
          router.push(`/trips/${tripId}`)
        } else if (sd.status === 'failed') {
          clearInterval(poll)
          setStatus('生成失败，请重试')
          setLoading(false)
        } else {
          setStatus(sd.progress_hint || 'AI 正在规划中...')
        }
      }, 2000)
    } catch {
      setStatus('请求失败，请检查网络')
      setLoading(false)
    }
  }

  const days = form.start_date && form.end_date
    ? Math.max(0, Math.ceil((new Date(form.end_date).getTime() - new Date(form.start_date).getTime()) / 86400000))
    : null

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-xs font-bold">T</div>
          <span className="font-semibold tracking-tight">Tripwise</span>
        </Link>
        <Link href="/history" className="text-sm text-gray-400 hover:text-white transition-colors">我的行程</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">规划我的旅行</h1>
          <p className="text-gray-400">填写信息，AI 为你生成专属行程</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 出发地 / 目的地 */}
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">目的地</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">出发地</label>
                <input
                  required
                  className="w-full bg-gray-800 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="如：上海"
                  value={form.origin}
                  onChange={e => setForm(f => ({ ...f, origin: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">目的地</label>
                <input
                  required
                  className="w-full bg-gray-800 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="如：成都"
                  value={form.destination}
                  onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* 日期 */}
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">出行日期</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">出发日期</label>
                <input
                  required type="date"
                  className="w-full bg-gray-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  value={form.start_date}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">返回日期</label>
                <input
                  required type="date"
                  className="w-full bg-gray-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  value={form.end_date}
                  onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                />
              </div>
            </div>
            {days !== null && days > 0 && (
              <div className="mt-3 text-sm text-blue-400">共 {days} 天行程</div>
            )}
          </div>

          {/* 预算 */}
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">旅行预算</h2>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
              <input
                required type="number" min="500"
                className="w-full bg-gray-800 border border-white/5 rounded-xl pl-8 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="如：3500"
                value={form.budget}
                onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
              />
            </div>
            {form.budget && days && days > 0 && (
              <div className="mt-3 text-sm text-gray-500">
                约 <span className="text-gray-300">¥{Math.round(Number(form.budget) / days)}</span> / 天
              </div>
            )}
          </div>

          {/* 偏好 */}
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">旅行偏好</h2>
            <div className="flex flex-wrap gap-2">
              {PREFERENCES.map(p => (
                <button
                  key={p} type="button" onClick={() => togglePref(p)}
                  className={`px-4 py-2 rounded-full text-sm border transition-all ${
                    form.preferences.includes(p)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* 节奏 */}
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">旅行节奏</h2>
            <div className="grid grid-cols-3 gap-3">
              {PACE_OPTIONS.map(opt => (
                <button
                  key={opt.value} type="button"
                  onClick={() => setForm(f => ({ ...f, pace: opt.value }))}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    form.pace === opt.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/5 hover:border-white/10 bg-gray-800/50'
                  }`}
                >
                  <div className="text-xl mb-2">{opt.icon}</div>
                  <div className={`font-medium text-sm ${form.pace === opt.value ? 'text-blue-400' : 'text-white'}`}>
                    {opt.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 状态 */}
          {loading && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-5 py-4 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
              <span className="text-blue-400 text-sm">{status}</span>
            </div>
          )}

          {/* 提交 */}
          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white py-4 rounded-xl font-medium text-lg transition-all hover:scale-[1.01] disabled:hover:scale-100"
          >
            {loading ? '生成中...' : '生成我的行程 →'}
          </button>
        </form>
      </div>
    </div>
  )
}
