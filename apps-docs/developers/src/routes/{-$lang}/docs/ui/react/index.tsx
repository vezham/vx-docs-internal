import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/{-$lang}/docs/ui/react/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/{-$lang}/docs/ui/react/$platform/$',
      params: { lang: params.lang, platform: 'web', _splat: 'getting-started' }
    })
  }
})
