import { addDays } from 'date-fns'

// Funkce pro výpočet data Velikonoc (Meeus/Jones/Butcher algoritmus)
function getEasterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  
  return new Date(year, month - 1, day)
}

// Funkce pro získání všech státních svátků v daném roce
export function getCzechHolidays(year: number): Date[] {
  const holidays = [
    new Date(year, 0, 1),   // Nový rok
    new Date(year, 4, 1),   // Svátek práce
    new Date(year, 4, 8),   // Den vítězství
    new Date(year, 6, 5),   // Cyril a Metoděj
    new Date(year, 6, 6),   // Jan Hus
    new Date(year, 8, 28),  // Den české státnosti
    new Date(year, 9, 28),  // Den vzniku samostatného československého státu
    new Date(year, 10, 17), // Den boje za svobodu a demokracii
    new Date(year, 11, 24), // Štědrý den
    new Date(year, 11, 25), // 1. svátek vánoční
    new Date(year, 11, 26)  // 2. svátek vánoční
  ]

  // Přidání Velikonoc
  const easterSunday = getEasterSunday(year)
  const goodFriday = addDays(easterSunday, -2)
  const easterMonday = addDays(easterSunday, 1)
  
  holidays.push(goodFriday, easterMonday)

  return holidays.sort((a, b) => a.getTime() - b.getTime())
}

// Funkce pro získání názvu svátku pro dané datum
export function getHolidayName(date: Date): string | null {
  const holidayNames = new Map([
    ['1.1', 'Nový rok'],
    ['1.5', 'Svátek práce'],
    ['8.5', 'Den vítězství'],
    ['5.7', 'Den slovanských věrozvěstů Cyrila a Metoděje'],
    ['6.7', 'Den upálení mistra Jana Husa'],
    ['28.9', 'Den české státnosti'],
    ['28.10', 'Den vzniku samostatného československého státu'],
    ['17.11', 'Den boje za svobodu a demokracii'],
    ['24.12', 'Štědrý den'],
    ['25.12', '1. svátek vánoční'],
    ['26.12', '2. svátek vánoční']
  ])

  const holidays = getCzechHolidays(date.getFullYear())
  const isEasterFriday = holidays.some(holiday =>
    holiday.getDate() === date.getDate() &&
    holiday.getMonth() === date.getMonth() &&
    holiday === addDays(getEasterSunday(date.getFullYear()), -2)
  )
  
  const isEasterMonday = holidays.some(holiday =>
    holiday.getDate() === date.getDate() &&
    holiday.getMonth() === date.getMonth() &&
    holiday === addDays(getEasterSunday(date.getFullYear()), 1)
  )

  if (isEasterFriday) return 'Velký pátek'
  if (isEasterMonday) return 'Velikonoční pondělí'

  const key = `${date.getDate()}.${date.getMonth() + 1}`
  return holidayNames.get(key) || null
}

// Funkce pro kontrolu, zda je datum státním svátkem
export function isHoliday(date: Date): boolean {
  return getHolidayName(date) !== null
}