const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const api = {
  // 创建规划任务
  createPlan: (body: object) =>
    request<{ trip_id: string; status: string }>('/api/trips/plan', {
      method: 'POST', body: JSON.stringify(body),
    }),

  // 轮询任务状态
  getStatus: (tripId: string) =>
    request<{ id: string; status: string; progress_hint?: string; error_message?: string }>(
      `/api/trips/${tripId}/status`
    ),

  // 获取行程详情
  getTrip: (tripId: string) => request(`/api/trips/${tripId}`),

  // 获取历史计划
  getHistory: () => request('/api/history'),

  // 重生成
  regenerate: (tripId: string) =>
    request(`/api/trips/${tripId}/regenerate`, { method: 'POST', body: '{}' }),

  // 导出 Markdown
  exportTrip: (tripId: string) =>
    fetch(`${API_URL}/api/trips/${tripId}/export`, { method: 'POST' }),

  // 提交反馈
  submitFeedback: (tripId: string, score: number, comment: string) =>
    request(`/api/trips/${tripId}/feedback`, {
      method: 'POST', body: JSON.stringify({ score, comment }),
    }),

  // 后台统计
  getAdminStats: () => request('/api/admin/stats'),
  getAdminRuns: (status?: string) =>
    request(`/api/admin/planner-runs${status ? `?status=${status}` : ''}`),
}
