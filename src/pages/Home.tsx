import { Link } from 'react-router-dom'
import styles from './Home.module.css'

const features = [
  {
    path: '/counter',
    title: 'Counter',
    description: 'A simple stateful counter.',
  },
  {
    path: '/workout-plan',
    title: 'Workout Plan',
    description: '15-week training plan for a 10km race.',
  },
  {
    path: '/kyc',
    title: 'Know Your Colleague',
    description: 'Padel, games, travel, series, and family — a KYC deck.',
  },
  {
    path: '/padel-level',
    title: 'Padel Level Check',
    description: 'Self-assess your padel level (1.0–5.5) and share the result.',
  },
  {
    path: '/lomba-sihir',
    title: 'Lomba Sihir Setlist',
    description: 'Likely concert setlist with your own lyrics, saved for offline.',
  },
  {
    path: '/sea-kickoff-rosters',
    title: 'Valorant Indo Roster List',
    description: 'Indonesian Valorant Riot IDs cross-checked against vlr.gg and Liquipedia.',
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
