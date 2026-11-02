import { createFileRoute } from '@tanstack/react-router'

import { getPlatformDocsRuntime } from '@components/docs/platform-docs'

export const Route = createFileRoute('/{-$lang}/docs/ui/react/{$}.md')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const runtime = getPlatformDocsRuntime(undefined, 'react')
        const { page } = runtime.getDocsPage({
          slugs: params._splat?.split('/') ?? [],
          lang: params.lang,
          pathFormat: 'markdown-url'
        })

        return new Response(await runtime.getLLMText(page), {
          headers: { 'Content-Type': 'text/markdown' }
        })
      }
    }
  }
})
