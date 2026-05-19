import { Link } from 'react-router-dom'
import './Home.css'

const features = [
  {
    path: '/counter',
    title: 'Counter',
    description: 'A simple stateful counter.',
  },
]

function Home() {
  return (
    <main id="home">
      <div id="home-header">
        <h1>fandok's lab</h1>
        <p>A collection of mini features and experiments.</p>
      </div>
      <ul className="feature-grid">
        {features.map((f) => (
          <li key={f.path}>
            <Link to={f.path} className="feature-card">
              <h2>{f.title}</h2>
              <p>{f.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default Home
