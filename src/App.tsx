import { Routes, Route } from 'react-router-dom'
import { AuthContext, useAuthProvider } from './lib/auth'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { PuzzlesPage } from './pages/PuzzlesPage'
import { SessionsPage } from './pages/SessionsPage'
import { TagsPage } from './pages/TagsPage'
import { CollaborationsPage } from './pages/CollaborationsPage'
import { ManufacturersPage } from './pages/ManufacturersPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { ActivityLogPage } from './pages/ActivityLogPage'
import { SourcesPage } from './pages/SourcesPage'
import { WishListPage } from './pages/WishListPage'
import { StatisticsPage } from './pages/StatisticsPage'
import { EditionsPage } from './pages/EditionsPage'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthRequired } from './components/AuthRequired'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const auth = useAuthProvider()
  useTheme() // Inicializace tématu

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={auth}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <AuthRequired>
                <Layout />
              </AuthRequired>
            }
          >
            <Route index element={<PuzzlesPage />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="wishlist" element={<WishListPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="collaborations" element={<CollaborationsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="tags" element={<TagsPage />} />
            <Route path="manufacturers" element={<ManufacturersPage />} />
            <Route path="sources" element={<SourcesPage />} />
            <Route path="editions" element={<EditionsPage />} />
            <Route path="activity-log" element={<ActivityLogPage />} />
          </Route>
        </Routes>
      </AuthContext.Provider>
    </ErrorBoundary>
  )
}