import { createFileRoute } from '@tanstack/react-router'

import { getDocsLLMSIndex } from '@vezham/start/runtime/docs'

import { source } from '@app/docs'
import { markdownDocsRuntime } from '@components/docs/markdown-docs'
import { getPlatformDocsRuntime } from '@components/docs/platform-docs'
import { iconDocsRuntime } from '@src/lib/icon-library/docs'

export const Route = createFileRoute('/(llms)/llms.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(
          [
            source,
            markdownDocsRuntime.source,
            iconDocsRuntime.source,
            getPlatformDocsRuntime('web').source,
            getPlatformDocsRuntime('native').source,
            getPlatformDocsRuntime(undefined, 'react-pro-v3').source,
            getPlatformDocsRuntime('native', 'react-pro-v3').source,
            getPlatformDocsRuntime(undefined, 'react').source
          ]
            .map(getDocsLLMSIndex)
            .join('\n\n')
        )
    }
  }
})
