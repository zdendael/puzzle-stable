import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { useNavigate } from 'react-router-dom'
import { handleAuthError } from './utils/errors'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {}
})

export function useAuth() {
  return useContext(AuthContext)
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await Promise.race([
        supabase.auth.signInWithPassword({ 
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 15000)
        )
      ])

      if (error) {
        handleAuthError(error)
        return
      }

      if (!data.session) {
        throw new Error('Nepodařilo se získat session')
      }
    } catch (error) {
      handleAuthError(error as Error)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      const { error } = await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ])

      if (error) {
        handleAuthError(error)
        return
      }
      
      navigate('/login')
    } catch (error) {
      handleAuthError(error)
    } finally {
      setLoading(false)
    }
  }

  return { user, loading, signIn, signOut }
}