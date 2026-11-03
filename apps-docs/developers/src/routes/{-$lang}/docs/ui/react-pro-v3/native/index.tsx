import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/{-$lang}/docs/ui/react-pro-v3/native/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/{-$lang}/docs/ui/react-pro-v3/native/$',
      params: { ...params, _splat: 'getting-started' }
    })
  }
})
