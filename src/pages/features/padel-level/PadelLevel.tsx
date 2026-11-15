import { useRef, useState, useSyncExternalStore, type Ref } from 'react'
import { Link as RouterLink } from 'react-router-dom'
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
  Input,
  Link,
  Progress,
  Stack,
  Text,
} from '@chakra-ui/react'
import { toBlob, toPng } from 'html-to-image'
import { PADEL_SCOPE_CLASS, padelSystem } from './chakraSystem'

// ─── Data ───────────────────────────────────────────────────────────────────
// Based on a coach's padel levelling score sheet: 4 categories, each with
// "anchors" (red flags that cap the level at 2.5) and positives (+1 each).

type CategoryId = 'tactics' | 'technique' | 'movement' | 'wall'
type Item = { id: string; text: string }
type Category = {
  id: CategoryId
  name: string
  emoji: string
  blurb: string
  anchors: Item[]
  positives: Item[]
}

const items = (prefix: string, texts: string[]): Item[] =>
  texts.map((text, i) => ({ id: `${prefix}${i + 1}`, text }))

const CATEGORIES: Category[] = [
  {
    id: 'tactics',
    name: 'Tactics',
    emoji: '🧠',
    blurb: 'Positioning, shot choice and playing as a team.',
    anchors: items('tac-a', [
      'Stays back after serve, avoids the net',
      "Doesn't understand areas of play, stays in no man's land",
      'Hits every ball at max speed',
    ]),
    positives: items('tac-p', [
      'Attempts the net after a serve or short ball',
      'Uses the lob to gain the net',
      'Communicates with partner (calls, positioning)',
      'Changes direction of serve',
      'Controls tempo, e.g. resets the point with a lob to regain position',
      'Moves opponents and plays to the gap, or creates gaps',
      'Sustains net play with construction',
      'Moves together with partner (back–forward and laterally)',
      'Able to play safe when under pressure',
      'Targets the weaker opponent',
      "Anticipates the opponent's next shot",
      'Plays mainly cross-court / middle, changes direction for winners',
    ]),
  },
  {
    id: 'technique',
    name: 'Technique',
    emoji: '🎾',
    blurb: 'Stroke quality from the baseline to the net.',
    anchors: items('tec-a', [
      'Contact behind the body / late preparation',
      "Doesn't hit a real backhand, twists the wrist",
      'Slices every ball, even low ones',
    ]),
    positives: items('tec-p', [
      'Delivers the forehand consistently',
      'Delivers the backhand consistently',
      'Serves high to low',
      'Lobs high, contact point underneath the ball',
      'Plays volleys (FH & BH) with depth, high-to-low contact, extending after the hit',
      'Can play a bandeja consistently',
      'Drop shot / chiquita is effective',
      'Flat ball trajectory with low-to-high swings on groundstrokes',
      'Able to slice volleys when given the opportunity',
      'Bajada is accurate',
      'Can play a víbora',
      'Executes advanced shots (gancho, chiquita, rulo)',
    ]),
  },
  {
    id: 'movement',
    name: 'Movement',
    emoji: '👟',
    blurb: 'Footwork, court coverage and moving with your partner.',
    anchors: items('mov-a', [
      'Relies on lunges, no adjustment steps',
      'Backpedals on lobs',
      'No consistent ready position',
    ]),
    positives: items('mov-p', [
      'Always in a ready / athletic position',
      'Covers the court with shuffle / side steps',
      'Recovers to position proactively after each shot',
      'Uses small steps to adjust before contact',
      'Reads play early, moves proactively',
      'Moves in sync with partner',
      'Covers the middle when partner is wide',
      'Poaches / intercepts at the net',
      'Explosive coverage, quick recovery',
      'Anticipates 1–2 shots ahead',
    ]),
  },
  {
    id: 'wall',
    name: 'Wall skills',
    emoji: '🧱',
    blurb: 'Playing the back and side glass.',
    anchors: items('wal-a', [
      'Boasts every time without attempting to rotate',
      'Faces the wall and lacks one extra step, ending up hitting backwards',
      'Constantly avoids playing off the wall',
    ]),
    positives: items('wal-p', [
      'Reliable forehand off the back glass',
      'Reliable backhand off the back glass',
      'Controls the side-glass rebound',
      "Attempts the double glass (doesn't give up halfway, tries to reach the ball)",
      'Can play the double glass effectively',
      'Reads spin / angles (e.g. a sliced ball drops)',
      'Able to execute a bajada after a lob off the back glass',
      'Able to execute a chiquita off the glass to the feet',
      'Understands when to let the ball come off the wall',
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

const LEVEL_BANDS: { upTo: number; title: string; description: string }[] = [
  {
    upTo: 1.5,
    title: 'Beginner',
    description:
      'You are learning the basics: getting the ball back, understanding the court and starting to use the walls.',
  },
  {
    upTo: 2.5,
    title: 'Improver',
    description:
      'You can rally and enjoy matches. The next jump comes from owning the net, cleaner strokes and fixing any red-flag habits.',
  },
  {
    upTo: 3.5,
    title: 'Intermediate',
    description:
      'Solid fundamentals and a real game plan. Consistency off the glass and overheads like the bandeja separate you from the next level.',
  },
  {
    upTo: 4.5,
    title: 'Advanced',
    description:
      'You build points, move as a pair and have a full set of overheads. Refinement and decision-making under pressure are your growth areas.',
  },
  {
    upTo: 5.5,
    title: 'Expert',
    description:
      'Competition-level padel: advanced shots, anticipation and tactical control. Keep sharpening the details.',
  },
]

const ALL_ITEM_IDS = new Set(CATEGORIES.flatMap((c) => [...c.anchors, ...c.positives].map((i) => i.id)))

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Storage ────────────────────────────────────────────────────────────────

const DRAFT_KEY = 'padel-level:v1:draft'
const LAST_KEY = 'padel-level:v1:last'

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
    updatedAt: typeof d.updatedAt === 'string' ? d.updatedAt : new Date().toISOString(),
  }
}

function loadLast(): Assessment | null {
  const a = readJson(LAST_KEY) as Partial<Assessment> | null
  if (!a || typeof a !== 'object' || typeof a.completedAt !== 'string') return null
  return { name: typeof a.name === 'string' ? a.name : '', ticked: cleanTicked(a.ticked), completedAt: a.completedAt }
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
  const [view, setView] = useState<View>('intro')
  const [draft, setDraft] = useState<Draft | null>(loadDraft)
  const [last, setLast] = useState<Assessment | null>(loadLast)
  const [shown, setShown] = useState<Assessment | null>(null)

  const updateDraft = (next: Draft | null) => {
    setDraft(next)
    writeJson(DRAFT_KEY, next)
  }

  const startNew = () => {
    updateDraft({ name: last?.name ?? '', ticked: [], step: 0, updatedAt: new Date().toISOString() })
    setView('form')
    window.scrollTo(0, 0)
  }

  const finish = (d: Draft) => {
    const assessment: Assessment = { name: d.name.trim(), ticked: d.ticked, completedAt: new Date().toISOString() }
    setLast(assessment)
    writeJson(LAST_KEY, assessment)
    updateDraft(null)
    setShown(assessment)
    setView('result')
    window.scrollTo(0, 0)
  }

  return (
    <ChakraProvider value={padelSystem}>
      <Box
        className={`${PADEL_SCOPE_CLASS}${dark ? ' dark' : ''}`}
        bg="bg"
        color="fg"
        textAlign="left"
        flex="1"
        colorPalette="green"
        style={{ colorScheme: dark ? 'dark' : 'light' }}
      >
        <Box maxW="720px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 5, md: 8 }}>
          <Link asChild fontSize="sm" color="fg.muted" mb={4}>
            <RouterLink to="/">← fandok's lab</RouterLink>
          </Link>

          {view === 'intro' && (
            <Intro
              draft={draft}
              last={last}
              onStart={startNew}
              onResume={() => {
                setView('form')
                window.scrollTo(0, 0)
              }}
              onViewLast={() => {
                setShown(last)
                setView('result')
                window.scrollTo(0, 0)
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
    </ChakraProvider>
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
  const lastResult = last ? scoreAssessment(last.ticked) : null

  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <Text fontSize="4xl" lineHeight="1">🎾</Text>
        <Heading as="h1" size={{ base: '3xl', md: '4xl' }} letterSpacing="tight">
          What's my padel level?
        </Heading>
        <Text color="fg.muted" fontSize="lg">
          A quick self-assessment based on a coach's levelling score sheet. Tick what's true about your
          game across tactics, technique, movement and wall skills, and get a level from 1.0 to 5.5 you can
          share with your padel group.
        </Text>
      </Stack>

      <HStack gap={2} wrap="wrap">
        {CATEGORIES.map((c) => (
          <Badge key={c.id} size="lg" variant="subtle" colorPalette="gray">
            {c.emoji} {c.name}
          </Badge>
        ))}
      </HStack>

      {draft && (
        <Box borderWidth="1px" borderColor="orange.muted" bg="orange.subtle" rounded="xl" p={4}>
          <Text fontWeight="semibold">You have an unfinished assessment</Text>
          <Text fontSize="sm" color="fg.muted" mb={3}>
            Saved {formatDate(draft.updatedAt)} · step {draft.step + 1} of {CATEGORIES.length} ·{' '}
            {draft.ticked.length} item{draft.ticked.length === 1 ? '' : 's'} ticked
          </Text>
          <HStack gap={2} wrap="wrap">
            <Button colorPalette="orange" onClick={onResume}>
              Continue draft
            </Button>
            <Button variant="outline" onClick={onStart}>
              Start over
            </Button>
          </HStack>
        </Box>
      )}

      {!draft && (
        <Button size="xl" onClick={onStart} alignSelf={{ base: 'stretch', sm: 'flex-start' }}>
          Start assessment
        </Button>
      )}

      {last && lastResult && (
        <Box borderWidth="1px" rounded="xl" p={4}>
          <Text fontSize="sm" color="fg.muted">
            Your last result · {formatDate(last.completedAt)}
          </Text>
          <Flex align="center" justify="space-between" gap={3} mt={1} wrap="wrap">
            <Text fontSize="2xl" fontWeight="bold">
              Level {formatLevel(lastResult.level)}{' '}
              <Text as="span" fontSize="md" fontWeight="normal" color="fg.muted">
                · {bandFor(lastResult.level).title} · {lastResult.total}/{MAX_SCORE}
              </Text>
            </Text>
            <Button variant="outline" onClick={onViewLast}>
              View result
            </Button>
          </Flex>
        </Box>
      )}

      <Stack gap={2} fontSize="sm" color="fg.muted">
        <Text fontWeight="semibold" color="fg">
          How it works
        </Text>
        <Text>• Each positive skill you tick is worth 1 point, out of {MAX_SCORE}.</Text>
        <Text>
          • Each category also lists <b>red flags</b>. Tick any that apply: one or more caps your level at{' '}
          {formatLevel(ANCHOR_CAP)} until you fix it.
        </Text>
        <Text>• Your progress is saved on this device, so you can leave and come back.</Text>
        <Text>• Be honest: tick a skill only if you do it reliably in matches, not just sometimes.</Text>
      </Stack>
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
  const category = CATEGORIES[draft.step]
  const ticked = new Set(draft.ticked)
  const isLast = draft.step === CATEGORIES.length - 1
  const catScore = category.positives.filter((i) => ticked.has(i.id)).length

  const toggle = (id: string, on: boolean) => {
    const next = on ? [...draft.ticked.filter((t) => t !== id), id] : draft.ticked.filter((t) => t !== id)
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
            Step {draft.step + 1} of {CATEGORIES.length} · draft saved automatically
          </Text>
          <Button size="xs" variant="ghost" onClick={onExit}>
            Save &amp; exit
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
              {c.emoji} {c.name}
            </Button>
          ))}
        </HStack>
      </Stack>

      {draft.step === 0 && (
        <Field.Root>
          <Field.Label>Your name (optional, shown on the share image)</Field.Label>
          <Input
            value={draft.name}
            maxLength={40}
            placeholder="e.g. Fandi"
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
          />
        </Field.Root>
      )}

      <Stack gap={1}>
        <Heading as="h2" size="2xl">
          {category.emoji} {category.name}
        </Heading>
        <Text color="fg.muted">{category.blurb}</Text>
      </Stack>

      <Box borderWidth="1px" borderColor="red.muted" bg="red.subtle" rounded="xl" p={4}>
        <Text fontWeight="semibold" color="red.fg">
          🚩 Red flags: tick any that sound like you
        </Text>
        <Text fontSize="sm" color="fg.muted" mb={3}>
          Any red flag caps your level at {formatLevel(ANCHOR_CAP)}. Leave these empty if they don't apply.
        </Text>
        <ChecklistGroup items={category.anchors} ticked={ticked} onToggle={toggle} palette="red" />
      </Box>

      <Box borderWidth="1px" rounded="xl" p={4}>
        <Flex justify="space-between" align="baseline" mb={3} gap={2}>
          <Text fontWeight="semibold">✅ Skills you do reliably (+1 each)</Text>
          <Text fontSize="sm" color="fg.muted" whiteSpace="nowrap">
            {catScore}/{category.positives.length}
          </Text>
        </Flex>
        <ChecklistGroup items={category.positives} ticked={ticked} onToggle={toggle} palette="green" />
      </Box>

      <Flex gap={3} justify="space-between">
        <Button variant="outline" disabled={draft.step === 0} onClick={() => goTo(draft.step - 1)}>
          ← Back
        </Button>
        {isLast ? (
          <Button onClick={() => onFinish(draft)}>See my level →</Button>
        ) : (
          <Button onClick={() => goTo(draft.step + 1)}>Next: {CATEGORIES[draft.step + 1].name} →</Button>
        )}
      </Flex>
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
  return (
    <Stack gap={1}>
      {items.map((item) => (
        <Checkbox.Root
          key={item.id}
          checked={ticked.has(item.id)}
          onCheckedChange={(e) => onToggle(item.id, e.checked === true)}
          colorPalette={palette}
          alignItems="flex-start"
          py={1.5}
          px={2}
          mx={-2}
          rounded="md"
          cursor="pointer"
          _hover={{ bg: 'bg.muted' }}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control mt="2px" />
          <Checkbox.Label fontWeight="normal">{item.text}</Checkbox.Label>
        </Checkbox.Root>
      ))}
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
  const shareText = `My padel level: ${formatLevel(result.level)} (${band.title}) · ${result.total}/${MAX_SCORE}. Check yours: ${window.location.origin}/padel-level`

  const renderOptions = { pixelRatio: 2, cacheBust: true }

  const saveImage = async () => {
    if (!cardRef.current) return
    setBusy('save')
    setMessage(null)
    try {
      const dataUrl = await toPng(cardRef.current, renderOptions)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = fileName
      a.click()
      setMessage('Image saved. Share it from your gallery or downloads.')
    } catch {
      setMessage("Couldn't create the image. Try taking a screenshot instead.")
    } finally {
      setBusy(null)
    }
  }

  const shareImage = async () => {
    if (!cardRef.current) return
    setBusy('share')
    setMessage(null)
    try {
      const blob = await toBlob(cardRef.current, renderOptions)
      if (!blob) throw new Error('no image')
      const file = new File([blob], fileName, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText })
      } else {
        // Desktop browsers usually can't share files: fall back to downloading.
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
        URL.revokeObjectURL(url)
        setMessage("Your browser can't share images directly, so the image was downloaded instead.")
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setMessage("Couldn't share the image. Try Save image or a screenshot.")
      }
    } finally {
      setBusy(null)
    }
  }

  return (
    <Stack gap={6}>
      <ShareCard ref={cardRef} assessment={assessment} result={result} />

      <Stack gap={2}>
        <HStack gap={2} wrap="wrap">
          <Button onClick={shareImage} loading={busy === 'share'} flex={{ base: '1', sm: 'initial' }}>
            Share image
          </Button>
          <Button variant="outline" onClick={saveImage} loading={busy === 'save'} flex={{ base: '1', sm: 'initial' }}>
            Save image
          </Button>
          <Button asChild variant="subtle" colorPalette="gray" flex={{ base: '1 1 100%', sm: 'initial' }}>
            <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer">
              Send as WhatsApp text
            </a>
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
          Summary
        </Heading>
        <Text>{band.description}</Text>

        {result.capped && (
          <Box borderWidth="1px" borderColor="red.muted" bg="red.subtle" rounded="xl" p={4}>
            <Text fontWeight="semibold" color="red.fg">
              🚩 Capped at {formatLevel(ANCHOR_CAP)} by red flags
            </Text>
            <Text fontSize="sm" mb={2}>
              Your skills alone score level <b>{formatLevel(result.rawLevel)}</b>, but these habits hold you back. Fix
              them first:
            </Text>
            <Stack gap={1} fontSize="sm">
              {redFlags.map(({ cat, item }) => (
                <Text key={item.id}>
                  • {item.text} <Text as="span" color="fg.muted">({cat.name})</Text>
                </Text>
              ))}
            </Stack>
          </Box>
        )}

        {!result.capped && redFlags.length > 0 && (
          <Box borderWidth="1px" borderColor="orange.muted" bg="orange.subtle" rounded="xl" p={4}>
            <Text fontWeight="semibold">🚩 Habits to fix before moving past {formatLevel(ANCHOR_CAP)}</Text>
            <Stack gap={1} fontSize="sm" mt={1}>
              {redFlags.map(({ cat, item }) => (
                <Text key={item.id}>
                  • {item.text} <Text as="span" color="fg.muted">({cat.name})</Text>
                </Text>
              ))}
            </Stack>
          </Box>
        )}

        <Stack gap={3}>
          <SummaryRow
            label="💪 Strongest area"
            text={`${categoryById(strongest.id).name}: ${strongest.score}/${strongest.max} skills.`}
          />
          {weakest.id !== strongest.id && (
            <SummaryRow
              label="🎯 Focus area"
              text={`${categoryById(weakest.id).name}: ${weakest.score}/${weakest.max} skills.`}
            />
          )}
          {nextRow && (
            <SummaryRow
              label="📈 Next level"
              text={
                result.capped
                  ? `Clear your red flags to unlock ${formatLevel(result.rawLevel)}; ${pointsToNext} more skill${pointsToNext === 1 ? '' : 's'} would take you to ${formatLevel(nextRow.level)}.`
                  : `${pointsToNext} more skill${pointsToNext === 1 ? '' : 's'} to reach level ${formatLevel(nextRow.level)}.`
              }
            />
          )}
        </Stack>

        {nextSkills.length > 0 && (
          <Box borderWidth="1px" rounded="xl" p={4}>
            <Text fontWeight="semibold" mb={2}>
              Skills to work on next ({categoryById(weakest.id).name})
            </Text>
            <Stack gap={1} fontSize="sm">
              {nextSkills.map((s) => (
                <Text key={s.id}>• {s.text}</Text>
              ))}
            </Stack>
          </Box>
        )}

        <Text fontSize="xs" color="fg.subtle">
          This is a self-assessment, not an official rating. For an accurate level, ask a coach to fill the same
          sheet while watching you play.
        </Text>
      </Stack>

      <HStack gap={2} wrap="wrap">
        <Button variant="outline" onClick={onRetake}>
          Retake assessment
        </Button>
        <Button variant="ghost" onClick={onHome}>
          Back to start
        </Button>
      </HStack>
    </Stack>
  )
}

function SummaryRow({ label, text }: { label: string; text: string }) {
  return (
    <Flex gap={3} direction={{ base: 'column', sm: 'row' }}>
      <Text fontWeight="semibold" minW="150px">
        {label}
      </Text>
      <Text>{text}</Text>
    </Flex>
  )
}

// ─── Share card (exported as an image) ──────────────────────────────────────
// Fixed colours (not theme tokens) so the image looks the same in light and dark mode.

function ShareCard({
  ref,
  assessment,
  result,
}: {
  ref: Ref<HTMLDivElement>
  assessment: Assessment
  result: Result
}) {
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
            Padel level
          </Text>
          <Text fontSize="lg" fontWeight="semibold" truncate>
            {assessment.name || 'My assessment'}
          </Text>
          <Text fontSize="xs" opacity={0.8}>
            {formatDate(assessment.completedAt)}
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
            {band.title}
          </Text>
          <Text fontSize="sm" opacity={0.85}>
            {result.total}/{MAX_SCORE} skills
          </Text>
        </Box>
      </Flex>
      {result.capped && (
        <Text fontSize="xs" opacity={0.9} mb={1}>
          🚩 Capped by red flags (skills score {formatLevel(result.rawLevel)})
        </Text>
      )}

      <Stack gap={2.5} mt={5}>
        {result.categories.map((c) => {
          const cat = categoryById(c.id)
          return (
            <Box key={c.id}>
              <Flex justify="space-between" fontSize="sm" mb={1}>
                <Text>
                  {cat.emoji} {cat.name}
                  {c.anchorsTicked.length > 0 && ' 🚩'}
                </Text>
                <Text fontWeight="semibold">
                  {c.score}/{c.max}
                </Text>
              </Flex>
              <Box h="8px" rounded="full" style={{ background: 'rgba(255,255,255,0.25)' }}>
                <Box
                  h="100%"
                  rounded="full"
                  style={{ width: `${(c.score / c.max) * 100}%`, background: '#ffffff' }}
                />
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
