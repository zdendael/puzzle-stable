@@ .. @@
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getSources, deleteSource } from '../lib/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { Modal } from '../components/Modal'
import { SourceForm } from '../components/SourceForm'
import { ItemActions } from '../components/ItemActions'
import { Store, Globe, User, Building2, Plus, LayoutGrid, List, Handshake, Search } from 'lucide-react'

                             <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                              <button
                                onClick={() => navigate('/', { state: { source: source.id } })}
                                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                                title="Zobrazit puzzle z tohoto zdroje"
                              >
                                {source.puzzleCount || 0}
                                <Search className="w-4 h-4" />
                              </button>
                             </td>
                             {(type === 'eshop' || type === 'store') && (
                               <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                <button
                                  onClick={() => navigate('/', { state: { source: source.id, isCollaboration: true } })}
                                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                                  title="Zobrazit puzzle ze spolupráce"
                                >
                                  {source.collaborationCount || 0}
                                  <Search className="w-4 h-4" />
                                </button>
                               </td>
                             )}