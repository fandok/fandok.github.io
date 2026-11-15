import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type Ref } from 'react'
import {
  Badge,
  Box,
  Button,
  ChakraProvider,
  Checkbox,
  Field,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Progress,
  Stack,
  Text,
} from '@chakra-ui/react'
import { toBlob } from 'html-to-image'
import { PADEL_SCOPE_CLASS, padelSystem } from './chakraSystem'

// ─── Language ───────────────────────────────────────────────────────────────

type Lang = 'en' | 'id'
type L = Record<Lang, string>
const LANGS: Lang[] = ['en', 'id']

// ─── Glossary ───────────────────────────────────────────────────────────────

type TermId =
  | 'bandeja'
  | 'vibora'
  | 'bajada'
  | 'chiquita'
  | 'gancho'
  | 'rulo'
  | 'double-glass'
  | 'back-glass'
  | 'side-glass'
  | 'boast'
  | 'rotate'
  | 'no-mans-land'
  | 'lob'
  | 'volley'
  | 'slice'
  | 'drop-shot'
  | 'forehand-backhand'
  | 'high-to-low'
  | 'low-to-high'
  | 'cross-court'
  | 'tempo'
  | 'construction'
  | 'ready-position'
  | 'shuffle'
  | 'poach'
  | 'lunge'
  | 'backpedal'

const GLOSSARY: Record<TermId, { name: string; def: L }> = {
  bandeja: {
    name: 'Bandeja',
    def: {
      en: 'A controlled overhead hit with slice, around head height, used to keep your position at the net instead of smashing. Aim it deep, towards the back glass.',
      id: 'Pukulan overhead terkontrol dengan slice, kira-kira setinggi kepala, untuk mempertahankan posisi di net tanpa smash. Arahkan dalam, ke dekat kaca belakang.',
    },
  },
  vibora: {
    name: 'Víbora',
    def: {
      en: 'A more aggressive overhead than the bandeja, hit with side spin and slice so the ball skids low after it hits the glass.',
      id: 'Overhead yang lebih agresif dari bandeja, dipukul dengan putaran samping dan slice sehingga bola meluncur rendah setelah kena kaca.',
    },
  },
  bajada: {
    name: 'Bajada',
    def: {
      en: 'An attacking shot hit in the air after the ball bounces high off the back glass, usually after a deep lob. You "bring the ball down" with pace instead of just defending.',
      id: 'Pukulan menyerang di udara setelah bola memantul tinggi dari kaca belakang, biasanya setelah lob yang dalam. Bola "diturunkan" dengan keras, bukan sekadar bertahan.',
    },
  },
  chiquita: {
    name: 'Chiquita',
    def: {
      en: "A slow, low ball aimed at the feet of opponents standing at the net, so they have to volley upwards and your team can move forward to the net.",
      id: 'Bola pelan dan rendah ke arah kaki lawan yang sedang di net, sehingga mereka terpaksa volley ke atas dan timmu bisa maju ke net.',
    },
  },
  gancho: {
    name: 'Gancho',
    def: {
      en: 'A hooked overhead played close to the net, often on high balls on the backhand side, angled sharply to finish the point.',
      id: 'Overhead dengan gerakan mengait di dekat net, sering untuk bola tinggi di sisi backhand, diarahkan menyudut untuk mematikan poin.',
    },
  },
  rulo: {
    name: 'Rulo',
    def: {
      en: 'A smash with heavy topspin that kicks up high off the back glass, making it very hard to return.',
      id: 'Smash dengan topspin kuat yang memantul tinggi dari kaca belakang, sehingga sangat sulit dikembalikan.',
    },
  },
  'double-glass': {
    name: 'Double glass (doble pared)',
    def: {
      en: 'When the ball hits two walls (for example side glass then back glass) before you return it. You have to read both rebounds and hit after the second one.',
      id: 'Bola memantul di dua dinding (misalnya kaca samping lalu kaca belakang) sebelum kamu kembalikan. Kamu harus membaca dua pantulan dan memukul setelah pantulan kedua.',
    },
  },
  'back-glass': {
    name: 'Back glass',
    def: {
      en: 'The glass wall behind you. In padel the ball may bounce on the floor, then off this wall, and still be played.',
      id: 'Dinding kaca di belakangmu. Di padel, bola boleh memantul di lantai lalu ke dinding ini dan tetap bisa dimainkan.',
    },
  },
  'side-glass': {
    name: 'Side glass',
    def: {
      en: 'The glass walls at the sides of the court. The ball comes off them at an angle, so you need to read the rebound.',
      id: 'Dinding kaca di sisi lapangan. Bola memantul keluar dengan sudut, jadi kamu perlu membaca arah pantulannya.',
    },
  },
  boast: {
    name: 'Boast (contrapared)',
    def: {
      en: 'Hitting the ball into your own back or side wall so it rebounds over the net. An emergency defensive shot, not something to use every time.',
      id: 'Memukul bola ke dinding belakang atau samping milikmu sendiri agar memantul melewati net. Pukulan darurat untuk bertahan, bukan untuk dipakai setiap saat.',
    },
  },
  rotate: {
    name: 'Rotate (with the wall)',
    def: {
      en: 'Turning your body sideways and stepping with the ball as it comes off the glass, so you can hit it while facing the net.',
      id: 'Memutar badan menyamping dan melangkah mengikuti bola yang keluar dari kaca, agar bisa memukul sambil menghadap net.',
    },
  },
  'no-mans-land': {
    name: "No man's land",
    def: {
      en: "The middle of your half, between the net zone and the back zone. You're too far back to volley well and too close to play off the wall, so opponents aim at your feet.",
      id: 'Area tengah lapanganmu, antara zona net dan zona belakang. Terlalu jauh untuk volley dan terlalu dekat untuk bermain dengan dinding, jadi lawan mudah mengincar kakimu.',
    },
  },
  lob: {
    name: 'Lob (globo)',
    def: {
      en: 'A high, deep ball over the opponents at the net, to push them back so your team can take the net.',
      id: 'Bola tinggi dan dalam melewati lawan yang ada di net, untuk memaksa mereka mundur sehingga timmu bisa merebut net.',
    },
  },
  volley: {
    name: 'Volley',
    def: {
      en: 'Hitting the ball in the air before it bounces, usually near the net.',
      id: 'Memukul bola di udara sebelum memantul, biasanya di dekat net.',
    },
  },
  slice: {
    name: 'Slice',
    def: {
      en: 'Hitting under and through the ball to give it backspin, so it stays low and slow after the bounce.',
      id: 'Memukul bagian bawah bola sehingga berputar ke belakang (backspin), membuat bola tetap rendah dan pelan setelah memantul.',
    },
  },
  'drop-shot': {
    name: 'Drop shot (dejada)',
    def: {
      en: 'A soft shot that lands just over the net and barely bounces, used when the opponents are deep.',
      id: 'Pukulan lembut yang jatuh tepat di belakang net dan hampir tidak memantul, dipakai saat lawan berada jauh di belakang.',
    },
  },
  'forehand-backhand': {
    name: 'Forehand / backhand',
    def: {
      en: 'Forehand: a shot on your racket-hand side. Backhand: a shot on the other side, with the racket crossing in front of your body.',
      id: 'Forehand: pukulan di sisi tangan yang memegang raket. Backhand: pukulan di sisi sebaliknya, dengan raket menyilang di depan badan.',
    },
  },
  'high-to-low': {
    name: 'High to low',
    def: {
      en: 'Swinging from above the ball downwards (on serves and volleys), so the ball travels down and stays low after the bounce.',
      id: 'Mengayun dari atas bola ke bawah (saat servis dan volley), sehingga bola bergerak turun dan tetap rendah setelah memantul.',
    },
  },
  'low-to-high': {
    name: 'Low to high',
    def: {
      en: 'Swinging from below the ball upwards on groundstrokes, for a flatter, more controlled ball over the net.',
      id: 'Ayunan dari bawah ke atas pada groundstroke, agar bola melewati net lebih datar dan terkontrol.',
    },
  },
  'cross-court': {
    name: 'Cross-court',
    def: {
      en: 'Hitting diagonally to the opposite corner. It is the safest direction: the longest distance and over the lower middle of the net.',
      id: 'Memukul diagonal ke sudut seberang. Ini arah paling aman: jaraknya paling jauh dan melewati bagian tengah net yang lebih rendah.',
    },
  },
  tempo: {
    name: 'Tempo',
    def: {
      en: 'The pace of the rally. Controlling it means speeding up or slowing down (for example with a lob) to suit your team.',
      id: 'Kecepatan reli. Mengontrol tempo berarti mempercepat atau memperlambat permainan (misalnya dengan lob) sesuai kebutuhan timmu.',
    },
  },
  construction: {
    name: 'Construction (net play)',
    def: {
      en: 'Building the point patiently at the net with controlled volleys and placement, waiting for the right ball to attack.',
      id: 'Membangun poin dengan sabar di net lewat volley terkontrol dan penempatan bola, sambil menunggu bola yang tepat untuk menyerang.',
    },
  },
  'ready-position': {
    name: 'Ready position',
    def: {
      en: 'Knees bent, weight on the balls of your feet, racket up in front of you, ready to move either way.',
      id: 'Lutut ditekuk, berat badan di ujung telapak kaki, raket di depan badan, siap bergerak ke arah mana pun.',
    },
  },
  shuffle: {
    name: 'Shuffle / side steps',
    def: {
      en: 'Moving sideways without crossing your feet, so you stay balanced and facing the play.',
      id: 'Bergerak menyamping tanpa menyilangkan kaki, agar tetap seimbang dan menghadap permainan.',
    },
  },
  poach: {
    name: 'Poach',
    def: {
      en: "Crossing into your partner's side at the net to intercept a ball and volley it away.",
      id: 'Menyeberang ke sisi partner di net untuk memotong bola dan langsung mem-volley-nya.',
    },
  },
  lunge: {
    name: 'Lunge',
    def: {
      en: 'One big last-second step to reach the ball instead of small adjustment steps. It often leaves you off balance.',
      id: 'Satu langkah besar di detik terakhir untuk menjangkau bola, bukan langkah-langkah kecil penyesuaian. Sering membuat badan tidak seimbang.',
    },
  },
  backpedal: {
    name: 'Backpedal',
    def: {
      en: 'Running backwards while facing the net to chase a lob. Slow and risky; turning sideways and running is better.',
      id: 'Berlari mundur sambil menghadap net untuk mengejar lob. Lambat dan berisiko; lebih baik putar badan menyamping lalu berlari.',
    },
  },
}

// ─── Assessment data ────────────────────────────────────────────────────────
// Based on a coach's padel levelling score sheet: 4 categories, each with
// "anchors" (red flags that cap the level at 2.5) and positives (+1 each).

type CategoryId = 'tactics' | 'technique' | 'movement' | 'wall'
type Item = { id: string; text: L; terms?: TermId[] }
type Category = {
  id: CategoryId
  name: L
  emoji: string
  blurb: L
  anchors: Item[]
  positives: Item[]
}

type ItemSpec = [en: string, id: string, terms?: TermId[]]
const items = (prefix: string, specs: ItemSpec[]): Item[] =>
  specs.map(([en, id, terms], i) => ({ id: `${prefix}${i + 1}`, text: { en, id }, terms }))

const CATEGORIES: Category[] = [
  {
    id: 'tactics',
    name: { en: 'Tactics', id: 'Taktik' },
    emoji: '🧠',
    blurb: {
      en: 'Positioning, shot choice and playing as a team.',
      id: 'Posisi, pilihan pukulan, dan kerja sama tim.',
    },
    anchors: items('tac-a', [
      ['Stays back after serve, avoids the net', 'Tetap di belakang setelah servis, menghindari net'],
      [
        "Doesn't understand areas of play, stays in no man's land",
        "Belum paham area permainan, sering berdiri di no man's land",
        ['no-mans-land'],
      ],
      ['Hits every ball at max speed', 'Memukul setiap bola sekencang mungkin'],
    ]),
    positives: items('tac-p', [
      ['Attempts the net after a serve or short ball', 'Maju ke net setelah servis atau bola pendek'],
      ['Uses the lob to gain the net', 'Menggunakan lob untuk merebut net', ['lob']],
      ['Communicates with partner (calls, positioning)', 'Berkomunikasi dengan partner (panggilan bola, posisi)'],
      ['Changes direction of serve', 'Mengubah arah servis'],
      [
        'Controls tempo, e.g. resets the point with a lob to regain position',
        'Mengontrol tempo, misalnya reset poin dengan lob untuk kembali ke posisi',
        ['tempo', 'lob'],
      ],
      [
        'Moves opponents and plays to the gap, or creates gaps',
        'Menggerakkan lawan dan memukul ke celah, atau menciptakan celah',
      ],
      ['Sustains net play with construction', 'Bertahan di net sambil membangun poin (construction)', ['construction']],
      [
        'Moves together with partner (back–forward and laterally)',
        'Bergerak bersama partner (maju–mundur dan ke samping)',
      ],
      ['Able to play safe when under pressure', 'Bisa bermain aman saat tertekan'],
      ['Targets the weaker opponent', 'Mengincar lawan yang lebih lemah'],
      ["Anticipates the opponent's next shot", 'Mengantisipasi pukulan lawan berikutnya'],
      [
        'Plays mainly cross-court / middle, changes direction for winners',
        'Lebih banyak main cross-court / ke tengah, ganti arah untuk winner',
        ['cross-court'],
      ],
    ]),
  },
  {
    id: 'technique',
    name: { en: 'Technique', id: 'Teknik' },
    emoji: '🎾',
    blurb: {
      en: 'Stroke quality from the baseline to the net.',
      id: 'Kualitas pukulan dari belakang sampai ke net.',
    },
    anchors: items('tec-a', [
      ['Contact behind the body / late preparation', 'Kontak bola di belakang badan / persiapan terlambat'],
      [
        "Doesn't hit a real backhand, twists the wrist",
        'Tidak memakai backhand yang benar, memutar pergelangan tangan',
        ['forehand-backhand'],
      ],
      ['Slices every ball, even low ones', 'Selalu slice, bahkan untuk bola rendah', ['slice']],
    ]),
    positives: items('tec-p', [
      ['Delivers the forehand consistently', 'Forehand konsisten', ['forehand-backhand']],
      ['Delivers the backhand consistently', 'Backhand konsisten', ['forehand-backhand']],
      ['Serves high to low', 'Servis dari atas ke bawah (high to low)', ['high-to-low']],
      ['Lobs high, contact point underneath the ball', 'Lob tinggi, kontak di bagian bawah bola', ['lob']],
      [
        'Plays volleys (FH & BH) with depth, high-to-low contact, extending after the hit',
        'Volley (FH & BH) dalam, kontak dari atas ke bawah, ayunan diteruskan setelah memukul',
        ['volley', 'high-to-low'],
      ],
      ['Can play a bandeja consistently', 'Bisa memukul bandeja dengan konsisten', ['bandeja']],
      ['Drop shot / chiquita is effective', 'Drop shot / chiquita efektif', ['drop-shot', 'chiquita']],
      [
        'Flat ball trajectory with low-to-high swings on groundstrokes',
        'Lintasan bola datar dengan ayunan dari bawah ke atas pada groundstroke',
        ['low-to-high'],
      ],
      [
        'Able to slice volleys when given the opportunity',
        'Bisa slice saat volley jika ada kesempatan',
        ['slice', 'volley'],
      ],
      ['Bajada is accurate', 'Bajada akurat', ['bajada']],
      ['Can play a víbora', 'Bisa memukul víbora', ['vibora']],
      [
        'Executes advanced shots (gancho, chiquita, rulo)',
        'Bisa pukulan lanjutan (gancho, chiquita, rulo)',
        ['gancho', 'chiquita', 'rulo'],
      ],
    ]),
  },
  {
    id: 'movement',
    name: { en: 'Movement', id: 'Gerakan' },
    emoji: '👟',
    blurb: {
      en: 'Footwork, court coverage and moving with your partner.',
      id: 'Footwork, jangkauan lapangan, dan bergerak bersama partner.',
    },
    anchors: items('mov-a', [
      ['Relies on lunges, no adjustment steps', 'Mengandalkan lunge, tanpa langkah penyesuaian', ['lunge']],
      ['Backpedals on lobs', 'Lari mundur (backpedal) saat mengejar lob', ['backpedal', 'lob']],
      ['No consistent ready position', 'Tidak konsisten dalam posisi siap', ['ready-position']],
    ]),
    positives: items('mov-p', [
      ['Always in a ready / athletic position', 'Selalu dalam posisi siap / atletis', ['ready-position']],
      ['Covers the court with shuffle / side steps', 'Menjangkau lapangan dengan shuffle / langkah samping', ['shuffle']],
      [
        'Recovers to position proactively after each shot',
        'Kembali ke posisi secara proaktif setelah setiap pukulan',
      ],
      ['Uses small steps to adjust before contact', 'Memakai langkah kecil untuk menyesuaikan sebelum memukul'],
      ['Reads play early, moves proactively', 'Membaca permainan lebih awal, bergerak proaktif'],
      ['Moves in sync with partner', 'Bergerak selaras dengan partner'],
      ['Covers the middle when partner is wide', 'Menutup area tengah saat partner melebar'],
      ['Poaches / intercepts at the net', 'Poach / memotong bola di net', ['poach']],
      ['Explosive coverage, quick recovery', 'Jangkauan eksplosif, cepat kembali ke posisi'],
      ['Anticipates 1–2 shots ahead', 'Mengantisipasi 1–2 pukulan ke depan'],
    ]),
  },
  {
    id: 'wall',
    name: { en: 'Wall skills', id: 'Main dinding' },
    emoji: '🧱',
    blurb: {
      en: 'Playing the back and side glass.',
      id: 'Bermain dengan kaca belakang dan kaca samping.',
    },
    anchors: items('wal-a', [
      [
        'Boasts every time without attempting to rotate',
        'Selalu boast (contrapared) tanpa mencoba berputar',
        ['boast', 'rotate'],
      ],
      [
        'Faces the wall and lacks one extra step, ending up hitting backwards',
        'Menghadap dinding dan kurang satu langkah, akhirnya memukul ke arah belakang',
        ['rotate'],
      ],
      ['Constantly avoids playing off the wall', 'Selalu menghindari bermain dengan dinding'],
    ]),
    positives: items('wal-p', [
      ['Reliable forehand off the back glass', 'Forehand andal setelah pantulan kaca belakang', ['back-glass']],
      ['Reliable backhand off the back glass', 'Backhand andal setelah pantulan kaca belakang', ['back-glass']],
      ['Controls the side-glass rebound', 'Mengontrol pantulan kaca samping', ['side-glass']],
      [
        "Attempts the double glass (doesn't give up halfway, tries to reach the ball)",
        'Mencoba double glass (tidak menyerah di tengah jalan, berusaha menjangkau bola)',
        ['double-glass'],
      ],
      ['Can play the double glass effectively', 'Bisa memainkan double glass dengan efektif', ['double-glass']],
      ['Reads spin / angles (e.g. a sliced ball drops)', 'Membaca spin / sudut (misalnya bola slice akan turun)', ['slice']],
      [
        'Able to execute a bajada after a lob off the back glass',
        'Bisa bajada setelah lob memantul dari kaca belakang',
        ['bajada', 'back-glass'],
      ],
      [
        'Able to execute a chiquita off the glass to the feet',
        'Bisa chiquita setelah pantulan kaca, ke arah kaki lawan',
        ['chiquita'],
      ],
      ['Understands when to let the ball come off the wall', 'Paham kapan membiarkan bola memantul dari dinding dulu'],
    ]),
  },
]

const MAX_SCORE = CATEGORIES.reduce((sum, c) => sum + c.positives.length, 0) // 43
const ANCHOR_CAP = 2.5

const LEVEL_TABLE: { level: number; min: number; max: number }[] = [
  { level: 1, min: 0, max: 3 },
  { level: 1.5, min: 4, max: 6 },
  { level: 2, min: 7, max: 9 },
  { level: 2.5, min: 10, max: 12 },
  { level: 3, min: 13, max: 16 },
  { level: 3.5, min: 17, max: 20 },
  { level: 4, min: 21, max: 25 },
  { level: 4.5, min: 26, max: 31 },
  { level: 5, min: 32, max: 37 },
  { level: 5.5, min: 38, max: 43 },
]

const LEVEL_BANDS: { upTo: number; title: L; description: L }[] = [
  {
    upTo: 1.5,
    title: { en: 'Beginner', id: 'Pemula' },
    description: {
      en: 'You are learning the basics: getting the ball back, understanding the court and starting to use the walls.',
      id: 'Kamu sedang belajar dasar: mengembalikan bola, memahami lapangan, dan mulai memakai dinding.',
    },
  },
  {
    upTo: 2.5,
    title: { en: 'Improver', id: 'Berkembang' },
    description: {
      en: 'You can rally and enjoy matches. The next jump comes from owning the net, cleaner strokes and fixing any red-flag habits.',
      id: 'Kamu sudah bisa reli dan menikmati pertandingan. Lompatan berikutnya datang dari menguasai net, pukulan yang lebih bersih, dan menghilangkan kebiasaan red flag.',
    },
  },
  {
    upTo: 3.5,
    title: { en: 'Intermediate', id: 'Menengah' },
    description: {
      en: 'Solid fundamentals and a real game plan. Consistency off the glass and overheads like the bandeja separate you from the next level.',
      id: 'Dasar yang solid dan punya rencana permainan. Konsistensi dengan kaca dan overhead seperti bandeja yang membedakanmu dari level berikutnya.',
    },
  },
  {
    upTo: 4.5,
    title: { en: 'Advanced', id: 'Mahir' },
    description: {
      en: 'You build points, move as a pair and have a full set of overheads. Refinement and decision-making under pressure are your growth areas.',
      id: 'Kamu bisa membangun poin, bergerak sebagai pasangan, dan punya overhead yang lengkap. Ruang berkembangmu ada di detail dan pengambilan keputusan saat tertekan.',
    },
  },
  {
    upTo: 5.5,
    title: { en: 'Expert', id: 'Ahli' },
    description: {
      en: 'Competition-level padel: advanced shots, anticipation and tactical control. Keep sharpening the details.',
      id: 'Padel level kompetisi: pukulan lanjutan, antisipasi, dan kontrol taktik. Terus asah detailnya.',
    },
  },
]

const ALL_ITEM_IDS = new Set(CATEGORIES.flatMap((c) => [...c.anchors, ...c.positives].map((i) => i.id)))

// ─── UI text ────────────────────────────────────────────────────────────────

const s = (n: number) => (n === 1 ? '' : 's')

const UI_EN = {
  title: "What's my padel level?",
  intro:
    "A quick self-assessment based on a coach's levelling score sheet. Tick what's true about your game across tactics, technique, movement and wall skills, and get a level from 1.0 to 5.5 you can share with your padel group.",
  draftTitle: 'You have an unfinished assessment',
  draftMeta: (date: string, step: number, steps: number, ticked: number) =>
    `Saved ${date} · step ${step} of ${steps} · ${ticked} item${s(ticked)} ticked`,
  continueDraft: 'Continue draft',
  startOver: 'Start over',
  confirmDiscard: 'Discard your unfinished assessment and start over?',
  start: 'Start assessment',
  lastResult: (date: string) => `Your last result · ${date}`,
  level: 'Level',
  viewResult: 'View result',
  howItWorks: 'How it works',
  howItems: [
    `Each positive skill you tick is worth 1 point, out of ${MAX_SCORE}.`,
    `Each category also lists red flags (bad habits). Tick any that apply: one or more caps your level at ${ANCHOR_CAP.toFixed(1)} until you fix it.`,
    'Not sure what a term means? Tap the ? next to a skill, or open the glossary below.',
    'Your progress is saved on this device, so you can leave and come back.',
    'Be honest: tick a skill only if you do it reliably in matches, not just sometimes.',
  ],
  stepOf: (step: number, steps: number) => `Step ${step} of ${steps} · draft saved automatically`,
  saveExit: 'Save & exit',
  nameLabel: 'Your name (optional, shown on the share image)',
  namePlaceholder: 'e.g. Fandi',
  redFlagsTitle: '🚩 Red flags: tick any that sound like you',
  redFlagsHint: `Red flags are habits that hold your game back. Any red flag caps your level at ${ANCHOR_CAP.toFixed(1)}. Leave these empty if they don't apply.`,
  skillsTitle: '✅ Skills you do reliably (+1 each)',
  back: '← Back',
  next: (name: string) => `Next: ${name} →`,
  seeLevel: 'See my level →',
  termsButton: 'What do these terms mean?',
  glossaryTitle: '📖 Padel glossary',
  glossaryHide: 'Hide glossary',
  shareImage: 'Share image',
  saveImage: 'Save image',
  saved: 'Image saved. Share it from your gallery or downloads.',
  renderFail: "Couldn't create the image. Try taking a screenshot instead.",
  shareFallback: "Your browser can't share images directly, so the image was downloaded instead.",
  shareFail: "Couldn't share the image. Try Save image or a screenshot.",
  shareText: (level: string, title: string, score: number, url: string) =>
    `My padel level: ${level} (${title}) · ${score}/${MAX_SCORE}. Check yours: ${url}`,
  summary: 'Summary',
  cappedTitle: `🚩 Capped at ${ANCHOR_CAP.toFixed(1)} by red flags`,
  habitsTitle: `🚩 Habits to fix before moving past ${ANCHOR_CAP.toFixed(1)}`,
  cappedBody: (raw: string) => `Your skills alone score level ${raw}, but these habits hold you back. Fix them first:`,
  strongest: '💪 Strongest area',
  focus: '🎯 Focus area',
  nextLevel: '📈 Next level',
  skillsOf: (score: number, max: number) => `${score}/${max} skills.`,
  nextCapped: (raw: string, pts: number, next: string) =>
    `Clear your red flags to unlock ${raw}; ${pts} more skill${s(pts)} would take you to ${next}.`,
  nextNormal: (pts: number, next: string) => `${pts} more skill${s(pts)} to reach level ${next}.`,
  workOn: (cat: string) => `Skills to work on next (${cat})`,
  disclaimer:
    'This is a self-assessment, not an official rating. For an accurate level, ask a coach to fill the same sheet while watching you play.',
  retake: 'Retake assessment',
  backToStart: 'Back to start',
  cardLabel: 'Padel level',
  cardDefaultName: 'My assessment',
  cardSkills: (score: number) => `${score}/${MAX_SCORE} skills`,
  cardCapped: (raw: string) => `🚩 Capped by red flags (skills score ${raw})`,
  languageLabel: 'Language',
}

type UiText = typeof UI_EN

const UI: Record<Lang, UiText> = {
  en: UI_EN,
  id: {
    title: 'Berapa level padel-ku?',
    intro:
      'Penilaian mandiri singkat berdasarkan lembar penilaian level dari pelatih. Centang yang sesuai dengan permainanmu di taktik, teknik, gerakan, dan main dinding, lalu dapatkan level dari 1.0 sampai 5.5 yang bisa kamu bagikan ke grup padel-mu.',
    draftTitle: 'Kamu punya penilaian yang belum selesai',
    draftMeta: (date, step, steps, ticked) =>
      `Disimpan ${date} · langkah ${step} dari ${steps} · ${ticked} item dicentang`,
    continueDraft: 'Lanjutkan draf',
    startOver: 'Mulai ulang',
    confirmDiscard: 'Hapus penilaian yang belum selesai dan mulai ulang?',
    start: 'Mulai penilaian',
    lastResult: (date) => `Hasil terakhirmu · ${date}`,
    level: 'Level',
    viewResult: 'Lihat hasil',
    howItWorks: 'Cara kerjanya',
    howItems: [
      `Setiap skill positif yang kamu centang bernilai 1 poin, dari total ${MAX_SCORE}.`,
      `Setiap kategori juga punya red flag (kebiasaan buruk). Centang yang sesuai: satu saja sudah membatasi levelmu maksimal ${ANCHOR_CAP.toFixed(1)} sampai kebiasaan itu diperbaiki.`,
      'Tidak yakin arti suatu istilah? Ketuk tanda ? di samping skill, atau buka glosarium di bawah.',
      'Progresmu tersimpan di perangkat ini, jadi kamu bisa keluar dan lanjut lagi nanti.',
      'Jujur ya: centang skill hanya kalau kamu melakukannya dengan konsisten saat bertanding, bukan cuma kadang-kadang.',
    ],
    stepOf: (step, steps) => `Langkah ${step} dari ${steps} · draf tersimpan otomatis`,
    saveExit: 'Simpan & keluar',
    nameLabel: 'Namamu (opsional, tampil di gambar yang dibagikan)',
    namePlaceholder: 'misalnya Fandi',
    redFlagsTitle: '🚩 Red flag: centang yang sesuai denganmu',
    redFlagsHint: `Red flag adalah kebiasaan yang menghambat permainanmu. Satu red flag saja membatasi levelmu maksimal ${ANCHOR_CAP.toFixed(1)}. Biarkan kosong kalau tidak sesuai.`,
    skillsTitle: '✅ Skill yang kamu kuasai (+1 per skill)',
    back: '← Kembali',
    next: (name) => `Lanjut: ${name} →`,
    seeLevel: 'Lihat levelku →',
    termsButton: 'Apa arti istilah ini?',
    glossaryTitle: '📖 Glosarium padel',
    glossaryHide: 'Tutup glosarium',
    shareImage: 'Bagikan gambar',
    saveImage: 'Simpan gambar',
    saved: 'Gambar tersimpan. Bagikan dari galeri atau folder unduhan.',
    renderFail: 'Gagal membuat gambar. Coba ambil screenshot saja.',
    shareFallback: 'Browser-mu tidak bisa membagikan gambar langsung, jadi gambarnya diunduh.',
    shareFail: 'Gagal membagikan gambar. Coba Simpan gambar atau screenshot.',
    shareText: (level, title, score, url) =>
      `Level padel-ku: ${level} (${title}) · ${score}/${MAX_SCORE}. Cek levelmu: ${url}`,
    summary: 'Ringkasan',
    cappedTitle: `🚩 Dibatasi di ${ANCHOR_CAP.toFixed(1)} karena red flag`,
    habitsTitle: `🚩 Kebiasaan yang perlu diperbaiki sebelum lewat level ${ANCHOR_CAP.toFixed(1)}`,
    cappedBody: (raw) =>
      `Dari skill saja, levelmu ${raw}, tapi kebiasaan ini menahanmu. Perbaiki ini dulu:`,
    strongest: '💪 Area terkuat',
    focus: '🎯 Area fokus',
    nextLevel: '📈 Level berikutnya',
    skillsOf: (score, max) => `${score}/${max} skill.`,
    nextCapped: (raw, pts, next) =>
      `Hilangkan red flag untuk membuka level ${raw}; ${pts} skill lagi akan membawamu ke ${next}.`,
    nextNormal: (pts, next) => `${pts} skill lagi untuk mencapai level ${next}.`,
    workOn: (cat) => `Skill yang perlu dilatih berikutnya (${cat})`,
    disclaimer:
      'Ini penilaian mandiri, bukan rating resmi. Untuk level yang akurat, minta pelatih mengisi lembar yang sama sambil melihatmu bermain.',
    retake: 'Ulangi penilaian',
    backToStart: 'Kembali ke awal',
    cardLabel: 'Level padel',
    cardDefaultName: 'Penilaianku',
    cardSkills: (score) => `${score}/${MAX_SCORE} skill`,
    cardCapped: (raw) => `🚩 Dibatasi red flag (skor skill ${raw})`,
    languageLabel: 'Bahasa',
  },
}

const LangContext = createContext<Lang>('en')
function useLang() {
  const lang = useContext(LangContext)
  return { lang, t: UI[lang] }
}

// ─── Scoring ────────────────────────────────────────────────────────────────

type CategoryScore = { id: CategoryId; score: number; max: number; anchorsTicked: Item[] }

type Assessment = {
  name: string
  ticked: string[]
  completedAt: string // ISO date
}

type Result = {
  total: number
  rawLevel: number
  level: number
  capped: boolean
  categories: CategoryScore[]
}

function levelForScore(score: number): number {
  return LEVEL_TABLE.find((row) => score >= row.min && score <= row.max)?.level ?? 1
}

function scoreAssessment(ticked: string[]): Result {
  const set = new Set(ticked)
  const categories = CATEGORIES.map((c) => ({
    id: c.id,
    score: c.positives.filter((i) => set.has(i.id)).length,
    max: c.positives.length,
    anchorsTicked: c.anchors.filter((i) => set.has(i.id)),
  }))
  const total = categories.reduce((sum, c) => sum + c.score, 0)
  const rawLevel = levelForScore(total)
  const capped = categories.some((c) => c.anchorsTicked.length > 0) && rawLevel > ANCHOR_CAP
  return { total, rawLevel, level: capped ? ANCHOR_CAP : rawLevel, capped, categories }
}

function bandFor(level: number) {
  return LEVEL_BANDS.find((b) => level <= b.upTo) ?? LEVEL_BANDS[LEVEL_BANDS.length - 1]
}

function categoryById(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id)!
}

function formatLevel(level: number) {
  return level.toFixed(1)
}

function formatDate(iso: string, lang: Lang) {
  return new Date(iso).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Storage ────────────────────────────────────────────────────────────────

const DRAFT_KEY = 'padel-level:v1:draft'
const LAST_KEY = 'padel-level:v1:last'
const LANG_KEY = 'padel-level:lang'

type Draft = { name: string; ticked: string[]; step: number; updatedAt: string }

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage unavailable (private mode, quota) — the page still works without it.
  }
}

function cleanTicked(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string' && ALL_ITEM_IDS.has(id)) : []
}

function loadDraft(): Draft | null {
  const d = readJson(DRAFT_KEY) as Partial<Draft> | null
  if (!d || typeof d !== 'object') return null
  const step = typeof d.step === 'number' ? Math.min(Math.max(0, Math.floor(d.step)), CATEGORIES.length - 1) : 0
  return {
    name: typeof d.name === 'string' ? d.name : '',
    ticked: cleanTicked(d.ticked),
    step,
    updatedAt:
      typeof d.updatedAt === 'string' && !Number.isNaN(Date.parse(d.updatedAt)) ? d.updatedAt : new Date().toISOString(),
  }
}

function loadLast(): Assessment | null {
  const a = readJson(LAST_KEY) as Partial<Assessment> | null
  if (!a || typeof a !== 'object' || typeof a.completedAt !== 'string' || Number.isNaN(Date.parse(a.completedAt)))
    return null
  return { name: typeof a.name === 'string' ? a.name : '', ticked: cleanTicked(a.ticked), completedAt: a.completedAt }
}

function loadLang(): Lang {
  const saved = readJson(LANG_KEY)
  if (saved === 'en' || saved === 'id') return saved
  return navigator.language?.toLowerCase().startsWith('id') ? 'id' : 'en'
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoke later: revoking right away can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

// ─── Dark mode (follows the OS, like the rest of the site) ─────────────────

const darkQuery = '(prefers-color-scheme: dark)'
function subscribeDark(cb: () => void) {
  const mq = window.matchMedia(darkQuery)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const getDark = () => window.matchMedia(darkQuery).matches

// ─── Page ───────────────────────────────────────────────────────────────────

type View = 'intro' | 'form' | 'result'

export default function PadelLevel() {
  const dark = useSyncExternalStore(subscribeDark, getDark, () => false)
  const [lang, setLang] = useState<Lang>(loadLang)
  const [view, setView] = useState<View>('intro')
  const [draft, setDraft] = useState<Draft | null>(loadDraft)
  const [last, setLast] = useState<Assessment | null>(loadLast)
  const [shown, setShown] = useState<Assessment | null>(null)

  const changeLang = (next: Lang) => {
    setLang(next)
    writeJson(LANG_KEY, next)
  }

  const show = (next: View) => {
    setView(next)
    window.scrollTo(0, 0)
  }

  const updateDraft = (next: Draft | null) => {
    setDraft(next)
    writeJson(DRAFT_KEY, next)
  }

  const startNew = () => {
    if (draft && !window.confirm(UI[lang].confirmDiscard)) return
    updateDraft({ name: last?.name ?? '', ticked: [], step: 0, updatedAt: new Date().toISOString() })
    show('form')
  }

  const finish = (d: Draft) => {
    const assessment: Assessment = { name: d.name.trim(), ticked: d.ticked, completedAt: new Date().toISOString() }
    setLast(assessment)
    writeJson(LAST_KEY, assessment)
    updateDraft(null)
    setShown(assessment)
    show('result')
  }

  return (
    <ChakraProvider value={padelSystem}>
      <LangContext value={lang}>
        <Box
          className={`${PADEL_SCOPE_CLASS}${dark ? ' dark' : ''}`}
          lang={lang}
          bg="bg"
          color="fg"
          textAlign="left"
          flex="1"
          colorPalette="green"
          style={{ colorScheme: dark ? 'dark' : 'light' }}
        >
          <Box maxW="720px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 4, md: 8 }}>
            <Flex justify="flex-end" mb={2}>
              <LanguageSwitch lang={lang} onChange={changeLang} />
            </Flex>

            {view === 'intro' && (
              <Intro
                draft={draft}
                last={last}
                onStart={startNew}
                onResume={() => show('form')}
                onViewLast={() => {
                  setShown(last)
                  show('result')
                }}
              />
            )}

            {view === 'form' && draft && (
              <AssessmentForm
                draft={draft}
                onChange={(next) => updateDraft({ ...next, updatedAt: new Date().toISOString() })}
                onExit={() => setView('intro')}
                onFinish={finish}
              />
            )}

            {view === 'result' && shown && (
              <ResultView assessment={shown} onRetake={startNew} onHome={() => setView('intro')} />
            )}
          </Box>
        </Box>
      </LangContext>
    </ChakraProvider>
  )
}

function LanguageSwitch({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  const { t } = useLang()
  return (
    <HStack gap={0} borderWidth="1px" rounded="full" p="2px" role="group" aria-label={t.languageLabel}>
      {LANGS.map((l) => (
        <Button
          key={l}
          size="xs"
          rounded="full"
          px={3}
          variant={l === lang ? 'solid' : 'ghost'}
          aria-pressed={l === lang}
          onClick={() => onChange(l)}
        >
          {l === 'en' ? 'EN' : 'ID'}
        </Button>
      ))}
    </HStack>
  )
}

// ─── Intro ──────────────────────────────────────────────────────────────────

function Intro({
  draft,
  last,
  onStart,
  onResume,
  onViewLast,
}: {
  draft: Draft | null
  last: Assessment | null
  onStart: () => void
  onResume: () => void
  onViewLast: () => void
}) {
  const { lang, t } = useLang()
  const lastResult = last ? scoreAssessment(last.ticked) : null

  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <Text fontSize="4xl" lineHeight="1">
          🎾
        </Text>
        <Heading as="h1" size={{ base: '3xl', md: '4xl' }} letterSpacing="tight">
          {t.title}
        </Heading>
        <Text color="fg.muted" fontSize="lg">
          {t.intro}
        </Text>
      </Stack>

      <HStack gap={2} wrap="wrap">
        {CATEGORIES.map((c) => (
          <Badge key={c.id} size="lg" variant="subtle" colorPalette="gray">
            {c.emoji} {c.name[lang]}
          </Badge>
        ))}
      </HStack>

      {draft && (
        <Box borderWidth="1px" borderColor="orange.muted" bg="orange.subtle" rounded="xl" p={4}>
          <Text fontWeight="semibold">{t.draftTitle}</Text>
          <Text fontSize="sm" color="fg.muted" mb={3}>
            {t.draftMeta(formatDate(draft.updatedAt, lang), draft.step + 1, CATEGORIES.length, draft.ticked.length)}
          </Text>
          <HStack gap={2} wrap="wrap">
            <Button colorPalette="orange" onClick={onResume}>
              {t.continueDraft}
            </Button>
            <Button variant="outline" onClick={onStart}>
              {t.startOver}
            </Button>
          </HStack>
        </Box>
      )}

      {!draft && (
        <Button size="xl" onClick={onStart} alignSelf={{ base: 'stretch', sm: 'flex-start' }}>
          {t.start}
        </Button>
      )}

      {last && lastResult && (
        <Box borderWidth="1px" rounded="xl" p={4}>
          <Text fontSize="sm" color="fg.muted">
            {t.lastResult(formatDate(last.completedAt, lang))}
          </Text>
          <Flex align="center" justify="space-between" gap={3} mt={1} wrap="wrap">
            <Text fontSize="2xl" fontWeight="bold">
              {t.level} {formatLevel(lastResult.level)}{' '}
              <Text as="span" fontSize="md" fontWeight="normal" color="fg.muted">
                · {bandFor(lastResult.level).title[lang]} · {lastResult.total}/{MAX_SCORE}
              </Text>
            </Text>
            <Button variant="outline" onClick={onViewLast}>
              {t.viewResult}
            </Button>
          </Flex>
        </Box>
      )}

      <Stack gap={2} fontSize="sm" color="fg.muted">
        <Text fontWeight="semibold" color="fg">
          {t.howItWorks}
        </Text>
        {t.howItems.map((line) => (
          <Text key={line}>• {line}</Text>
        ))}
      </Stack>

      <Glossary />
    </Stack>
  )
}

// ─── Glossary ───────────────────────────────────────────────────────────────

function TermDefinitions({ terms }: { terms: TermId[] }) {
  const { lang } = useLang()
  return (
    <Stack gap={2} bg="bg.muted" rounded="md" p={3} fontSize="sm">
      {terms.map((id) => (
        <Box key={id}>
          <Text fontWeight="semibold">{GLOSSARY[id].name}</Text>
          <Text color="fg.muted">{GLOSSARY[id].def[lang]}</Text>
        </Box>
      ))}
    </Stack>
  )
}

const ALL_TERMS = (Object.keys(GLOSSARY) as TermId[]).sort((a, b) =>
  GLOSSARY[a].name.localeCompare(GLOSSARY[b].name),
)

function Glossary() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  return (
    <Stack gap={3}>
      <Button
        variant="outline"
        colorPalette="gray"
        alignSelf="flex-start"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? t.glossaryHide : `${t.glossaryTitle} (${ALL_TERMS.length})`}
      </Button>
      {open && <TermDefinitions terms={ALL_TERMS} />}
    </Stack>
  )
}

// ─── Form ───────────────────────────────────────────────────────────────────

function AssessmentForm({
  draft,
  onChange,
  onExit,
  onFinish,
}: {
  draft: Draft
  onChange: (d: Draft) => void
  onExit: () => void
  onFinish: (d: Draft) => void
}) {
  const { lang, t } = useLang()
  const category = CATEGORIES[draft.step]
  const ticked = new Set(draft.ticked)
  const isLast = draft.step === CATEGORIES.length - 1
  const catScore = category.positives.filter((i) => ticked.has(i.id)).length

  const toggle = (id: string, on: boolean) => {
    const next = on ? [...draft.ticked.filter((x) => x !== id), id] : draft.ticked.filter((x) => x !== id)
    onChange({ ...draft, ticked: next })
  }

  const goTo = (step: number) => {
    onChange({ ...draft, step })
    window.scrollTo(0, 0)
  }

  return (
    <Stack gap={5}>
      <Stack gap={3}>
        <Flex justify="space-between" align="center" gap={2}>
          <Text fontSize="sm" color="fg.muted">
            {t.stepOf(draft.step + 1, CATEGORIES.length)}
          </Text>
          <Button size="xs" variant="ghost" onClick={onExit}>
            {t.saveExit}
          </Button>
        </Flex>
        <Progress.Root value={((draft.step + 1) / CATEGORIES.length) * 100} size="sm" rounded="full">
          <Progress.Track rounded="full">
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
        <HStack gap={2} wrap="wrap">
          {CATEGORIES.map((c, i) => (
            <Button
              key={c.id}
              size="xs"
              variant={i === draft.step ? 'solid' : 'subtle'}
              colorPalette={i === draft.step ? 'green' : 'gray'}
              onClick={() => goTo(i)}
            >
              {c.emoji} {c.name[lang]}
            </Button>
          ))}
        </HStack>
      </Stack>

      {draft.step === 0 && (
        <Field.Root>
          <Field.Label>{t.nameLabel}</Field.Label>
          <Input
            value={draft.name}
            maxLength={40}
            placeholder={t.namePlaceholder}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
          />
        </Field.Root>
      )}

      <Stack gap={1}>
        <Heading as="h2" size="2xl">
          {category.emoji} {category.name[lang]}
        </Heading>
        <Text color="fg.muted">{category.blurb[lang]}</Text>
      </Stack>

      <Box borderWidth="1px" borderColor="red.muted" bg="red.subtle" rounded="xl" p={4}>
        <Text fontWeight="semibold" color="red.fg">
          {t.redFlagsTitle}
        </Text>
        <Text fontSize="sm" color="fg.muted" mb={3}>
          {t.redFlagsHint}
        </Text>
        <ChecklistGroup items={category.anchors} ticked={ticked} onToggle={toggle} palette="red" />
      </Box>

      <Box borderWidth="1px" rounded="xl" p={4}>
        <Flex justify="space-between" align="baseline" mb={3} gap={2}>
          <Text fontWeight="semibold">{t.skillsTitle}</Text>
          <Text fontSize="sm" color="fg.muted" whiteSpace="nowrap">
            {catScore}/{category.positives.length}
          </Text>
        </Flex>
        <ChecklistGroup items={category.positives} ticked={ticked} onToggle={toggle} palette="green" />
      </Box>

      <Flex gap={3} justify="space-between">
        <Button variant="outline" disabled={draft.step === 0} onClick={() => goTo(draft.step - 1)}>
          {t.back}
        </Button>
        {isLast ? (
          <Button onClick={() => onFinish(draft)}>{t.seeLevel}</Button>
        ) : (
          <Button onClick={() => goTo(draft.step + 1)}>{t.next(CATEGORIES[draft.step + 1].name[lang])}</Button>
        )}
      </Flex>

      <Glossary />
    </Stack>
  )
}

function ChecklistGroup({
  items,
  ticked,
  onToggle,
  palette,
}: {
  items: Item[]
  ticked: Set<string>
  onToggle: (id: string, on: boolean) => void
  palette: 'red' | 'green'
}) {
  const { lang, t } = useLang()
  const [openId, setOpenId] = useState<string | null>(null)
  return (
    <Stack gap={1}>
      {items.map((item) => {
        const open = openId === item.id
        return (
          <Box key={item.id}>
            <Flex align="flex-start" gap={1}>
              <Checkbox.Root
                checked={ticked.has(item.id)}
                onCheckedChange={(e) => onToggle(item.id, e.checked === true)}
                colorPalette={palette}
                alignItems="flex-start"
                flex="1"
                py={1.5}
                px={2}
                ml={-2}
                rounded="md"
                cursor="pointer"
                _hover={{ bg: 'bg.muted' }}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control mt="2px" />
                <Checkbox.Label fontWeight="normal">{item.text[lang]}</Checkbox.Label>
              </Checkbox.Root>
              {item.terms && (
                <IconButton
                  aria-label={t.termsButton}
                  title={t.termsButton}
                  aria-expanded={open}
                  size="xs"
                  rounded="full"
                  variant={open ? 'solid' : 'subtle'}
                  colorPalette={open ? 'green' : 'gray'}
                  mt={1}
                  onClick={() => setOpenId(open ? null : item.id)}
                >
                  ?
                </IconButton>
              )}
            </Flex>
            {open && item.terms && (
              <Box pl={6} pb={2}>
                <TermDefinitions terms={item.terms} />
              </Box>
            )}
          </Box>
        )
      })}
    </Stack>
  )
}

// ─── Result ─────────────────────────────────────────────────────────────────

function ResultView({
  assessment,
  onRetake,
  onHome,
}: {
  assessment: Assessment
  onRetake: () => void
  onHome: () => void
}) {
  const { lang, t } = useLang()
  const result = scoreAssessment(assessment.ticked)
  const band = bandFor(result.level)
  const ticked = new Set(assessment.ticked)
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState<'save' | 'share' | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const withPct = result.categories.map((c) => ({ ...c, pct: c.score / c.max }))
  const sorted = [...withPct].sort((a, b) => b.pct - a.pct)
  const strongest = sorted[0]
  const weakest = sorted[sorted.length - 1]
  const nextSkills = categoryById(weakest.id)
    .positives.filter((i) => !ticked.has(i.id))
    .slice(0, 3)
  const redFlags = result.categories.flatMap((c) => c.anchorsTicked.map((a) => ({ cat: categoryById(c.id), item: a })))
  const nextRow = LEVEL_TABLE.find((row) => row.level > result.rawLevel)
  const pointsToNext = nextRow ? nextRow.min - result.total : 0

  const fileName = `padel-level-${formatLevel(result.level)}.png`
  const shareText = t.shareText(formatLevel(result.level), band.title[lang], result.total, `${window.location.origin}/padel-level`)

  // Square corners and no outer margin in the exported image: transparent rounded
  // corners show up black in some viewers (e.g. WhatsApp).
  const renderOptions = { pixelRatio: 2, cacheBust: true, style: { borderRadius: '0', margin: '0' } }

  // Render the card image as soon as the result (or language) shows, so that tapping
  // Share calls navigator.share while the tap still counts as a user gesture (iOS
  // Safari rejects shares that start after a slow await).
  const blobRef = useRef<Promise<Blob | null> | null>(null)
  useEffect(() => {
    if (!cardRef.current) return
    const pending = toBlob(cardRef.current, renderOptions)
    pending.catch(() => {}) // handled where it's awaited
    blobRef.current = pending
    // renderOptions is constant; re-render only when the card content changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment, lang])
  const getBlob = () =>
    blobRef.current ?? (cardRef.current ? toBlob(cardRef.current, renderOptions) : Promise.resolve(null))

  const saveImage = async () => {
    setBusy('save')
    setMessage(null)
    try {
      const blob = await getBlob()
      if (!blob) throw new Error('no image')
      downloadBlob(blob, fileName)
      setMessage(t.saved)
    } catch {
      setMessage(t.renderFail)
    } finally {
      setBusy(null)
    }
  }

  const shareImage = async () => {
    setBusy('share')
    setMessage(null)
    try {
      const blob = await getBlob()
      if (!blob) throw new Error('no image')
      const file = new File([blob], fileName, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText })
      } else {
        // Desktop browsers usually can't share files: fall back to downloading.
        downloadBlob(blob, fileName)
        setMessage(t.shareFallback)
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setMessage(t.shareFail)
      }
    } finally {
      setBusy(null)
    }
  }

  return (
    <Stack gap={6}>
      <ShareCard ref={cardRef} assessment={assessment} result={result} />

      <Stack gap={2}>
        <HStack gap={2}>
          <Button onClick={shareImage} loading={busy === 'share'} flex={{ base: '1', sm: 'initial' }}>
            {t.shareImage}
          </Button>
          <Button variant="outline" onClick={saveImage} loading={busy === 'save'} flex={{ base: '1', sm: 'initial' }}>
            {t.saveImage}
          </Button>
        </HStack>
        {message && (
          <Text fontSize="sm" color="fg.muted">
            {message}
          </Text>
        )}
      </Stack>

      <Stack gap={4}>
        <Heading as="h2" size="xl">
          {t.summary}
        </Heading>
        <Text>{band.description[lang]}</Text>

        {redFlags.length > 0 && (
          <Box
            borderWidth="1px"
            borderColor={result.capped ? 'red.muted' : 'orange.muted'}
            bg={result.capped ? 'red.subtle' : 'orange.subtle'}
            rounded="xl"
            p={4}
          >
            <Text fontWeight="semibold" color={result.capped ? 'red.fg' : undefined}>
              {result.capped ? t.cappedTitle : t.habitsTitle}
            </Text>
            {result.capped && <Text fontSize="sm">{t.cappedBody(formatLevel(result.rawLevel))}</Text>}
            <Stack gap={1} fontSize="sm" mt={2}>
              {redFlags.map(({ cat, item }) => (
                <Text key={item.id}>
                  • {item.text[lang]}{' '}
                  <Text as="span" color="fg.muted">
                    ({cat.name[lang]})
                  </Text>
                </Text>
              ))}
            </Stack>
          </Box>
        )}

        <Stack gap={3}>
          {strongest.score > 0 && (
            <SummaryRow
              label={t.strongest}
              text={`${categoryById(strongest.id).name[lang]}: ${t.skillsOf(strongest.score, strongest.max)}`}
            />
          )}
          {(weakest.id !== strongest.id || strongest.score === 0) && (
            <SummaryRow
              label={t.focus}
              text={`${categoryById(weakest.id).name[lang]}: ${t.skillsOf(weakest.score, weakest.max)}`}
            />
          )}
          {nextRow && (
            <SummaryRow
              label={t.nextLevel}
              text={
                result.capped
                  ? t.nextCapped(formatLevel(result.rawLevel), pointsToNext, formatLevel(nextRow.level))
                  : t.nextNormal(pointsToNext, formatLevel(nextRow.level))
              }
            />
          )}
        </Stack>

        {nextSkills.length > 0 && (
          <Box borderWidth="1px" rounded="xl" p={4}>
            <Text fontWeight="semibold" mb={2}>
              {t.workOn(categoryById(weakest.id).name[lang])}
            </Text>
            <Stack gap={1} fontSize="sm">
              {nextSkills.map((sk) => (
                <Text key={sk.id}>• {sk.text[lang]}</Text>
              ))}
            </Stack>
          </Box>
        )}

        <Text fontSize="xs" color="fg.subtle">
          {t.disclaimer}
        </Text>
      </Stack>

      <HStack gap={2} wrap="wrap">
        <Button variant="outline" onClick={onRetake}>
          {t.retake}
        </Button>
        <Button variant="ghost" onClick={onHome}>
          {t.backToStart}
        </Button>
      </HStack>
    </Stack>
  )
}

function SummaryRow({ label, text }: { label: string; text: string }) {
  return (
    <Flex gap={3} direction={{ base: 'column', sm: 'row' }}>
      <Text fontWeight="semibold" minW="170px">
        {label}
      </Text>
      <Text>{text}</Text>
    </Flex>
  )
}

// ─── Share card (exported as an image) ──────────────────────────────────────
// Fixed colours (not theme tokens) so the image looks the same in light and dark mode.

function ShareCard({ ref, assessment, result }: { ref: Ref<HTMLDivElement>; assessment: Assessment; result: Result }) {
  const { lang, t } = useLang()
  const band = bandFor(result.level)
  return (
    <Box
      ref={ref}
      w="100%"
      maxW="420px"
      mx="auto"
      rounded="2xl"
      overflow="hidden"
      color="white"
      style={{ background: 'linear-gradient(150deg, #0f5132 0%, #198754 55%, #9acd32 100%)' }}
      p={6}
    >
      <Flex justify="space-between" align="flex-start" gap={3}>
        <Box minW={0}>
          <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" opacity={0.85}>
            {t.cardLabel}
          </Text>
          <Text fontSize="lg" fontWeight="semibold" truncate>
            {assessment.name || t.cardDefaultName}
          </Text>
          <Text fontSize="xs" opacity={0.8}>
            {formatDate(assessment.completedAt, lang)}
          </Text>
        </Box>
        <Text fontSize="3xl" lineHeight="1">
          🎾
        </Text>
      </Flex>

      <Flex align="flex-end" gap={3} mt={5} mb={1}>
        <Text fontSize="7xl" fontWeight="black" lineHeight="0.9" letterSpacing="tighter">
          {formatLevel(result.level)}
        </Text>
        <Box pb={1}>
          <Text fontSize="xl" fontWeight="bold" lineHeight="1.1">
            {band.title[lang]}
          </Text>
          <Text fontSize="sm" opacity={0.85}>
            {t.cardSkills(result.total)}
          </Text>
        </Box>
      </Flex>
      {result.capped && (
        <Text fontSize="xs" opacity={0.9} mb={1}>
          {t.cardCapped(formatLevel(result.rawLevel))}
        </Text>
      )}

      <Stack gap={2.5} mt={5}>
        {result.categories.map((c) => {
          const cat = categoryById(c.id)
          return (
            <Box key={c.id}>
              <Flex justify="space-between" fontSize="sm" mb={1}>
                <Text>
                  {cat.emoji} {cat.name[lang]}
                  {c.anchorsTicked.length > 0 && ' 🚩'}
                </Text>
                <Text fontWeight="semibold">
                  {c.score}/{c.max}
                </Text>
              </Flex>
              <Box h="8px" rounded="full" style={{ background: 'rgba(255,255,255,0.25)' }}>
                <Box h="100%" rounded="full" style={{ width: `${(c.score / c.max) * 100}%`, background: '#ffffff' }} />
              </Box>
            </Box>
          )
        })}
      </Stack>

      <Text fontSize="xs" opacity={0.75} mt={5} textAlign="right">
        fandok.github.io/padel-level
      </Text>
    </Box>
  )
}
