import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

// Funkce pro formátování čísel
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('cs-CZ', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

export function formatDate(date: Date | null | undefined) {
  if (!date) return ''
  return format(date, 'dd. MM. yyyy')
}

export function formatDateTime(date: Date | null | undefined) {
  if (!date) return ''
  return format(date, 'dd. MM. yyyy HH:mm', { locale: cs })
}

export function formatPuzzleCount(count: number) {
  if (count === 1) return '1'
  if (count >= 2 && count <= 4) return count.toString()
  return count.toString()
}

export function formatMinutes(minutes: number) {
  const days = Math.floor(minutes / (24 * 60))
  const hours = Math.floor((minutes % (24 * 60)) / 60)
  const remainingMinutes = minutes % 60

  const parts = []

  if (days > 0) {
    parts.push(`${days} ${days === 1 ? 'den' : days >= 2 && days <= 4 ? 'dny' : 'dní'}`)
  }
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hodina' : hours >= 2 && hours <= 4 ? 'hodiny' : 'hodin'}`)
  }
  if (remainingMinutes > 0) {
    parts.push(`${remainingMinutes} ${remainingMinutes === 1 ? 'minuta' : 
      remainingMinutes >= 2 && remainingMinutes <= 4 ? 'minuty' : 'minut'}`)
  }

  return parts.join(' a ')
}

export function formatDuration(minutes: number) {
  return formatMinutes(minutes)
}

export function formatShortDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  const parts = []

  if (hours > 0) {
    parts.push(`${hours} h`)
  }
  if (remainingMinutes > 0) {
    parts.push(`${remainingMinutes} min`)
  }

  return parts.join(' ')
}

// Funkce pro formátování procent
export function formatPercent(value: number): string {
  return `${Math.round(value * 100)} %`
}