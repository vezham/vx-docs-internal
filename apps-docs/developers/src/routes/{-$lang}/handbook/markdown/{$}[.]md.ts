import { createFileRoute } from '@tanstack/react-router'

import { decodeMarkdownUrl } from '@vezham/start/runtime/docs'

import { handbookDocsRuntime } from '@components/docs/handbook-docs'

export const Route = createFileRoute('/{-$lang}/handbook/markdown/{$}.md')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { page } = handbookDocsRuntime.getDocsPage({
          slugs: [
            'markdown',
            ...decodeMarkdownUrl(params._splat?.split('/') ?? [])
          ],
          lang: params.lang
        })

        return new Response(await handbookDocsRuntime.getLLMText(page), {
          headers: { 'Content-Type': 'text/markdown' }
        })
      }
    }
  }
})
