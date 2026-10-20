import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import Drops from './pages/Drops'
import Submit from './pages/Submit'

const Exhibition = lazy(() => import('./pages/Exhibition'))

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="grain min-h-dvh bg-void">
      <Suspense fallback={<div className="fixed inset-0 bg-void" />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/ex/:slug" element={<Exhibition />} />
          <Route path="/drops" element={<Drops />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </Suspense>
    </div>
  )
}
