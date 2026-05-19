import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Counter from './pages/features/counter/Counter'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/counter" element={<Counter />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
