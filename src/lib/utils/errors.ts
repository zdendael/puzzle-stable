import { AuthError } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

export function handleAuthError(error: Error | AuthError) {
  console.error('Auth error:', error)

  // Kontrola prázdné chyby
  if (!error || (typeof error === 'object' && Object.keys(error).length === 0)) {
    toast.error('Nepodařilo se připojit k serveru')
    return
  }

  // Zpracování AuthRetryableFetchError
  if (error.name === 'AuthRetryableFetchError') {
    toast.error('Nepodařilo se připojit k serveru. Zkuste to prosím znovu.')
    return
  }

  // Zpracování timeoutu
  if (error.message === 'Timeout') {
    toast.error('Připojení vypršelo. Zkuste to prosím znovu.')
    return
  }

  // Zpracování síťových chyb
  if (error.message?.includes('Failed to fetch') || 
      error.message?.includes('Network Error') ||
      error.message?.includes('NetworkError')) {
    toast.error('Nepodařilo se připojit k serveru. Zkontrolujte připojení k internetu.')
    return
  }

  if (error instanceof AuthError) {
    switch (error.status) {
      case 400:
        toast.error('Nesprávné přihlašovací údaje')
        break
      case 401:
        toast.error('Platnost přihlášení vypršela. Přihlaste se prosím znovu.')
        setTimeout(() => window.location.href = '/login', 1500)
        break
      case 422:
        toast.error('Neplatný formát e-mailu nebo hesla')
        break
      case 429:
        toast.error('Příliš mnoho pokusů o přihlášení. Zkuste to prosím později.')
        break
      default:
        toast.error('Chyba při přihlašování')
    }
    return
  }
  
  if (error.message) {
    toast.error(error.message)
  } else {
    toast.error('Neočekávaná chyba při přihlašování')
  }
}