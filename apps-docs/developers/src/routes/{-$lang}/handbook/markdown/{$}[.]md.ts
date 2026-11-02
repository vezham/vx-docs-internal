import { createFileRoute } from '@tanstack/react-router'

import { markdownDocsRuntime } from '@components/docs/markdown-docs'

export const Route = createFileRoute('/{-$lang}/handbook/markdown/{$}.md')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { page } = markdownDocsRuntime.getDocsPage({
          slugs: params._splat?.split('/') ?? [],
          lang: params.lang,
          pathFormat: 'markdown-url'
        })

        return new Response(await markdownDocsRuntime.getLLMText(page), {
          headers: { 'Content-Type': 'text/markdown' }
        })
      }
    }
  }
})
