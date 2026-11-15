import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Counter from './pages/features/counter/Counter'
import WorkoutPlan from './pages/features/workout-plan/WorkoutPlan'
import Kyc from './pages/features/kyc/Kyc'
import NotFound from './pages/NotFound'

// Lazy-loaded so Chakra UI (used only on this page) stays out of the main bundle.
const PadelLevel = lazy(() => import('./pages/features/padel-level/PadelLevel'))

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/counter" element={<Counter />} />
      <Route path="/workout-plan" element={<WorkoutPlan />} />
      <Route path="/kyc" element={<Kyc />} />
      <Route path="/padel-level" element={<Suspense fallback={null}><PadelLevel /></Suspense>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
