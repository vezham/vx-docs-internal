import { createFileRoute, redirect } from '@tanstack/react-router'

const RouteComponent = () => {
  return null
}

export const Route = createFileRoute('/{-$lang}/handbook/')({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/{-$lang}/handbook/$',
      params: { lang: params.lang, _splat: 'get-started' }
    })
  },
  head: () => ({ meta: [{ title: 'Handbook | Developer' }] })
})
