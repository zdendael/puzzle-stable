import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPuzzles, getTags, getCategories, getManufacturers, getSources, getWishList } from '../lib/api'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import * as XLSX from 'xlsx'
import { COUNTRIES } from '../lib/countries'
import { formatDate, formatDateTime, formatShortDuration } from '../utils/format'
import toast from 'react-hot-toast'

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false)

  const { data: puzzles = [] } = useQuery({ queryKey: ['puzzles'], queryFn: getPuzzles })
  const { data: tags = [] } = useQuery({ queryKey: ['tags'], queryFn: getTags })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const { data: manufacturers = [] } = useQuery({ queryKey: ['manufacturers'], queryFn: getManufacturers })
  const { data: sources = [] } = useQuery({ queryKey: ['sources'], queryFn: getSources })
  const { data: wishlist = [] } = useQuery({ queryKey: ['wishlist'], queryFn: getWishList })

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return ''
    return format(new Date(date), 'd. MMMM yyyy', { locale: cs })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')}`
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      toast.loading('Připravuji export dat...')

      const wb = XLSX.utils.book_new()
      wb.Props = {
        Title: "Puzzle kolekce",
        Author: "Počmáraná puzzlařka",
        CreatedDate: new Date()
      }

      // List: Puzzle
      const puzzleData = puzzles.map(puzzle => ({
        'Název': puzzle.name,
        'Výrobce': `${COUNTRIES.find(c => c.code === puzzle.manufacturerCountryCode)?.flag || ''} ${puzzle.manufacturer}`,
        'Edice': puzzle.edition || '',
        'Počet dílků': puzzle.pieces,
        'Chybějící dílky': puzzle.missing_pieces,
        'Obtížnost': puzzle.difficulty === 'unrated' ? 'Nehodnoceno' : 
                     puzzle.difficulty === 'easy' ? 'Snadné' :
                     puzzle.difficulty === 'medium' ? 'Střední' : 'Těžké',
        'Hodnocení': puzzle.rating ? `${puzzle.rating} ⭐` : '',
        'Datum hodnocení': puzzle.rating_date ? formatDate(puzzle.rating_date) : '',
        'Předchozí hodnocení': puzzle.previous_rating || '',
        'Motivy': puzzle.categories.join(', '),
        'Štítky': puzzle.tags.join(', '),
        'Datum přidání': formatDate(puzzle.acquisition_date),
        'Datum nákupu': formatDate(puzzle.purchase_date),
        'Datum odebrání': formatDate(puzzle.removal_date),
        'Cena': puzzle.price > 0 ? `${puzzle.price} Kč` : '',
        'Zdroj': puzzle.source?.name || '',
        'Typ zdroje': puzzle.source?.type === 'eshop' ? 'E-shop' :
                      puzzle.source?.type === 'store' ? 'Kamenný obchod' :
                      puzzle.source?.type === 'person' ? 'Osoba' : 'Firma',
        'URL': puzzle.source?.url || '',
        'Dárek': puzzle.is_gift ? '✓' : '',
        'Spolupráce': puzzle.is_collaboration ? '✓' : '',
        'Vlastní nákup': puzzle.is_own_purchase ? '✓' : '',
        'Ve sbírce': puzzle.in_collection ? '✓' : '',
        'Poznámky': puzzle.notes || '',
        'Vytvořeno': formatDateTime(puzzle.created_at),
        'Poslední úprava': formatDateTime(puzzle.last_modified),
        'Upravená pole': puzzle.modified_fields?.join(', ') || ''
      }))

      const puzzleSheet = XLSX.utils.json_to_sheet(puzzleData, {
        header: Object.keys(puzzleData[0] || {}),
        skipHeader: false
      })

      // Nastavení šířky sloupců
      const puzzleColWidths = [
        { wch: 40 }, // Název
        { wch: 20 }, // Výrobce
        { wch: 20 }, // Edice
        { wch: 10 }, // Počet dílků
        { wch: 15 }, // Chybějící dílky
        { wch: 12 }, // Obtížnost
        { wch: 10 }, // Hodnocení
        { wch: 15 }, // Datum hodnocení
        { wch: 10 }, // Předchozí hodnocení
        { wch: 30 }, // Motivy
        { wch: 30 }, // Štítky
        { wch: 12 }, // Datum přidání
        { wch: 12 }, // Datum nákupu
        { wch: 12 }, // Datum odebrání
        { wch: 10 }, // Cena
        { wch: 20 }, // Zdroj
        { wch: 15 }, // Typ zdroje
        { wch: 30 }, // URL
        { wch: 5 },  // Dárek
        { wch: 5 },  // Spolupráce
        { wch: 5 },  // Vlastní nákup
        { wch: 5 },  // Ve sbírce
        { wch: 40 }, // Poznámky
        { wch: 20 }, // Vytvořeno
        { wch: 20 }, // Poslední úprava
        { wch: 30 }  // Upravená pole
      ]
      puzzleSheet['!cols'] = puzzleColWidths
      XLSX.utils.book_append_sheet(wb, puzzleSheet, 'Puzzle')

      // List: Skládání
      const sessionsData = puzzles.flatMap(puzzle => 
        (puzzle.sessions || []).map(session => ({
          'Puzzle': puzzle.name,
          'Výrobce': puzzle.manufacturer,
          'Edice': puzzle.edition || '',
          'Počet dílků': puzzle.pieces,
          'Začátek': formatDate(session.start_date),
          'Konec': formatDate(session.end_date),
          'Doba skládání': session.duration_minutes ? formatDuration(session.duration_minutes) : '',
          'Minut celkem': session.duration_minutes || '',
          'Minut na dílek': session.duration_minutes ? (session.duration_minutes / puzzle.pieces).toFixed(3) : '',
          'Poznámky': session.notes || ''
        }))
      ).sort((a, b) => new Date(b.Začátek).getTime() - new Date(a.Začátek).getTime())

      const sessionsSheet = XLSX.utils.json_to_sheet(sessionsData, {
        header: Object.keys(sessionsData[0] || {}),
        skipHeader: false
      })
      
      const sessionsColWidths = [
        { wch: 40 }, // Puzzle
        { wch: 20 }, // Výrobce
        { wch: 20 }, // Edice
        { wch: 10 }, // Počet dílků
        { wch: 12 }, // Začátek
        { wch: 12 }, // Konec
        { wch: 15 }, // Doba skládání
        { wch: 12 }, // Minut celkem
        { wch: 12 }, // Minut na dílek
        { wch: 40 }  // Poznámky
      ]
      sessionsSheet['!cols'] = sessionsColWidths
      XLSX.utils.book_append_sheet(wb, sessionsSheet, 'Skládání')

      // List: Nákupní seznam
      const wishlistData = wishlist.map(item => ({
        'Název': item.name,
        'Výrobce': item.manufacturer,
        'Počet dílků': item.pieces,
        'Cena': item.price > 0 ? `${item.price} Kč` : '',
        'Skladem': item.in_stock ? '✓' : '',
        'Priorita': item.priority === 'high' ? 'Vysoká' :
                   item.priority === 'medium' ? 'Střední' : 'Nízká',
        'Zdroj': item.source?.name || '',
        'Typ zdroje': item.source?.type === 'eshop' ? 'E-shop' :
                      item.source?.type === 'store' ? 'Kamenný obchod' :
                      item.source?.type === 'person' ? 'Osoba' : 'Firma',
        'URL': item.url || '',
        'Motivy': item.categories.join(', '),
        'Štítky': item.tags.join(', '),
        'Poznámky': item.notes || '',
        'Vytvořeno': formatDateTime(item.created_at),
        'Rezervováno': item.reservation ? `${item.reservation.reserver_name} (${formatDateTime(item.reservation.created_at)})` : ''
      }))

      const wishlistSheet = XLSX.utils.json_to_sheet(wishlistData, {
        header: Object.keys(wishlistData[0] || {}),
        skipHeader: false
      })
      
      const wishlistColWidths = [
        { wch: 40 }, // Název
        { wch: 20 }, // Výrobce
        { wch: 10 }, // Počet dílků
        { wch: 10 }, // Cena
        { wch: 8 },  // Skladem
        { wch: 10 }, // Priorita
        { wch: 20 }, // Zdroj
        { wch: 15 }, // Typ zdroje
        { wch: 30 }, // URL
        { wch: 30 }, // Motivy
        { wch: 30 }, // Štítky
        { wch: 40 }, // Poznámky
        { wch: 20 }, // Vytvořeno
        { wch: 30 }  // Rezervováno
      ]
      wishlistSheet['!cols'] = wishlistColWidths
      XLSX.utils.book_append_sheet(wb, wishlistSheet, 'Nákupní seznam')

      // List: Výrobci
      const manufacturersData = manufacturers.map(manufacturer => ({
        'Název': manufacturer.name,
        'Vlajka': COUNTRIES.find(c => c.code === manufacturer.countryCode)?.flag || '',
        'Země': manufacturer.country,
        'Kód země': manufacturer.countryCode,
        'Počet puzzlí': manufacturer.puzzleCount || 0
      }))

      const manufacturersSheet = XLSX.utils.json_to_sheet(manufacturersData, {
        header: Object.keys(manufacturersData[0] || {}),
        skipHeader: false
      })
      
      const manufacturersColWidths = [
        { wch: 30 }, // Název
        { wch: 5 },  // Vlajka
        { wch: 20 }, // Země
        { wch: 10 }, // Kód země
        { wch: 12 }  // Počet puzzlí
      ]
      manufacturersSheet['!cols'] = manufacturersColWidths
      XLSX.utils.book_append_sheet(wb, manufacturersSheet, 'Výrobci')

      // List: Motivy
      const categoriesData = categories.map(category => ({
        'Název': category.name,
        'Emoji': category.emoji,
        'Počet puzzlí': category.puzzleCount || 0
      }))

      const categoriesSheet = XLSX.utils.json_to_sheet(categoriesData, {
        header: Object.keys(categoriesData[0] || {}),
        skipHeader: false
      })
      
      const categoriesColWidths = [
        { wch: 30 }, // Název
        { wch: 5 },  // Emoji
        { wch: 12 }  // Počet puzzlí
      ]
      categoriesSheet['!cols'] = categoriesColWidths
      XLSX.utils.book_append_sheet(wb, categoriesSheet, 'Motivy')

      // List: Štítky
      const tagsData = tags.map(tag => ({
        'Název': tag.name,
        'Emoji': tag.emoji,
        'Barva': tag.color,
        'Počet puzzlí': tag.puzzleCount || 0
      }))

      const tagsSheet = XLSX.utils.json_to_sheet(tagsData, {
        header: Object.keys(tagsData[0] || {}),
        skipHeader: false
      })
      
      const tagsColWidths = [
        { wch: 30 }, // Název
        { wch: 5 },  // Emoji
        { wch: 10 }, // Barva
        { wch: 12 }  // Počet puzzlí
      ]
      tagsSheet['!cols'] = tagsColWidths
      XLSX.utils.book_append_sheet(wb, tagsSheet, 'Štítky')

      // List: Zdroje
      const sourcesData = sources.map(source => ({
        'Název': source.name,
        'Typ': source.type === 'eshop' ? 'E-shop' :
              source.type === 'store' ? 'Kamenný obchod' :
              source.type === 'person' ? 'Osoba' : 'Firma',
        'URL': source.url || '',
        'Adresa': source.address || '',
        'Počet puzzlí': source.puzzleCount || 0,
        'Spolupráce': source.isCollaboration ? '✓' : '',
        'Začátek spolupráce': source.collaborationStart ? formatDate(new Date(source.collaborationStart)) : '',
        'Konec spolupráce': source.collaborationEnd ? formatDate(new Date(source.collaborationEnd)) : ''
      }))

      const sourcesSheet = XLSX.utils.json_to_sheet(sourcesData, {
        header: Object.keys(sourcesData[0] || {}),
        skipHeader: false
      })
      
      const sourcesColWidths = [
        { wch: 30 }, // Název
        { wch: 15 }, // Typ
        { wch: 30 }, // URL
        { wch: 40 }, // Adresa
        { wch: 12 }, // Počet puzzlí
        { wch: 5 },  // Spolupráce
        { wch: 15 }, // Začátek spolupráce
        { wch: 15 }  // Konec spolupráce
      ]
      sourcesSheet['!cols'] = sourcesColWidths
      XLSX.utils.book_append_sheet(wb, sourcesSheet, 'Zdroje')

      // List: Statistiky
      const totalPuzzles = puzzles.length
      const inCollection = puzzles.filter(p => p.in_collection).length
      const removed = puzzles.filter(p => !p.in_collection).length
      const totalPieces = puzzles.reduce((sum, p) => sum + p.pieces, 0)
      const averagePieces = Math.round(totalPieces / totalPuzzles)
      const allSessions = puzzles.flatMap(p => p.sessions || [])
      const totalSessions = allSessions.length
      const totalCompletionTime = allSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
      const averageCompletionTime = totalSessions > 0 ? Math.round(totalCompletionTime / totalSessions) : 0
      const ratedPuzzles = puzzles.filter(p => p.rating).length
      const averageRating = ratedPuzzles > 0 
        ? Math.round(puzzles.reduce((sum, p) => sum + (p.rating || 0), 0) / ratedPuzzles * 10) / 10
        : 0

      const statisticsData = [
        { 'Statistika': 'Celkem puzzlí', 'Hodnota': totalPuzzles },
        { 'Statistika': 'Ve sbírce', 'Hodnota': inCollection },
        { 'Statistika': 'Vyřazeno', 'Hodnota': removed },
        { 'Statistika': 'Celkem dílků', 'Hodnota': totalPieces },
        { 'Statistika': 'Průměrně dílků', 'Hodnota': averagePieces },
        { 'Statistika': 'Počet skládání', 'Hodnota': totalSessions },
        { 'Statistika': 'Průměrná doba skládání', 'Hodnota': `${formatDuration(averageCompletionTime)}` },
        { 'Statistika': 'Celkový čas skládání', 'Hodnota': `${formatDuration(totalCompletionTime)}` },
        { 'Statistika': 'Průměrné hodnocení', 'Hodnota': averageRating ? `${averageRating} ⭐` : 'Nehodnoceno' },
        { 'Statistika': 'Hodnoceno puzzlí', 'Hodnota': `${ratedPuzzles} (${Math.round(ratedPuzzles / totalPuzzles * 100)}%)` }
      ]

      const statisticsSheet = XLSX.utils.json_to_sheet(statisticsData, {
        header: Object.keys(statisticsData[0] || {}),
        skipHeader: false
      })
      
      const statisticsColWidths = [
        { wch: 30 }, // Statistika
        { wch: 20 }  // Hodnota
      ]
      statisticsSheet['!cols'] = statisticsColWidths
      XLSX.utils.book_append_sheet(wb, statisticsSheet, 'Statistiky')

      // Nastavení šířky sloupců pro všechny listy
      const setColumnWidths = (worksheet: XLSX.WorkSheet) => {
        const columnWidths = Object.keys(worksheet).reduce((acc: { [key: string]: number }, key) => {
          if (key.startsWith('!')) return acc
          const col = key.replace(/[0-9]/g, '')
          const value = worksheet[key].v?.toString() || ''
          acc[col] = Math.max(acc[col] || 0, value.length + 2)
          return acc
        }, {})
        worksheet['!cols'] = Object.values(columnWidths).map(width => ({ width }))
      }

      wb.SheetNames.forEach(name => {
        setColumnWidths(wb.Sheets[name])
      })

      // Export souboru
      const fileName = `puzzle-kolekce_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
      XLSX.writeFile(wb, fileName, {
        bookType: 'xlsx',
        bookSST: false,
        type: 'binary',
        Props: {
          Title: "Puzzle kolekce",
          Subject: "Export dat z aplikace Puzzle kolekce",
          Author: "Počmáraná puzzlařka",
          Manager: "",
          Company: "",
          Category: "Puzzle",
          Keywords: "puzzle, statistiky, sbírka",
          Comments: "Automaticky vygenerováno z aplikace Puzzle kolekce",
          LastAuthor: "Puzzle kolekce",
          CreatedDate: new Date()
        }
      })
      toast.success('Data byla úspěšně exportována')
    } catch (error) {
      console.error('Chyba při exportu:', error)
      toast.error('Nepodařilo se exportovat data')
    } finally {
      setIsExporting(false)
      toast.dismiss()
    }
  }

  return (
    <span
      onClick={handleExport}
      className={`${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      Exportovat data
    </span>
  )
}