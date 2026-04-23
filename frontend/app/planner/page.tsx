'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PREFERENCES = ['美食', '历史文化', '自然风光', '购物', '艺术', '户外运动', '亲子', '摄影']
const PACE_OPTIONS = [
  { value: 'budget', label: '省钱优先', desc: '住青旅、吃街边小吃' },
  { value: 'standard', label: '均衡安排', desc: '性价比住宿、本地餐厅' },
  { value: 'deep', label: '深度游', desc: '品质酒店、深入体验' },
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">规划我的旅行</h1>
          <p className="text-gray-500 mt-1">填写信息，AI 为你生成专属行程</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">出发地</label>
              <input required className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="如：上海" value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">目的地</label>
              <input required className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="如：成都" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">出发日期</label>
              <input required type="date" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">返回日期</label>
              <input required type="date" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">总预算（元）</label>
            <input required type="number" min="500" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="如：3500" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">旅行偏好（可多选）</label>
            <div className="flex flex-wrap gap-2">
              {PREFERENCES.map(p => (
                <button key={p} type="button" onClick={() => togglePref(p)}
                  className={`px-4 py-2 rounded-full text-sm border transition-colors ${form.preferences.includes(p) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">旅行节奏</label>
            <div className="grid grid-cols-3 gap-3">
              {PACE_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, pace: opt.value }))}
                  className={`p-3 rounded-xl border text-left transition-colors ${form.pace === opt.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className={`font-medium text-sm ${form.pace === opt.value ? 'text-blue-700' : 'text-gray-800'}`}>{opt.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
          {loading && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-blue-700 text-sm">{status}</span>
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium text-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading ? '生成中...' : '生成我的行程 →'}
          </button>
        </form>
      </div>
    </div>
  )
}
