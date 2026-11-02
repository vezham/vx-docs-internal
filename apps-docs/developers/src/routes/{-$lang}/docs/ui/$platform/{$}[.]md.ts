import { createFileRoute } from '@tanstack/react-router'

import { i18n } from '@app/docs'

export const Route = createFileRoute('/{-$lang}/docs/ui/$platform/{$}.md')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        if (params.platform !== 'web' && params.platform !== 'native')
          return new Response(null, { status: 404 })

        const locale =
          params.lang && params.lang !== i18n.defaultLanguage
            ? `/${params.lang}`
            : ''
        const target = `${locale}/docs/ui/react-v3/${params.platform}/${params._splat ?? ''}.md`
        return Response.redirect(new URL(target, request.url), 308)
      }
    }
  }
})
