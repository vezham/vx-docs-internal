import { createFileRoute } from '@tanstack/react-router'

import { handbookDocsRuntime } from '@components/docs/handbook-docs'

export const Route = createFileRoute('/{-$lang}/handbook/{$}.md')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { page } = handbookDocsRuntime.getDocsPage({
          slugs: params._splat?.split('/') ?? [],
          lang: params.lang,
          pathFormat: 'markdown-url'
        })

        return new Response(await handbookDocsRuntime.getLLMText(page), {
          headers: { 'Content-Type': 'text/markdown' }
        })
      }
    }
  }
})
