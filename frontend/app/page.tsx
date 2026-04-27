import Link from 'next/link'

const demoTrips = [
  {
    from: '上海', to: '成都', days: 4, budget: 3500,
    highlights: ['宽窄巷子', '九寨沟', '火锅之夜', '熊猫基地'],
    color: 'from-orange-400 to-rose-500',
  },
  {
    from: '北京', to: '西安', days: 5, budget: 4200,
    highlights: ['兵马俑', '古城墙', '回民街', '华山'],
    color: 'from-amber-400 to-orange-500',
  },
  {
    from: '广州', to: '桂林', days: 3, budget: 2800,
    highlights: ['漓江漂流', '阳朔西街', '象鼻山', '遇龙河'],
    color: 'from-emerald-400 to-teal-500',
  },
]

const steps = [
  { num: '01', title: '输入旅行信息', desc: '出发地、目的地、日期、预算，30秒填完' },
  { num: '02', title: 'AI 智能规划', desc: 'DeepSeek 分析偏好，生成专属行程' },
  { num: '03', title: '查看每日安排', desc: '完整的 Day by Day 行程，含预算拆分' },
  { num: '04', title: '导出随身携带', desc: '一键导出 Markdown，随时查阅' },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-xs font-bold">T</div>
          <span className="font-semibold text-white tracking-tight">Tripwise</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/history" className="text-sm text-gray-400 hover:text-white transition-colors">我的行程</Link>
          <Link href="/planner" className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors">
            开始规划
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/3 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-6">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            AI 驱动的旅行规划平台
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            把旅行梦想<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              变成可执行计划
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            输入目的地和偏好，AI 在 30 秒内为你生成完整的每日行程、预算拆分和出行建议
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/planner"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              生成我的行程 →
            </Link>
            <Link
              href="/history"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-8 py-4 rounded-xl text-lg font-medium transition-colors"
            >
              查看历史计划
            </Link>
          </div>
        </div>
      </section>

      {/* Demo trips */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm text-gray-500 mb-8 uppercase tracking-widest">示例行程</p>
          <div className="grid md:grid-cols-3 gap-4">
            {demoTrips.map((trip, i) => (
              <div key={i} className="group relative bg-gray-900 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all hover:-translate-y-1">
                <div className={`h-2 bg-gradient-to-r ${trip.color}`} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-semibold">{trip.from} → {trip.to}</div>
                    <div className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">{trip.days}天</div>
                  </div>
                  <div className="text-sm text-gray-500 mb-4">预算 ¥{trip.budget.toLocaleString()}</div>
                  <div className="flex flex-wrap gap-2">
                    {trip.highlights.map((h, j) => (
                      <span key={j} className="text-xs bg-white/5 text-gray-400 px-2 py-1 rounded-lg">{h}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto pt-24">
          <p className="text-center text-sm text-gray-500 mb-3 uppercase tracking-widest">使用流程</p>
          <h2 className="text-3xl font-bold text-center mb-16">4 步生成专属行程</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-5 bg-gray-900/50 border border-white/5 rounded-2xl p-6">
                <div className="text-3xl font-bold text-white/10 shrink-0 leading-none">{step.num}</div>
                <div>
                  <div className="font-semibold text-white mb-1">{step.title}</div>
                  <div className="text-sm text-gray-400 leading-relaxed">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-blue-600/20 to-cyan-600/10 border border-blue-500/20 rounded-3xl p-12">
          <h2 className="text-3xl font-bold mb-4">准备好出发了吗？</h2>
          <p className="text-gray-400 mb-8">填写旅行信息，AI 帮你搞定剩下的一切</p>
          <Link
            href="/planner"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all hover:scale-105"
          >
            立即开始规划 →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-500/50 flex items-center justify-center text-xs font-bold text-white">T</div>
            <span>Tripwise</span>
          </div>
          <span>AI 驱动的智能旅游规划平台</span>
        </div>
      </footer>
    </main>
  )
}
