import { createFileRoute } from '@tanstack/react-router'

import { DocsRoutePage } from '@vezham/start/pages/docs/route'

import { getHandbookLayoutOptions } from '@components/docs/handbook-docs-shell'
import {
  markdownDocs,
  markdownDocsRuntime
} from '@components/docs/markdown-docs'
import type { Locale } from '@generated/vx'
import { docsPageHead } from '@src/lib/page-head'

const RouteComponent = () => {
  const data = Route.useLoaderData()
  if (!data) throw new Error('Markdown docs loader returned no page data')
  return (
    <DocsRoutePage
      data={data}
      docs={markdownDocs}
      getLayoutOptions={locale =>
        getHandbookLayoutOptions({
          locale: locale as Locale,
          page: 'markdown',
          selectedSection: 'markdown'
        })
      }
      shell="notebook"
    />
  )
}

export const Route = createFileRoute('/{-$lang}/handbook/markdown/')({
  component: RouteComponent,
  head: ({ loaderData }) =>
    docsPageHead(loaderData, markdownDocsRuntime.getDocsRouteHead(loaderData), {
      title: 'Markdown',
      section: 'Handbook'
    }),
  loader: ({ params }) => markdownDocsRuntime.createDocsLoader()({ params })
})
