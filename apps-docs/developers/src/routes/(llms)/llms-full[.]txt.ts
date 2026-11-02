import { createFileRoute } from '@tanstack/react-router'

import { getLLMText, source } from '@app/docs'
import { markdownDocsRuntime } from '@components/docs/markdown-docs'
import { getPlatformDocsRuntime } from '@components/docs/platform-docs'

export const Route = createFileRoute('/(llms)/llms-full.txt')({
  server: {
    handlers: {
      GET: async () => {
        const scanned = await Promise.all([
          ...source.getPages().map(getLLMText),
          ...markdownDocsRuntime.source
            .getPages()
            .map(markdownDocsRuntime.getLLMText),
          ...(['web', 'native'] as const).flatMap(platform => {
            const runtime = getPlatformDocsRuntime(platform)
            return runtime.source.getPages().map(runtime.getLLMText)
          }),
          ...(['react-pro-v3', 'react'] as const).flatMap(library => {
            const runtime = getPlatformDocsRuntime(undefined, library)
            return runtime.source.getPages().map(runtime.getLLMText)
          })
        ])

        return new Response(scanned.join('\n\n'))
      }
    }
  }
})
