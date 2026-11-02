import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/{-$lang}/docs/ui/react-v3/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/{-$lang}/docs/ui/react-v3/$platform/$',
      params: { lang: params.lang, platform: 'web' }
    })
  }
})
