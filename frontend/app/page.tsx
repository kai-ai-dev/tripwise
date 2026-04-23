import Link from 'next/link'
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Tripwise</h1>
        <p className="text-xl text-gray-500 mb-8">输入目的地和偏好，AI 帮你生成可执行的旅行计划</p>
        <Link href="/planner" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-blue-700 transition-colors">开始规划 →</Link>
      </div>
    </main>
  )
}
