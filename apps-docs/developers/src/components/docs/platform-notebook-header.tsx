import type { ComponentPropsWithoutRef } from 'react'

import { ControlCenter } from '@components/docs/control-center'
import {
  LibrarySelector,
  type UiLibrary
} from '@components/docs/library-selector'
import { NotebookHeader } from '@components/docs/notebook-header'
import type { PlatformSection } from '@components/docs/platform-sections'
import { SectionTabs } from '@components/docs/section-tabs'
import type { Locale } from '@generated/vx'

type Props = ComponentPropsWithoutRef<'header'> & {
  library?: UiLibrary
  locale: Locale
  page: string
  platform: 'web' | 'native'
  selectedSection: PlatformSection
}

export const PlatformNotebookHeader = ({
  library = 'react',
  locale,
  page,
  platform,
  selectedSection,
  ...props
}: Props) => {
  return (
    <NotebookHeader
      {...props}
      locale={locale}
      leading={<LibrarySelector library={library} locale={locale} />}
      controls={
        <ControlCenter
          library={library}
          locale={locale}
          page={page}
          platform={platform}
        />
      }>
      <SectionTabs
        library={library}
        locale={locale}
        platform={platform}
        selectedSection={selectedSection}
      />
    </NotebookHeader>
  )
}
