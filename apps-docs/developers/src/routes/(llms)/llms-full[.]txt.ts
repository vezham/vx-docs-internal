import { createFileRoute } from '@tanstack/react-router'

import { getLLMText, source } from '@app/docs'
import { getPlatformDocsRuntime } from '@components/docs/platform-docs'

export const Route = createFileRoute('/(llms)/llms-full.txt')({
  server: {
    handlers: {
      GET: async () => {
        const scanned = await Promise.all([
          ...source.getPages().map(getLLMText),
          ...(['web', 'native'] as const).flatMap(platform => {
            const runtime = getPlatformDocsRuntime(platform)
            return runtime.source.getPages().map(runtime.getLLMText)
          })
        ])

        return new Response(scanned.join('\n\n'))
      }
    }
  }
})
