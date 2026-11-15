import { createSystem, defaultConfig } from '@chakra-ui/react'

// Chakra is scoped to this page only: its CSS reset applies inside `.padel-scope`
// and its default html/body global styles are dropped, so the rest of the site
// (which uses its own CSS) is unaffected.
export const PADEL_SCOPE_CLASS = 'padel-scope'

export const padelSystem = createSystem({
  ...defaultConfig,
  globalCss: {},
  preflight: { scope: `.${PADEL_SCOPE_CLASS}` },
})
