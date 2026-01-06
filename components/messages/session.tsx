'use client'
import { useContext, createContext, useEffect, useState, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client';

/**
 * @type {React.Context<Session | null>}
 */
const SessionContext = createContext<Session | null>(null)

interface UserContextProps {
  children: ReactNode; 
}

const UserContext = ({ children }: UserContextProps) => {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  )
}

const useUser = () => {
  const session = useContext(SessionContext)
  return session?.user
}

export { useUser }

export default UserContext
