import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/{-$lang}/docs/pro')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/{-$lang}/docs/ui/react-pro-v3/$platform/$',
      params: { lang: params.lang, platform: 'web', _splat: 'getting-started' }
    })
  }
})
