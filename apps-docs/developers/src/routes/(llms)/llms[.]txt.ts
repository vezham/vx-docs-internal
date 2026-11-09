import { createFileRoute } from '@tanstack/react-router'

import { getDocsLLMSIndex } from '@vezham/start/runtime/docs'

import { handbookDocsRuntime } from '@components/docs/handbook-docs'
import { markdownDocsRuntime } from '@components/docs/markdown-docs'
import { getPlatformDocsRuntime } from '@components/docs/platform-docs'
import { iconDocsRuntime } from '@src/lib/icon-library/docs'

export const Route = createFileRoute('/(llms)/llms.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(
          [
            handbookDocsRuntime.source,
            markdownDocsRuntime.source,
            iconDocsRuntime.source,
            getPlatformDocsRuntime('web', 'react-v3').source,
            getPlatformDocsRuntime('native', 'react-v3').source,
            getPlatformDocsRuntime('web', 'react-pro-v3').source,
            getPlatformDocsRuntime('native', 'react-pro-v3').source,
            getPlatformDocsRuntime('web', 'react').source,
            getPlatformDocsRuntime('native', 'react').source
          ]
            .map(getDocsLLMSIndex)
            .join('\n\n')
        )
    }
  }
})
