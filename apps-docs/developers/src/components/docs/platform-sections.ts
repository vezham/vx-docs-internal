import type { UiLibrary } from '@components/docs/library-selector'
import { platformPagePaths } from '@src/lib/docs/heroui-catalog'
import nativeProGallery from '@src/lib/docs/heroui-pro-native-presentation.json'
import proGallery from '@src/lib/docs/heroui-pro-presentation.json'

const platformSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    prefix: 'getting-started',
    page: 'getting-started'
  },
  {
    id: 'components',
    title: 'Components',
    prefix: 'components',
    page: 'components'
  },
  {
    id: 'releases',
    title: 'Releases',
    prefix: 'releases',
    page: 'releases'
  },
  {
    id: 'migration',
    title: 'Migration',
    prefix: 'migration',
    page: 'migration'
  }
] as const

export type PlatformSection = (typeof platformSections)[number]['id']

const librarySections = {
  'react-v3': platformSections,
  'react-pro-v3': [platformSections[0], platformSections[1]],
  react: [platformSections[0]]
} as const

export const getPlatformSections = (
  platform: 'web' | 'native',
  library: UiLibrary = 'react-v3'
) =>
  librarySections[library].filter(
    section => platform === 'web' || section.id !== 'migration'
  )

export const getPlatformPage = (
  platform: 'web' | 'native',
  page: string,
  library: UiLibrary = 'react-v3'
) => {
  const pages =
    library === 'react-pro-v3'
      ? (platform === 'native' ? nativeProGallery : proGallery).pagePaths
      : platformPagePaths[platform]
  if (pages.includes(page)) return page
  const section = page.split('/')[0]
  return (
    getPlatformSections(platform, library).find(item => item.id === section)
      ?.page ?? 'getting-started'
  )
}
