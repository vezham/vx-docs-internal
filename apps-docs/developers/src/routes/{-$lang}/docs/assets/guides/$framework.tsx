import { createFileRoute } from '@tanstack/react-router'

import { IconDocsPage } from '@components/icon-library/docs-page'
import { iconDocsRuntime, loadIconDocs } from '@src/lib/icon-library/docs'

const RouteComponent = () => <IconDocsPage data={Route.useLoaderData()} />
export const Route = createFileRoute('/{-$lang}/docs/assets/guides/$framework')(
  {
    component: RouteComponent,
    loader: loadIconDocs,
    head: ({ loaderData }) => iconDocsRuntime.getDocsRouteHead(loaderData)
  }
)
