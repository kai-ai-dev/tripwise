'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TripDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    fetch(`${API}/api/trips/${id}`)
      .then(r => r.json())
      .then(d => { setTrip(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const handleRegenerate = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    await fetch(`${API}/api/trips/${id}/regenerate`, { method: 'POST', body: '{}', headers: { 'Content-Type': 'application/json' } })
    router.push('/history')
  }

  const handleExport = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const res = await fetch(`${API}/api/trips/${id}/export`, { method: 'POST' })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `行程_${trip?.destination}_${trip?.start_date}.md`
    a.click()
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500">加载行程中...</p>
      </div>
    </div>
  )

  if (!trip) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">行程不存在或仍在生成中</p>
        <Link href="/planner" className="text-blue-600 hover:underline">重新规划</Link>
      </div>
    </div>
  )

  const totalSpend = trip.days?.reduce((s: number, d: any) => s + (d.day_budget || 0), 0) || 0

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-sm text-gray-400 mb-1">
              <Link href="/history" className="hover:text-blue-500">我的行程</Link> / {trip.destination}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{trip.origin} → {trip.destination}</h1>
            <p className="text-gray-500 text-sm mt-1">{trip.start_date} 至 {trip.end_date} · 总预算 ¥{trip.budget}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleRegenerate} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">重新生成</button>
            <button onClick={handleExport} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">导出 MD</button>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <h2 className="font-medium text-gray-700 mb-3">预算拆分</h2>
          <div className="grid grid-cols-2 gap-3">
            {trip.days?.map((day: any) => (
              <div key={day.day_index} className="flex justify-between text-sm">
                <span className="text-gray-500">第 {day.day_index} 天</span>
                <span className="font-medium text-gray-800">¥{day.day_budget}</span>
              </div>
            ))}
            <div className="col-span-2 border-t pt-2 flex justify-between text-sm font-medium">
              <span>合计</span><span className="text-blue-600">¥{totalSpend}</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {trip.days?.map((day: any) => (
            <div key={day.day_index} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="bg-blue-600 px-5 py-3 flex justify-between items-center">
                <div>
                  <span className="text-white font-medium">Day {day.day_index}</span>
                  <span className="text-blue-200 text-sm ml-2">{day.date}</span>
                </div>
                <span className="text-blue-100 text-sm">¥{day.day_budget}</span>
              </div>
              <div className="px-5 py-3 border-b border-gray-50">
                <h3 className="font-medium text-gray-800">{day.title}</h3>
                <p className="text-gray-400 text-sm mt-0.5">{day.summary}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {day.items?.map((item: any, i: number) => (
                  <div key={i} className="px-5 py-3 flex gap-4">
                    <div className="text-xs text-gray-400 w-24 shrink-0 pt-0.5">{item.start_time} - {item.end_time}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 text-sm">{item.place_name}</span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{item.category}</span>
                      </div>
                      {item.notes && <p className="text-gray-400 text-xs mt-0.5">{item.notes}</p>}
                    </div>
                    <div className="text-sm text-gray-500 shrink-0">¥{item.estimated_cost}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <button disabled className="relative px-6 py-2 border border-gray-200 rounded-lg text-sm text-gray-300 cursor-not-allowed">
            导出 PDF
            <span className="absolute -top-2 -right-2 bg-orange-400 text-white text-xs px-1.5 py-0.5 rounded-full">即将上线</span>
          </button>
        </div>
      </div>
    </div>
  )
}
