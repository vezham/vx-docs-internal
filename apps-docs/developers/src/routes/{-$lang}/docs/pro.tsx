import { createFileRoute } from '@tanstack/react-router'

import {
  NotebookTodoPage,
  getDocsTodoTree
} from '@components/docs/handbook-docs-shell'

const RouteComponent = () => {
  const data = Route.useLoaderData()
  return (
    <NotebookTodoPage
      locale={data.locale}
      page="pro"
      title="Pro"
      tree={data.tree}
    />
  )
}

export const Route = createFileRoute('/{-$lang}/docs/pro')({
  component: RouteComponent,
  loader: ({ params }) => getDocsTodoTree(params.lang, 'Pro'),
  head: () => ({ meta: [{ title: 'Pro | Developer' }] })
})
