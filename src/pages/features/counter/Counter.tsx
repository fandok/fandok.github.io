import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Counter.css'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <main id="counter">
      <Link to="/" className="back-link">← Home</Link>
      <h1>Counter</h1>
      <button
        className="counter-btn"
        onClick={() => setCount((c) => c + 1)}
      >
        Count is {count}
      </button>
    </main>
  )
}

export default Counter
