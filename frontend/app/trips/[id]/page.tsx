'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

const CATEGORY_COLORS: Record<string, string> = {
  '交通': 'bg-blue-500/10 text-blue-400',
  '住宿': 'bg-purple-500/10 text-purple-400',
  '餐饮': 'bg-orange-500/10 text-orange-400',
  '景点': 'bg-emerald-500/10 text-emerald-400',
  '购物': 'bg-pink-500/10 text-pink-400',
  '娱乐': 'bg-amber-500/10 text-amber-400',
}

export default function TripDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    fetch(`${API}/api/trips/${id}`)
      .then(r => r.json())
      .then(d => { setTrip(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const handleRegenerate = async () => {
    setRegenerating(true)
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    await fetch(`${API}/api/trips/${id}/regenerate`, {
      method: 'POST', body: '{}', headers: { 'Content-Type': 'application/json' }
    })
    router.push('/history')
  }

  const handleExport = async () => {
    setExporting(true)
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const res = await fetch(`${API}/api/trips/${id}/export`, { method: 'POST' })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `行程_${trip?.destination}_${trip?.start_date}.md`
    a.click()
    setExporting(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500">加载行程中...</p>
      </div>
    </div>
  )

  if (!trip) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🗺️</div>
        <p className="text-gray-400 mb-6">行程不存在或仍在生成中</p>
        <Link href="/planner" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm transition-colors">
          重新规划 →
        </Link>
      </div>
    </div>
  )

  const totalSpend = trip.days?.reduce((s: number, d: any) => s + (d.day_budget || 0), 0) || 0
  const days = trip.days?.length || 0

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
    <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="text-sm text-gray-500 mb-3">
            <Link href="/history" className="hover:text-gray-300 transition-colors">我的行程</Link>
            <span className="mx-2">/</span>
            <span>{trip.destination}</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">{trip.origin} → {trip.destination}</h1>
              <p className="text-gray-400">{trip.start_date} — {trip.end_date} · {days} 天 · 总预算 ¥{Number(trip.budget).toLocaleString()}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-sm text-gray-300 transition-all disabled:opacity-50"
              >
                {regenerating ? '处理中...' : '重新生成'}
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm text-white transition-all disabled:opacity-50"
              >
                {exporting ? '导出中...' : '导出 MD'}
              </button>
            </div>
          </div>
        </div>

        {/* Budget overview */}
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">预算拆分</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {trip.days?.map((day: any) => (
              <div key={day.day_index} className="bg-gray-800/50 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">第 {day.day_index} 天</div>
                <div className="font-semibold text-white">¥{Number(day.day_budget).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center border-t border-white/5 pt-4">
            <span className="text-sm text-gray-400">合计</span>
            <span className="text-lg font-bold text-blue-400">¥{Number(totalSpend).toLocaleString()}</span>
          </div>
        </div>

        {/* Days */}
        <div className="space-y-4">
          {trip.days?.map((day: any, di: number) => (
            <div key={day.day_index} className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden">
              {/* Day header */}
              <div className="px-5 py-4 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">
                    {day.day_index}
                  </div>
                  <div>
                    <div className="font-semibold">{day.title}</div>
                    <div className="text-xs text-gray-500">{day.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-white">¥{Number(day.day_budget).toLocaleString()}</div>
                </div>
              </div>

              {/* Summary */}
              <div className="px-5 py-3 border-b border-white/5">
                <p className="text-sm text-gray-400">{day.summary}</p>
              </div>

              {/* Items */}
              <div className="divide-y divide-white/5">
                {day.items?.map((item: any, i: number) => (
                  <div key={i} className="px-5 py-4 flex gap-4">
                    <div className="text-xs text-gray-600 w-24 shrink-0 pt-0.5 font-mono">
                      {item.start_time}<br />{item.end_time}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{item.place_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] || 'bg-gray-500/10 text-gray-400'}`}>
                          {item.category}
                        </span>
                      </div>
                      {item.notes && <p className="text-xs text-gray-500 leading-relaxed">{item.notes}</p>}
                    </div>
                    <div className="text-sm text-gray-400 shrink-0 font-medium">
                      ¥{item.estimated_cost}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* PDF placeholder */}
        <div className="mt-6 text-center">
          <button disabled className="relative px-6 py-2.5 border border-white/5 rounded-xl text-sm text-gray-600 cursor-not-allowed">
            导出 PDF
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">即将上线</span>
          </button>
        </div>
      </div>
    </div>
  )
}
