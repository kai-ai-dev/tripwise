'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

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

  const statusColor: Record<string, string> = {
    success: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-600',
    generating: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-gray-100 text-gray-500',
  }
  const statusLabel: Record<string, string> = {
    success: '已完成', failed: '失败', generating: '生成中', pending: '等待中',
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">我的旅行库</h1>
          <Link href="/planner" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            + 新建规划
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">还没有旅行计划</p>
            <Link href="/planner" className="text-blue-600 hover:underline">去创建第一个</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-800">{plan.origin} → {plan.destination}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[plan.status] || statusColor.pending}`}>
                      {statusLabel[plan.status] || plan.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">{plan.start_date} 至 {plan.end_date} · ¥{plan.budget}</p>
                </div>
                {plan.status === 'success' ? (
                  <Link href={`/trips/${plan.id}`} className="text-sm text-blue-600 hover:underline">查看 →</Link>
                ) : (
                  <span className="text-sm text-gray-300">暂不可查看</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
