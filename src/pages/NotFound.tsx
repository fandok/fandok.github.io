import { Link } from 'react-router-dom'
import './NotFound.css'

function NotFound() {
  return (
    <main id="not-found">
      <h1>404</h1>
      <p>This page doesn't exist.</p>
      <Link to="/">← Home</Link>
    </main>
  )
}

export default NotFound
