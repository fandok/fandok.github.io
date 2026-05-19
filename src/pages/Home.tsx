import { Link } from 'react-router-dom'
import styles from './Home.module.css'

const features = [
  {
    path: '/counter',
    title: 'Counter',
    description: 'A simple stateful counter.',
  },
]

function Home() {
  return (
    <main className={styles.home}>
      <div className={styles.header}>
        <h1>fandok's lab</h1>
        <p>A collection of mini features and experiments.</p>
      </div>
      <ul className={styles.featureGrid}>
        {features.map((f) => (
          <li key={f.path}>
            <Link to={f.path} className={styles.featureCard}>
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
