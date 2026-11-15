import { createSystem, defaultConfig } from '@chakra-ui/react'

// Chakra is scoped to this page only: its CSS reset and global styles apply
// inside `.padel-scope` instead of html/*, so the rest of the site (which uses
// its own CSS) is unaffected.
export const PADEL_SCOPE_CLASS = 'padel-scope'

const scope = `.${PADEL_SCOPE_CLASS}`
const defaultGlobals = defaultConfig.globalCss ?? {}

export const padelSystem = createSystem({
  ...defaultConfig,
  globalCss: {
    [`${scope}, ${scope} *`]: defaultGlobals['*'],
    [scope]: defaultGlobals.html,
    [`${scope} *::placeholder, ${scope} *[data-placeholder]`]: defaultGlobals['*::placeholder, *[data-placeholder]'],
    [`${scope} *::selection`]: defaultGlobals['*::selection'],
  },
  preflight: { scope },
})
