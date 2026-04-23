'use client'
import { useEffect, useState } from 'react'

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null)
  const [runs, setRuns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    Promise.all([
      fetch(`${API}/api/admin/stats`).then(r => r.json()),
      fetch(`${API}/api/admin/planner-runs`).then(r => r.json()),
    ]).then(([s, r]) => {
      setStats(s)
      setRuns(Array.isArray(r) ? r : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? runs : runs.filter(r => r.status === filter)

  const statusColor: Record<string, string> = {
    success: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-600',
    generating: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">后台管理</h1>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-sm text-gray-500 mb-1">总任务数</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total_runs}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-sm text-gray-500 mb-1">成功率</p>
              <p className="text-3xl font-bold text-green-600">{stats.success_rate}%</p>
            </div>
          </div>
        )}

        {/* 筛选 */}
        <div className="flex gap-2 mb-4">
          {['all', 'success', 'failed', 'generating', 'pending'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                filter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'
              }`}>
              {f === 'all' ? '全部' : f === 'success' ? '成功' : f === 'failed' ? '失败' : f === 'generating' ? '生成中' : '等待'}
            </button>
          ))}
        </div>

        {/* 任务列表 */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(run => (
              <div key={run.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[run.status] || statusColor.pending}`}>
                      {run.status}
                    </span>
                    <span className="text-sm text-gray-600 font-mono">{run.trip_plan_id?.slice(0, 8)}...</span>
                    <span className="text-xs text-gray-400">{run.provider}</span>
                  </div>
                  <div className="text-right">
                    {run.latency_ms && (
                      <span className="text-xs text-gray-400">{(run.latency_ms / 1000).toFixed(1)}s</span>
                    )}
                    <p className="text-xs text-gray-400">{run.created_at?.slice(0, 16).replace('T', ' ')}</p>
                  </div>
                </div>
                {run.error_message && (
                  <p className="text-xs text-red-500 mt-2 bg-red-50 rounded p-2 font-mono">{run.error_message?.slice(0, 200)}</p>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-8 text-gray-400">暂无数据</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
