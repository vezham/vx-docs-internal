import type { DocsLayoutProps } from '@vezham/start/layouts/docs'
import { localizedUrl } from '@vezham/start/runtime/docs'

import { i18n } from '@app/docs'
import type { UiLibrary } from '@components/docs/library-selector'
import {
  PlatformDrawerFooter,
  PlatformDrawerHeader
} from '@components/docs/platform-drawer'
import { PlatformNotebookHeader } from '@components/docs/platform-notebook-header'
import {
  type PlatformSection,
  getPlatformSections
} from '@components/docs/platform-sections'
import { PlatformTabs } from '@components/docs/platform-tabs'
import { baseOptions } from '@config/layout'
import type { Locale } from '@generated/vx'

type Platform = 'web' | 'native'

type Options = {
  library?: UiLibrary
  locale: Locale
  page: string
  platform: Platform
  platforms: readonly Platform[]
  selectedSection: PlatformSection
  getPlatformParams: (platform: Platform) => {
    lang: string | undefined
    platform: Platform
    _splat: string
  }
  onSectionChange: (section: PlatformSection) => void
}

export const getPlatformLayoutOptions = ({
  library = 'react',
  locale,
  page,
  platform,
  platforms,
  selectedSection,
  getPlatformParams,
  onSectionChange
}: Options): Omit<DocsLayoutProps, 'children' | 'shell' | 'tree'> => ({
  ...baseOptions(locale),
  nav: {
    title: 'Developer Docs | Vezham',
    mode: 'top',
    children: (
      <PlatformTabs
        library={library}
        getPlatformParams={getPlatformParams}
        platform={platform}
        platforms={platforms}
      />
    )
  },
  sidebar: {
    banner: props => (
      <PlatformDrawerHeader
        {...props}
        library={library}
        getPlatformParams={getPlatformParams}
        locale={locale}
        platform={platform}
        platforms={platforms}
        selectedSection={selectedSection}
        onSectionChange={onSectionChange}
      />
    ),
    footer: props => (
      <PlatformDrawerFooter
        {...props}
        library={library}
        getPlatformParams={getPlatformParams}
        locale={locale}
        page={page}
        platform={platform}
        platforms={platforms}
      />
    )
  },
  tabMode: 'navbar',
  slots: {
    header: props => (
      <PlatformNotebookHeader
        {...props}
        library={library}
        locale={locale}
        page={page}
        platform={platform}
        selectedSection={selectedSection}
      />
    )
  },
  tabs: getPlatformSections(platform, library).map(item => ({
    title: item.title,
    url: localizedUrl(
      i18n,
      locale,
      `/docs/ui/${library}/${platform}/${item.page}`
    ),
    urls:
      item.id === selectedSection
        ? new Set([
            localizedUrl(
              i18n,
              locale,
              `/docs/ui/${library}/${platform}/${page}`
            )
          ])
        : undefined
  }))
})
