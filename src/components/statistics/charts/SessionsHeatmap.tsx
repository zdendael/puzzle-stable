import { useMemo, useState } from 'react'
import { format, eachDayOfInterval, startOfMonth, endOfMonth, startOfYear, min, getYear } from 'date-fns'
import { cs } from 'date-fns/locale'
import type { Puzzle } from '../../../lib/types'
import { isHoliday, getHolidayName } from '../../../utils/holidays'
import { InfoTooltip } from '../../InfoTooltip' 

interface HoveredCell {
  row: number;
  col: number;
}

interface SessionsHeatmapProps {
  puzzles: Puzzle[]
}

export function SessionsHeatmap({ puzzles }: SessionsHeatmapProps) {
  const [showAllHistory, setShowAllHistory] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null)

  // Pomocné funkce pro práci s daty
  const isLeapYear = (year: number) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
  }

  const isLeapDay = (date: Date) => {
    return date.getMonth() === 1 && date.getDate() === 29
  }

  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6 // 0 = neděle, 6 = sobota
  }

  const data = useMemo(() => {
    const sessions = puzzles
      .flatMap(p => p.sessions || [])
      .filter(s => s.duration_minutes && s.start_date)
      .map(s => {
        const date = new Date(s.start_date)
        return {
          date,
          year: date.getFullYear(),
          isLeapDay: date.getMonth() === 1 && date.getDate() === 29
        }
      })

    if (!sessions.length) return []

    const currentYear = new Date().getFullYear()
    const endDate = new Date()
    const startDate = showAllHistory 
      ? min(sessions.map(s => s.date)) // Začátek od prvního skládání
      : new Date(currentYear, 0, 1) // Začátek aktuálního roku

    const dayMap = new Map<string, {
      count: number
      year: number
    }[]>()

    sessions
      .filter(session => showAllHistory || session.year === currentYear)
      .forEach(session => {
        // Zachováme 29. únor jako samostatný klíč
        const key = session.isLeapDay ? '02-29' : format(session.date, 'MM-dd')
        const year = session.year
      
        if (!dayMap.has(key)) {
          dayMap.set(key, [])
        }
      
        const yearData = dayMap.get(key)!.find(d => d.year === year)
        if (yearData) {
          yearData.count++
        } else {
          dayMap.get(key)!.push({ year, count: 1 })
        }
      })

    // Vytvoříme pole měsíců s daty
    const months = []
    let currentDate = startOfMonth(startDate)

    // Vytvoříme mapu pro agregaci dat podle měsíce
    const monthlyData = new Map<string, {
      month: string
      monthKey: string
      days: {
        date: Date
        yearData: { year: number; count: number }[]
      }[]
    }>()

    while (currentDate <= endDate) {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      let days = eachDayOfInterval({ start: monthStart, end: monthEnd })

      // Pro únor vždy přidáme 29. den
      if (monthStart.getMonth() === 1) {
        const feb29 = new Date(monthStart.getFullYear(), 1, 29)
        if (!days.find(d => d.getDate() === 29)) {
          days = [...days, feb29]
        }
        // Seřadíme dny
        days.sort((a, b) => a.getTime() - b.getTime())
      }

      const monthKey = format(monthStart, 'MM') // Klíč pouze podle měsíce

      const monthData = {
        month: format(monthStart, 'LLLL', { locale: cs }),
        monthKey,
        days: days.map(day => {
          // Pro 29. únor použijeme speciální klíč
          const key = isLeapDay(day) ? '02-29' : format(day, 'MM-dd')
          const yearData = dayMap.get(key) || []
          
          return {
            date: day,
            yearData: yearData.sort((a, b) => b.year - a.year),
            isLeapDay: isLeapDay(day)
          }
        })
      }

      // Ukládáme data pouze pokud ještě nemáme tento měsíc
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, monthData)
      }
      
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    }

    // Převedeme mapu na pole a seřadíme podle čísla měsíce
    return Array.from(monthlyData.values()).sort((a, b) => {
      const monthA = parseInt(a.monthKey)
      const monthB = parseInt(b.monthKey)
      return monthA - monthB
    })
  }, [puzzles, showAllHistory])

  // Funkce pro výpočet maximálního počtu skládání
  const getMaxCount = (yearData: { year: number; count: number }[]) => {
    const currentYear = new Date().getFullYear()
    if (!showAllHistory) {
      const currentYearData = yearData.find(d => d.year === currentYear)
      return currentYearData?.count || 0
    }
    return yearData.reduce((sum, d) => sum + d.count, 0)
  }

  const maxSessionCount = useMemo(() => {
    const allCounts = data.flatMap(month =>
      month.days.map(day => getMaxCount(day.yearData))
    )
    return Math.max(...allCounts, 3) // Minimálně 3, aby fungovaly všechny úrovně
  }, [data, showAllHistory])

  const getCurrentYearColor = (count: number, maxCount: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
    
    // Rozdělení na třetiny
    const levelSize = maxCount / 3
    const level = Math.min(Math.ceil(count / levelSize), 3)

    switch (level) {
      case 1: return 'bg-blue-200 dark:bg-blue-900/30'
      case 2: return 'bg-blue-300 dark:bg-blue-900/60'
      case 3: return 'bg-blue-400 dark:bg-blue-900/90'
      default: return 'bg-blue-200 dark:bg-blue-900/30'
    }
  }

  const getHistoryColor = (count: number, maxCount: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
    
    // Rozdělení na třetiny
    const levelSize = maxCount / 3
    const level = Math.min(Math.ceil(count / levelSize), 3)

    switch (level) {
      case 1: return 'bg-blue-300 dark:bg-blue-900/30'
      case 2: return 'bg-purple-400 dark:bg-purple-900/60'
      case 3: return 'bg-red-500 dark:bg-red-900/90'
      default: return 'bg-blue-300 dark:bg-blue-900/30'
    }
  }

  const getColor = (yearData: { year: number; count: number }[]) => {
    if (!yearData.length) return 'bg-gray-100 dark:bg-gray-800'

    const currentYear = new Date().getFullYear()

    if (!showAllHistory) {
      const currentYearCount = yearData.find(d => d.year === currentYear)?.count || 0
      return getCurrentYearColor(currentYearCount, maxSessionCount)
    }

    const totalCount = yearData.reduce((sum, d) => sum + d.count, 0)
    return getHistoryColor(totalCount, maxSessionCount)
  }

  const getWeekendStyle = (date: Date) => {
    return ''
  }

  const getCurrentDayStyle = (date: Date) => {
    const today = new Date()
    return today.getDate() === date.getDate() && 
           today.getMonth() === date.getMonth() && 
           today.getFullYear() === date.getFullYear()
      ? 'ring-2 ring-indigo-500 dark:ring-indigo-400'
      : ''
  }

  const getTooltipText = (yearData: { year: number; count: number }[], date: Date) => {
    const noSessionsText = 'Žádné skládání'

    if (!showAllHistory) {
      const currentYear = new Date().getFullYear()
      const currentYearCount = yearData.find(d => d.year === currentYear)?.count || 0
      return currentYearCount > 0 ? `Celkem: ${currentYearCount} skládání` : noSessionsText
    }

    // Spočítáme skutečný počet skládání v daný den
    const totalCount = yearData.reduce((sum, data) => sum + data.count, 0)
    const firstYear = Math.min(...yearData.map(d => d.year))
    const lastYear = Math.max(...yearData.map(d => d.year))
    const years = yearData.map(d => d.year).sort((a, b) => a - b)
    const yearDetails = years.map(year => `${year}: ${yearData.find(d => d.year === year)?.count || 0} skládání`).join('\n')

    // Speciální text pro 29. únor
    if (isLeapDay(date)) {
      const leapYears = years.filter(year => isLeapYear(year))
      
      return `Celkem: ${totalCount || 0} skládání\n` +
             (leapYears.length > 0 ? `Přestupné roky: ${leapYears.join(', ')}\n\n` : '\n') +
             'Detaily po letech:\n' + yearDetails
    }

    // Standardní text pro ostatní dny
    return totalCount > 0
      ? `Celkem: ${totalCount} skládání\n\n` + 'Detaily po letech:\n' + yearDetails
      : noSessionsText
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text={`Heatmapa zobrazuje počet dokončených skládání v jednotlivých dnech ${showAllHistory ? 'za celou historii' : 'za aktuální rok'}. Tmavší barva znamená více dokončených puzzlí v daný den.`} />
        <button
          onClick={() => setShowAllHistory(!showAllHistory)}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
        >
          {showAllHistory ? 'Zobrazit aktuální rok' : 'Zobrazit celou historii'}
        </button>
      </div>

      <div className="space-y-1">
        {/* Popisky dnů */}
        <div className="flex items-center gap-4">
          <div className="w-24 shrink-0" />
          <div className="grid grid-cols-[repeat(31,1fr)] gap-[2px] flex-1 max-w-[calc(100%-6rem)]">
            {Array.from({ length: 31 }, (_, i) => (
              <div 
                key={i}
                className={`text-center text-xs mb-1 transition-colors ${
                  hoveredCell?.col === i
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {data.map((month, rowIndex) => (
          <div 
            key={month.monthKey} 
            className="relative flex items-center gap-4"
          >
            <div className={`w-24 shrink-0 text-sm text-right font-medium whitespace-nowrap transition-colors ${
              hoveredCell?.row === rowIndex
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {month.month}
            </div>
            <div className="relative grid grid-cols-[repeat(31,1fr)] gap-[2px] flex-1 max-w-[calc(100%-6rem)]">
              {hoveredCell?.row === rowIndex && (
                <div 
                  className="absolute bg-indigo-500/20 dark:bg-indigo-400/20 pointer-events-none"
                  style={{
                    left: 0,
                    width: `${((hoveredCell?.col || 0) + 1) * (100/31)}%`,
                    top: 0,
                    bottom: 0
                  }}
                />
              )}
              {month.days.map((day, colIndex) => (
                <div
                  key={day.date.getTime()}
                  className={`w-full pb-[100%] rounded-[1px] relative hover:ring-2 hover:ring-indigo-500/50 dark:hover:ring-indigo-400/50 transition-all ${
                    getColor(day.yearData)} ${getWeekendStyle(day.date)} ${getCurrentDayStyle(day.date)} ${
                    day.isLeapDay ? 'ring-1 ring-dotted ring-indigo-500/50 dark:ring-indigo-400/50' : ''
                  }`}
                  style={{
                    position: 'relative',
                    zIndex: hoveredCell?.row === rowIndex || hoveredCell?.col === colIndex ? 2 : 1
                  }}
                  title={`${format(day.date, 'd. MM.', { locale: cs })}${isHoliday(day.date) ? ` - ${getHolidayName(day.date)}` : ''}\n${getTooltipText(day.yearData, day.date)}`}
                  onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {((hoveredCell?.col === colIndex && rowIndex <= hoveredCell.row) ||
                    (hoveredCell?.row === rowIndex && colIndex <= hoveredCell.col)) && (
                    <div 
                      className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-400/20 pointer-events-none"
                      style={{
                        zIndex: 3
                      }}
                    />
                  )}
                  {!showAllHistory && isWeekend(day.date) && (
                    <div className="absolute inset-0 flex items-center justify-center text-[8px] font-medium text-gray-400 dark:text-gray-500">
                      {day.date.getDay() === 6 ? 'S' : 'N'}
                    </div>
                  )}
                  {isHoliday(day.date) && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900/50 dark:bg-gray-100/50" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        {!showAllHistory && (
          <>
            S = sobota, N = neděle
            <span className="mx-2">•</span>
            <span className="inline-block w-3 h-[2px] bg-gray-900/50 dark:bg-gray-100/50 align-middle"></span> = státní svátek
          </>
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-8">
        <div className="text-xs text-gray-500 dark:text-gray-400">Méně</div>
        <div className="flex gap-[2px]">
          {/* Dynamická legenda podle maximálního počtu */}
          {!showAllHistory ? (
            // Legenda pro aktuální rok
            <>
              <div className="w-4 h-4 rounded-[1px] bg-blue-200 dark:bg-blue-900/30"
                   title={`1-${Math.floor(maxSessionCount/3)} skládání`} />
              <div className="w-4 h-4 rounded-[1px] bg-blue-300 dark:bg-blue-900/60"
                   title={`${Math.floor(maxSessionCount/3)+1}-${Math.floor(2*maxSessionCount/3)} skládání`} />
              <div className="w-4 h-4 rounded-[1px] bg-blue-400 dark:bg-blue-900/90"
                   title={`${Math.floor(2*maxSessionCount/3)+1}+ skládání`} />
            </>
          ) : (
            // Legenda pro historii
            <>
              <div className="w-4 h-4 rounded-[1px] bg-blue-300 dark:bg-blue-900/30"
                   title={`1-${Math.floor(maxSessionCount/3)} skládání`} />
              <div className="w-4 h-4 rounded-[1px] bg-purple-400 dark:bg-purple-900/60"
                   title={`${Math.floor(maxSessionCount/3)+1}-${Math.floor(2*maxSessionCount/3)} skládání`} />
              <div className="w-4 h-4 rounded-[1px] bg-red-500 dark:bg-red-900/90"
                   title={`${Math.floor(2*maxSessionCount/3)+1}+ skládání`} />
            </>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Více</div>
      </div>
    </div>
  )
}