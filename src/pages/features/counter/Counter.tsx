import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Counter.module.css'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <main className={styles.counter}>
      <Link to="/" className={styles.backLink}>← Home</Link>
      <h1>Counter</h1>
      <button
        className={styles.counterBtn}
        onClick={() => setCount((c) => c + 1)}
      >
        Count is {count}
      </button>
    </main>
  )
}

export default Counter
