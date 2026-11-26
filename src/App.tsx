import { lazy, Suspense, type ComponentType } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Counter from './pages/features/counter/Counter'
import WorkoutPlan from './pages/features/workout-plan/WorkoutPlan'
import Kyc from './pages/features/kyc/Kyc'
// Not lazy-loaded: the offline service worker only pre-caches the assets linked from index.html.
import LombaSihir from './pages/features/lomba-sihir/LombaSihir'
import NotFound from './pages/NotFound'

// If a lazy chunk fails to load (e.g. a redeploy renamed it), reload once to pick up the new build.
function lazyWithReload<T extends ComponentType>(load: () => Promise<{ default: T }>) {
  return lazy(() =>
    load().catch((err) => {
      if (sessionStorage.getItem('chunk-reload') !== '1') {
        sessionStorage.setItem('chunk-reload', '1')
        window.location.reload()
        return new Promise<never>(() => {})
      }
      throw err
    }).then((mod) => {
      sessionStorage.removeItem('chunk-reload')
      return mod
    }),
  )
}

// Lazy-loaded so Chakra UI (used only on this page) stays out of the main bundle.
const PadelLevel = lazyWithReload(() => import('./pages/features/padel-level/PadelLevel'))
// Lazy-loaded so TanStack Table and the roster data stay out of the main bundle.
const SeaKickoffRosters = lazyWithReload(
  () => import('./pages/features/sea-kickoff-rosters/SeaKickoffRosters'),
)

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/counter" element={<Counter />} />
      <Route path="/workout-plan" element={<WorkoutPlan />} />
      <Route path="/kyc" element={<Kyc />} />
      <Route path="/lomba-sihir" element={<LombaSihir />} />
      <Route path="/padel-level" element={<Suspense fallback={null}><PadelLevel /></Suspense>} />
      <Route path="/sea-kickoff-rosters" element={<Suspense fallback={null}><SeaKickoffRosters /></Suspense>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
