import { createFileRoute } from '@tanstack/react-router'

import { getDocsLLMSIndex } from '@vezham/start/runtime/docs'

import { source } from '@app/docs'
import { markdownDocsRuntime } from '@components/docs/markdown-docs'
import { getPlatformDocsRuntime } from '@components/docs/platform-docs'

export const Route = createFileRoute('/(llms)/llms.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(
          [
            source,
            markdownDocsRuntime.source,
            getPlatformDocsRuntime('web').source,
            getPlatformDocsRuntime('native').source
          ]
            .map(getDocsLLMSIndex)
            .join('\n\n')
        )
    }
  }
})
