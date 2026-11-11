import { decodeMarkdownUrl } from '@vezham/start/runtime/docs'

import { handbookDocsRuntime } from '@components/docs/handbook-docs'
import { docsPageHead } from '@src/lib/page-head'

import { getContentSections } from './content-navigation'

export const loadHandbookDocs = async ({
  params
}: {
  params: { lang?: string; _splat?: string }
}) => {
  const data = await handbookDocsRuntime.createDocsLoader()({ params })
  const page = params._splat ?? ''
  const sections = getContentSections(handbookDocsRuntime.source, {
    locale: data.locale
  })
  const section =
    sections.find(item => item.id === page.split('/')[0]) ??
    sections.find(item => item.page === '')
  const title = handbookDocsRuntime.source.getPage([], data.locale)?.data.title
  return { ...data, page, sections, section, collectionTitle: title }
}

type Data = Awaited<ReturnType<typeof loadHandbookDocs>>

export const handbookDocsRouteOptions = {
  loader: loadHandbookDocs,
  head: ({ loaderData: data }: { loaderData?: Data }) =>
    docsPageHead(data, handbookDocsRuntime.getDocsRouteHead(data), {
      title:
        data?.page && data.page === data.section?.page
          ? data.section.title
          : undefined,
      section: !data?.page
        ? undefined
        : data.page === data.section?.page || !data.section?.page
          ? data.collectionTitle
          : data.section.title
    })
}

export const handbookMarkdownHandler = async ({
  params
}: {
  params: { lang?: string; _splat?: string }
}) => {
  const slugs = decodeMarkdownUrl(params._splat?.split('/') ?? [])
  if (slugs[slugs.length - 1] === 'index') slugs.pop()
  const { page } = handbookDocsRuntime.getDocsPage({ slugs, lang: params.lang })
  return new Response(await handbookDocsRuntime.getLLMText(page), {
    headers: { 'Content-Type': 'text/markdown' }
  })
}
