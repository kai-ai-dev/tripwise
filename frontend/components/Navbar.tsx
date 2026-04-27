'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-xs font-bold">T</div>
        <span className="font-semibold tracking-tight">Tripwise</span>
      </Link>

      <div className="flex items-center gap-4">
        {!loading && (
          user ? (
            <>
              <Link
                href="/history"
                className={`text-sm transition-colors ${pathname === '/history' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              >
                我的行程
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 hidden sm:block">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
                >
                  退出
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/history" className="text-sm text-gray-400 hover:text-white transition-colors">
                我的行程
              </Link>
              <Link
                href="/login"
                className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                登录 / 注册
              </Link>
            </>
          )
        )}
      </div>
    </nav>
  )
}
