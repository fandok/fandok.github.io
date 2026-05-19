import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

function NotFound() {
  return (
    <main className={styles.notFound}>
      <h1>404</h1>
      <p>This page doesn't exist.</p>
      <Link to="/">← Home</Link>
    </main>
  )
}

export default NotFound
