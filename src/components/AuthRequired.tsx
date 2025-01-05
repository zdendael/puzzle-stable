import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useQuery } from '@tanstack/react-query'
import { getSettings } from '../lib/api/settings'
import { LoadingSpinner } from './LoadingSpinner'

interface AuthRequiredProps {
  children: React.ReactNode
}

export function AuthRequired({ children }: AuthRequiredProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    enabled: location.pathname === '/wishlist'
  })

  if (loading || (location.pathname === '/wishlist' && isSettingsLoading)) {
    return <LoadingSpinner />
  }

  // Pokud je to wishlist a je veřejný, povolit přístup
  if (location.pathname === '/wishlist' && settings?.public_wishlist) {
    return <>{children}</>
  }

  // Pro ostatní stránky nebo neveřejný wishlist vyžadovat přihlášení
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}