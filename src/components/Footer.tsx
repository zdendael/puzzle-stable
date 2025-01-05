import { Mail, Phone } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            © {currentYear} Puzzle kolekce Počmárané puzzlařky. Všechna práva vyhrazena.
          </div>
          <div className="flex flex-col md:flex-row items-center mt-4 md:mt-0 space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex items-center">
              <span className="font-medium mr-2">Vývojář:</span>
              Zdeněk Lehocký
            </div>
            <a 
              href="tel:+420770120288" 
              className="flex items-center hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <Phone className="w-4 h-4 mr-1" />
              +420 770 120 288
            </a>
            <a 
              href="mailto:zdenek@lehocky.cz"
              className="flex items-center hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <Mail className="w-4 h-4 mr-1" />
              zdenek@lehocky.cz
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}