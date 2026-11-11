import { createFileRoute } from '@tanstack/react-router'

import { DocsRoutePage } from '@vezham/start/pages/docs/route'

import {
  handbookDocs,
  handbookDocsRuntime
} from '@components/docs/handbook-docs'
import { getHandbookLayoutOptions } from '@components/docs/handbook-docs-shell'
import type { Locale } from '@generated/vx'
import { docsPageHead } from '@src/lib/page-head'

const RouteComponent = () => {
  const { _splat } = Route.useParams()
  const data = Route.useLoaderData()
  if (!data) throw new Error('Markdown docs loader returned no page data')
  return (
    <DocsRoutePage
      data={data}
      docs={handbookDocs}
      getLayoutOptions={locale =>
        getHandbookLayoutOptions({
          locale: locale as Locale,
          page: 'markdown/' + _splat,
          selectedSection: 'markdown'
        })
      }
      shell="notebook"
    />
  )
}

export const Route = createFileRoute('/{-$lang}/handbook/markdown/$')({
  component: RouteComponent,
  head: ({ loaderData }) =>
    docsPageHead(loaderData, handbookDocsRuntime.getDocsRouteHead(loaderData), {
      section: 'Markdown'
    }),
  loader: ({ params }) =>
    handbookDocsRuntime.createDocsLoader()({
      params: {
        ...params,
        _splat: ['markdown', params._splat].filter(Boolean).join('/')
      }
    })
})
