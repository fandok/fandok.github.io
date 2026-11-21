import { useEffect, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import styles from './LombaSihir.module.css'

type Album = 'OJ3P' | 'SDdUD'
type Chance = 'seen' | 'possible' | 'wildcard'
type Song = { id: string; title: string; album: Album; chance: Chance; note?: string }

const ALBUMS: Record<Album, string> = {
  OJ3P: 'Obrolan Jam 3 Pagi (2025)',
  SDdUD: 'Selamat Datang di Ujung Dunia (2021)',
}

const CHANCE_LABEL: Record<Chance, string> = {
  seen: 'Played in 2025 shows',
  possible: 'Possible',
  wildcard: 'Wildcard',
}

// Last checked: Nov 2026.
// The order follows the band's late-2025 shows (CRSL Land Festival, Synchronize Festival).
// Those setlists are crowd-sourced on setlist.fm, so treat this list as a guess.
const LIKELY: Song[] = [
  { id: 'misteri', title: 'Misteri', album: 'OJ3P', chance: 'seen', note: 'Opened Synchronize 2025' },
  { id: 'menit-tambahan', title: 'Menit Tambahan', album: 'OJ3P', chance: 'seen' },
  { id: 'hati-dan-paru-paru', title: 'Hati dan Paru-Paru', album: 'SDdUD', chance: 'seen', note: 'Frequent opener' },
  { id: 'satu-jam-terpanjang', title: 'Satu Jam Terpanjang', album: 'OJ3P', chance: 'seen' },
  { id: 'tak-ada-waktu-tepat', title: 'Tak Ada Waktu Tepat Untuk Berita Buruk', album: 'OJ3P', chance: 'possible' },
  { id: 'uangku', title: 'Uangku2x, Uangmu1x', album: 'OJ3P', chance: 'seen', note: 'Debuted live at CRSL 2025' },
  { id: 'nirrrlaba', title: 'Nirrrlaba', album: 'SDdUD', chance: 'seen' },
  { id: 'sofa', title: 'Sofa', album: 'OJ3P', chance: 'seen' },
  { id: 'andai-saja', title: 'Andai Saja', album: 'OJ3P', chance: 'seen', note: 'Focus track of the new album' },
  { id: 'omamama', title: 'Omamama', album: 'OJ3P', chance: 'seen', note: 'Debuted live at CRSL 2025' },
  { id: 'apa-ada-asmara', title: 'Apa Ada Asmara', album: 'SDdUD', chance: 'possible' },
  { id: 'bisa-bisanya', title: 'Bisa-bisanya', album: 'OJ3P', chance: 'possible' },
  { id: 'dalam-hidupku', title: '...Dalam Hidupku', album: 'OJ3P', chance: 'possible' },
  { id: 'ribuan-memori', title: 'Ribuan Memori', album: 'OJ3P', chance: 'possible' },
  { id: 'selamanya', title: 'Selamanya', album: 'OJ3P', chance: 'seen' },
  { id: 'semua-orang', title: 'Semua Orang Pernah Sakit Hati', album: 'SDdUD', chance: 'seen', note: 'Usually near the end' },
  { id: 'lomba-sihir', title: 'Lomba Sihir!', album: 'OJ3P', chance: 'seen', note: 'Closed Synchronize 2025' },
]

const WILDCARDS: Song[] = [
  { id: 'mungkin-takut-perubahan', title: 'Mungkin Takut Perubahan', album: 'SDdUD', chance: 'wildcard' },
  { id: 'selamat-datang', title: 'Selamat Datang', album: 'SDdUD', chance: 'wildcard' },
  { id: 'cameo', title: 'Cameo', album: 'SDdUD', chance: 'wildcard' },
  { id: 'jalan-tikus', title: 'Jalan Tikus', album: 'SDdUD', chance: 'wildcard' },
  { id: 'polusi-cahaya', title: 'Polusi Cahaya', album: 'SDdUD', chance: 'wildcard' },
  { id: 'ya-mau-gimana', title: 'Ya Mau Gimana', album: 'SDdUD', chance: 'wildcard' },
  { id: 'seragam-ketat', title: 'Seragam Ketat', album: 'SDdUD', chance: 'wildcard' },
  { id: 'tidak-ada-salju', title: 'Tidak Ada Salju Di Sini Pt. 6', album: 'SDdUD', chance: 'wildcard' },
]

const KEY_LYRICS = 'lomba-sihir:lyrics'
const KEY_PLAYED = 'lomba-sihir:played'
const KEY_SIZE = 'lomba-sihir:size'
const SIZES = [16, 19, 23, 28]

function loadRaw(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

// Stored values are re-validated: a bad value must never white-screen the page at the venue.
function loadLyrics(): Record<string, string> {
  const v = loadRaw(KEY_LYRICS)
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {}
  return Object.fromEntries(Object.entries(v).filter(([, t]) => typeof t === 'string'))
}

function loadPlayed(): string[] {
  const v = loadRaw(KEY_PLAYED)
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}

function loadSize(): number {
  const v = loadRaw(KEY_SIZE)
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < SIZES.length ? v : 1
}

/** Returns false when the browser refused to store (private mode, full quota). */
function save(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function subscribeOnline(cb: () => void) {
  window.addEventListener('online', cb)
  window.addEventListener('offline', cb)
  return () => {
    window.removeEventListener('online', cb)
    window.removeEventListener('offline', cb)
  }
}

function useOfflineReady() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
    let alive = true
    const markReady = () => { if (alive) setReady(true) }
    // Ask the browser not to evict the cache and saved lyrics before the show.
    navigator.storage?.persist?.().catch(() => {})
    // Readiness comes from the registration itself, not navigator.serviceWorker.ready:
    // when the user arrives from the home page, this document started outside the worker's scope.
    navigator.serviceWorker
      .register('/lomba-sihir-sw.js', { scope: '/lomba-sihir' })
      .then((reg) => {
        if (reg.active) return markReady()
        const sw = reg.installing ?? reg.waiting
        sw?.addEventListener('statechange', () => {
          if (sw.state === 'activated') markReady()
        })
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])
  return ready
}

function lyricsSearchUrl(title: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`Lomba Sihir ${title} lirik`)}`
}

type CardProps = {
  song: Song
  index: number
  open: boolean
  played: boolean
  lyrics: string
  online: boolean
  onToggle: () => void
  onPlayed: () => void
  onSaveLyrics: (text: string) => void
}

function SongCard({ song, index, open, played, lyrics, online, onToggle, onPlayed, onSaveLyrics }: CardProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const startEdit = () => {
    setDraft(lyrics)
    setEditing(true)
  }

  return (
    <li className={`${styles.card} ${played ? styles.played : ''}`}>
      <div className={styles.cardHead}>
        <button
          type="button"
          className={styles.check}
          aria-pressed={played}
          aria-label={played ? `Unmark ${song.title} as played` : `Mark ${song.title} as played`}
          onClick={onPlayed}
        >
          {played ? '✓' : index}
        </button>
        <button type="button" className={styles.titleBtn} aria-expanded={open} onClick={onToggle}>
          <span className={styles.title}>{song.title}</span>
          <span className={styles.meta}>
            <span className={`${styles.badge} ${styles[song.chance]}`}>{CHANCE_LABEL[song.chance]}</span>
            {lyrics && <span className={styles.hasLyrics}>♪ lyrics saved</span>}
          </span>
          {song.note && <span className={styles.note}>{song.note}</span>}
        </button>
        <span className={styles.chevron} aria-hidden>{open ? '−' : '+'}</span>
      </div>

      {open && (
        <div className={styles.body}>
          <p className={styles.album}>{ALBUMS[song.album]}</p>

          {editing ? (
            <>
              <textarea
                className={styles.textarea}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Paste the lyrics here. They are saved on this phone and work offline."
                rows={12}
                autoFocus
              />
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => { onSaveLyrics(draft.trim()); setEditing(false) }}
                >
                  Save
                </button>
                <button type="button" className={styles.ghost} onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </>
          ) : lyrics ? (
            <>
              <div className={styles.lyrics}>{lyrics}</div>
              <div className={styles.actions}>
                <button type="button" className={styles.ghost} onClick={startEdit}>Edit lyrics</button>
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <p>No lyrics saved yet. Find them online, copy them, and paste them here. After that they work without internet.</p>
              <div className={styles.actions}>
                {online ? (
                  <a className={styles.ghost} href={lyricsSearchUrl(song.title)} target="_blank" rel="noreferrer">
                    Find lyrics ↗
                  </a>
                ) : (
                  <span className={styles.offlineHint}>Offline: you can't search for lyrics right now</span>
                )}
                <button type="button" className={styles.primary} onClick={startEdit}>Paste lyrics</button>
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  )
}

function LombaSihir() {
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true)
  const offlineReady = useOfflineReady()
  const [lyrics, setLyrics] = useState(loadLyrics)
  const [played, setPlayed] = useState(loadPlayed)
  const [sizeIdx, setSizeIdx] = useState(loadSize)
  const [openId, setOpenId] = useState<string | null>(null)
  const [storageFailed, setStorageFailed] = useState(false)

  // Each write starts from what is stored now, so another open tab's changes are not overwritten.
  const saveLyrics = (id: string, text: string) => {
    const next = loadLyrics()
    if (text) next[id] = text
    else delete next[id]
    setLyrics(next)
    setStorageFailed(!save(KEY_LYRICS, next))
  }

  const togglePlayed = (id: string) => {
    const current = loadPlayed()
    const next = current.includes(id) ? current.filter((p) => p !== id) : [...current, id]
    setPlayed(next)
    setStorageFailed(!save(KEY_PLAYED, next))
  }

  const resetPlayed = () => {
    if (!window.confirm('Clear all "played" marks?')) return
    setPlayed([])
    setStorageFailed(!save(KEY_PLAYED, []))
  }

  const changeSize = (delta: number) => {
    const next = Math.min(SIZES.length - 1, Math.max(0, sizeIdx + delta))
    setSizeIdx(next)
    save(KEY_SIZE, next)
  }

  const allIds = [...LIKELY, ...WILDCARDS].map((s) => s.id)
  const playedCount = played.filter((id) => allIds.includes(id)).length
  const savedCount = Object.keys(lyrics).filter((id) => allIds.includes(id)).length

  const renderList = (songs: Song[], offset: number) => (
    <ol className={styles.list}>
      {songs.map((s, i) => (
        <SongCard
          key={s.id}
          song={s}
          index={offset + i + 1}
          open={openId === s.id}
          played={played.includes(s.id)}
          lyrics={lyrics[s.id] ?? ''}
          online={online}
          onToggle={() => setOpenId(openId === s.id ? null : s.id)}
          onPlayed={() => togglePlayed(s.id)}
          onSaveLyrics={(t) => saveLyrics(s.id, t)}
        />
      ))}
    </ol>
  )

  return (
    <main className={styles.page} style={{ '--lyric-size': `${SIZES[sizeIdx]}px` } as CSSProperties}>
      <div className={styles.topbar}>
        <Link to="/" className={styles.back}>← Home</Link>
        <span className={`${styles.status} ${online ? styles.on : styles.off}`}>
          {online ? 'Online' : 'Offline'}
          {offlineReady && ' · saved for offline'}
        </span>
      </div>

      <header className={styles.hero}>
        <p className={styles.kicker}>Concert companion</p>
        <h1 className={styles.h1}>Lomba Sihir</h1>
        <p className={styles.sub}>
          A guess at the setlist, based on the band's late-2025 <em>Obrolan Jam 3 Pagi</em> shows.
          The real order will be different.
        </p>
      </header>

      <section className={styles.tips}>
        <strong>Before you go:</strong> open this page once while you have internet, then paste lyrics for the songs you
        want. Everything is saved on this phone, so it works with bad or no signal at the venue. Tip: add it to your
        home screen so the browser keeps it.
      </section>

      {storageFailed && (
        <p className={styles.warn} role="alert">
          This browser would not save to the phone (private mode or full storage?). Your changes will be lost on
          reload. Try a normal browser tab.
        </p>
      )}

      <div className={styles.toolbar}>
        <span className={styles.progress}>
          {playedCount} played · {savedCount} with lyrics
        </span>
        <div className={styles.tools}>
          <button type="button" className={styles.tool} onClick={() => changeSize(-1)} disabled={sizeIdx === 0} aria-label="Smaller lyrics">A−</button>
          <button type="button" className={styles.tool} onClick={() => changeSize(1)} disabled={sizeIdx === SIZES.length - 1} aria-label="Bigger lyrics">A+</button>
          {playedCount > 0 && (
            <button type="button" className={styles.tool} onClick={resetPlayed}>Reset</button>
          )}
        </div>
      </div>

      <h2 className={styles.section}>Likely setlist</h2>
      <p className={styles.hint}>Tap a number to mark the song as played. Tap the title to see its lyrics.</p>
      {renderList(LIKELY, 0)}

      <h2 className={styles.section}>Wildcards</h2>
      <p className={styles.hint}>Older songs that could come back.</p>
      {renderList(WILDCARDS, LIKELY.length)}

      <footer className={styles.footer}>
        Setlist based on 2025 shows listed on setlist.fm (crowd-sourced). Lyrics are not included here because of
        copyright. Paste your own and they stay on this device.
      </footer>
    </main>
  )
}

export default LombaSihir
