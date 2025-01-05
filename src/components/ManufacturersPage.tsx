<td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                     <button
                       onClick={() => navigate('/', { state: { manufacturer: manufacturer.name } })}
                       className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                       title="Zobrazit puzzle od tohoto výrobce"
                     >
                       {manufacturer.puzzleCount || 0}
                       <Search className="w-4 h-4" />
                     </button>
                   </td>