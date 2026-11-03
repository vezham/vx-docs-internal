import type { UiLibrary } from '@components/docs/library-selector'

const uiLibraryRoutes = {
  'react-v3': '/{-$lang}/docs/ui/react-v3/$platform/$',
  'react-pro-v3': '/{-$lang}/docs/ui/react-pro-v3/$',
  react: '/{-$lang}/docs/ui/react/$'
} as const satisfies Record<UiLibrary, string>

export const getUiLibraryRoute = (
  library: UiLibrary,
  platform: 'web' | 'native'
) =>
  library === 'react-pro-v3' && platform === 'native'
    ? '/{-$lang}/docs/ui/react-pro-v3/native/$'
    : uiLibraryRoutes[library]
