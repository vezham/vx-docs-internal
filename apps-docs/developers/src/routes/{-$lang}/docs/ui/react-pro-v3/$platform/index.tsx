import { createFileRoute, notFound, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/{-$lang}/docs/ui/react-pro-v3/$platform/'
)({
  beforeLoad: ({ params }) => {
    if (params.platform !== 'web' && params.platform !== 'native')
      throw notFound()
    throw redirect({
      to: '/{-$lang}/docs/ui/react-pro-v3/$platform/$',
      params: { ...params, _splat: 'getting-started' }
    })
  }
})
