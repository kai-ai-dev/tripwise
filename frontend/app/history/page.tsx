'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

const COLORS = [
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-rose-500',
  'from-violet-500 to-purple-500',
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-blue-500',
]

export default function HistoryPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    fetch(`${API}/api/history`)
      .then(r => r.json())
      .then(d => { setPlans(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const statusConfig: Record<string, { label: string; color: string }> = {
    success:    { label: '已完成', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    failed:     { label: '失败',   color: 'text-red-400 bg-red-400/10 border-red-400/20' },
    generating: { label: '生成中', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    pending:    { label: '等待中', color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' },
  }

  const getDays = (start: string, end: string) => {
    if (!start || !end) return null
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000)
    return days > 0 ? days : null
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-xs font-bold">T</div>
          <span className="font-semibold tracking-tight">Tripwise</span>
        </Link>
        <Link href="/planner" className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors">
          + 新建规划
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">我的旅行库</h1>
          <p className="text-gray-400">你规划过的每一段旅程</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl">
            <div className="text-4xl mb-4">🗺️</div>
            <p className="text-gray-400 mb-6">还没有旅行计划</p>
            <Link href="/planner" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm transition-colors">
              去创建第一个 →
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">共 {plans.length} 段旅程</p>
            <div className="grid md:grid-cols-2 gap-4">
              {plans.map((plan, i) => {
                const cfg = statusConfig[plan.status] || statusConfig.pending
                const days = getDays(plan.start_date, plan.end_date)
                const color = COLORS[i % COLORS.length]
                return (
                  <div key={plan.id} className="group relative bg-gray-900 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all hover:-translate-y-0.5">
                    {/* Color bar */}
                    <div className={`h-1.5 bg-gradient-to-r ${color}`} />
                    <div className="p-5">
                      {/* Title row */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg leading-tight">
                            {plan.origin} → {plan.destination}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            {days && (
                              <span className="text-xs text-gray-500">{days} 天</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <div className="text-lg font-semibold text-white">¥{Number(plan.budget).toLocaleString()}</div>
                          {days && (
                            <div className="text-xs text-gray-500">约 ¥{Math.round(plan.budget / days)}/天</div>
                          )}
                        </div>
                      </div>

                      {/* Date */}
                      <div className="text-sm text-gray-500 mb-4">
                        {plan.start_date} — {plan.end_date}
                      </div>

                      {/* Action */}
                      {plan.status === 'success' ? (
                        <Link
                          href={`/trips/${plan.id}`}
                          className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-sm text-gray-300 hover:text-white transition-all"
                        >
                          查看行程 →
                        </Link>
                      ) : plan.status === 'generating' || plan.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-2 w-full py-2.5 bg-amber-400/5 border border-amber-400/10 rounded-xl text-sm text-amber-400">
                          <div className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" />
                          生成中...
                        </div>
                      ) : (
                        <Link
                          href="/planner"
                          className="flex items-center justify-center w-full py-2.5 bg-white/5 border border-white/5 rounded-xl text-sm text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          重新规划
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
