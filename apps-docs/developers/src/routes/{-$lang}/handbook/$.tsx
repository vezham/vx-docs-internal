import { createFileRoute } from '@tanstack/react-router'

import {
  HandbookTodoPage,
  getHandbookTodoTree
} from '@components/docs/handbook-docs-shell'

const RouteComponent = () => {
  const { _splat } = Route.useParams()
  const data = Route.useLoaderData()
  const segments = _splat?.split('/') ?? []
  const pageName = segments[segments.length - 1] ?? 'Handbook'
  const title = pageName
    .split('-')
    .map(part => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')

  return (
    <HandbookTodoPage
      locale={data.locale}
      page={_splat ?? 'get-started'}
      selectedSection="get-started"
      title={title}
      tree={data.tree}
    />
  )
}

export const Route = createFileRoute('/{-$lang}/handbook/$')({
  component: RouteComponent,
  loader: ({ params }) => getHandbookTodoTree(params.lang),
  head: ({ params }) => ({
    meta: [{ title: `${params._splat ?? 'Handbook'} | Developer` }]
  })
})
