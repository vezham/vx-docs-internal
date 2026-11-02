import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/{-$lang}/docs/ui/react-pro-v3/web/$')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/{-$lang}/docs/ui/react-pro-v3/$',
      params: {
        lang: params.lang,
        _splat:
          params._splat === 'get-started' ? 'getting-started' : params._splat
      }
    })
  }
})
