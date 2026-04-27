'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function useAuth(redirectIfUnauthenticated = true) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      setLoading(false)
      if (!u && redirectIfUnauthenticated) {
        router.push('/login')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (!u && redirectIfUnauthenticated) {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, redirectIfUnauthenticated])

  return { user, loading }
}
