import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ViewerProvider } from './lib/viewer'

const DesignLab = lazy(() => import('./lab/DesignLab'))
const DirectionA = lazy(() => import('./directions/a'))
const DirectionB = lazy(() => import('./directions/b'))
const DirectionC = lazy(() => import('./directions/c'))

export default function App() {
  return (
    <ViewerProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Navigate to="/design-lab" replace />} />
            <Route path="/design-lab" element={<DesignLab />} />
            <Route path="/a/*" element={<DirectionA />} />
            <Route path="/b/*" element={<DirectionB />} />
            <Route path="/c/*" element={<DirectionC />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ViewerProvider>
  )
}
