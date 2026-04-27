'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'


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

  const statusConfig: Record<string, { label: string; color: string }> = {
    success:    { label: '成功',   color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    failed:     { label: '失败',   color: 'text-red-400 bg-red-400/10 border-red-400/20' },
    generating: { label: '生成中', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    pending:    { label: '等待中', color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' },
  }

  const filterOptions = [
    { key: 'all', label: '全部' },
    { key: 'success', label: '成功' },
    { key: 'failed', label: '失败' },
    { key: 'generating', label: '生成中' },
    { key: 'pending', label: '等待' },
  ]

  const successCount = runs.filter(r => r.status === 'success').length
  const failedCount = runs.filter(r => r.status === 'failed').length
  const avgLatency = runs.filter(r => r.latency_ms).length
    ? Math.round(runs.filter(r => r.latency_ms).reduce((s, r) => s + r.latency_ms, 0) / runs.filter(r => r.latency_ms).length / 1000 * 10) / 10
    : null

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
    <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">后台管理</h1>
          <p className="text-gray-400">任务运行状态与平台健康指标</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">总任务数</p>
            <p className="text-3xl font-bold">{stats?.total_runs ?? runs.length}</p>
          </div>
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">成功率</p>
            <p className="text-3xl font-bold text-emerald-400">
              {stats?.success_rate ?? (runs.length ? Math.round(successCount / runs.length * 100) : 0)}%
            </p>
          </div>
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">失败任务</p>
            <p className="text-3xl font-bold text-red-400">{failedCount}</p>
          </div>
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">平均耗时</p>
            <p className="text-3xl font-bold text-blue-400">{avgLatency ? `${avgLatency}s` : '—'}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {filterOptions.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-lg text-sm border transition-all ${
                filter === f.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-transparent text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {f.label}
              {f.key !== 'all' && (
                <span className="ml-1.5 text-xs opacity-60">
                  {runs.filter(r => r.status === f.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Runs list */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl text-gray-500">
            暂无数据
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(run => {
              const cfg = statusConfig[run.status] || statusConfig.pending
              return (
                <div key={run.id} className="bg-gray-900 border border-white/5 hover:border-white/10 rounded-xl p-4 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="text-sm text-gray-400 font-mono">
                        {run.trip_plan_id?.slice(0, 8)}...
                      </span>
                      <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded">
                        {run.provider}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      {run.latency_ms && (
                        <span className={`text-sm font-medium ${run.latency_ms > 30000 ? 'text-amber-400' : 'text-gray-400'}`}>
                          {(run.latency_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span className="text-xs text-gray-600">
                        {run.created_at?.slice(0, 16).replace('T', ' ')}
                      </span>
                    </div>
                  </div>
                  {run.error_message && (
                    <div className="mt-3 bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                      <p className="text-xs text-red-400 font-mono leading-relaxed">
                        {run.error_message?.slice(0, 200)}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
