import { createFileRoute } from '@tanstack/react-router'

import { getDocsLLMSIndex } from '@vezham/start/runtime/docs'

import { source } from '@app/docs'
import { getPlatformDocsRuntime } from '@components/docs/platform-docs'

export const Route = createFileRoute('/(llms)/llms.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(
          [
            source,
            getPlatformDocsRuntime('web').source,
            getPlatformDocsRuntime('native').source
          ]
            .map(getDocsLLMSIndex)
            .join('\n\n')
        )
    }
  }
})
