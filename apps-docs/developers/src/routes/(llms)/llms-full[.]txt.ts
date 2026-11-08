import { createFileRoute } from '@tanstack/react-router'

import { getLLMText, source } from '@app/docs'
import { markdownDocsRuntime } from '@components/docs/markdown-docs'
import { getPlatformDocsRuntime } from '@components/docs/platform-docs'
import { iconDocsRuntime } from '@src/lib/icon-library/docs'

export const Route = createFileRoute('/(llms)/llms-full.txt')({
  server: {
    handlers: {
      GET: async () => {
        const scanned = await Promise.all([
          ...source.getPages().map(getLLMText),
          ...iconDocsRuntime.source.getPages().map(iconDocsRuntime.getLLMText),
          ...markdownDocsRuntime.source
            .getPages()
            .map(markdownDocsRuntime.getLLMText),
          ...[
            getPlatformDocsRuntime('web'),
            getPlatformDocsRuntime('native'),
            getPlatformDocsRuntime('web', 'react-pro-v3'),
            getPlatformDocsRuntime('native', 'react-pro-v3'),
            getPlatformDocsRuntime(undefined, 'react')
          ].flatMap(runtime =>
            runtime.source.getPages().map(runtime.getLLMText)
          )
        ])

        return new Response(scanned.join('\n\n'))
      }
    }
  }
})
