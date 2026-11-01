import { platformPagePaths } from '@src/lib/docs/heroui-catalog'

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

export const getPlatformSections = (platform: 'web' | 'native') =>
  platformSections.filter(
    section => platform === 'web' || section.id !== 'migration'
  )

export const getPlatformPage = (platform: 'web' | 'native', page: string) => {
  if (platformPagePaths[platform].includes(page)) return page
  const section = page.split('/')[0]
  return (
    getPlatformSections(platform).find(item => item.id === section)?.page ??
    'getting-started'
  )
}
