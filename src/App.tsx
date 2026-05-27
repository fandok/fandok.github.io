import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Counter from './pages/features/counter/Counter'
import WorkoutPlan from './pages/features/workout-plan/WorkoutPlan'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/counter" element={<Counter />} />
      <Route path="/workout-plan" element={<WorkoutPlan />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
