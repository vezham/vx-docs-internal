import { handbookDocsRuntime } from '@components/docs/handbook-docs'
import { markdownDocsRuntime } from '@components/docs/markdown-docs'
import { getPlatformDocsRuntime } from '@components/docs/platform-docs'
import { type UiLibrary, uiLibraries, uiPlatforms } from '@config/ui-libraries'
import { iconDocsRuntime } from '@src/lib/icon-library/docs'

export const docsRuntimes = [
  handbookDocsRuntime,
  markdownDocsRuntime,
  iconDocsRuntime,
  ...Object.keys(uiLibraries).flatMap(library =>
    (Object.keys(uiPlatforms) as (keyof typeof uiPlatforms)[]).map(platform =>
      getPlatformDocsRuntime(platform, library as UiLibrary)
    )
  )
]
