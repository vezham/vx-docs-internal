import type { Node } from '@vezham/docs-core/page-tree'
import { decodeMarkdownUrl, localizedUrl } from '@vezham/start/runtime/docs'

import { i18n } from '@app/docs'
import { handbookDocsRuntime } from '@components/docs/handbook-docs'
import { docsPageHead } from '@src/lib/page-head'

import { getContentSections } from './content-navigation'
import { filterPlatformPageTree } from './platform-page-tree'

// vx-bot/NOTE: Group headings toggle their pages; index pages remain regular links.
const sidebarGroups = (nodes: Node[]): Node[] =>
  nodes.map(node =>
    node.type === 'folder'
      ? {
          ...node,
          index: undefined,
          children: sidebarGroups([
            ...(node.index ? [node.index] : []),
            ...node.children
          ])
        }
      : node
  )

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
  const tree = handbookDocsRuntime.source.getPageTree(data.locale)
  return {
    ...data,
    page,
    sections,
    section,
    collectionTitle: title,
    pageTree: await handbookDocsRuntime.source.serializePageTree({
      ...tree,
      $id: `${data.locale}:handbook:${section?.id || 'index'}`,
      name: section?.title ?? tree.name,
      children: sidebarGroups(
        filterPlatformPageTree({
          docsBase: localizedUrl(i18n, data.locale, '/handbook'),
          nodes: tree.children,
          prefix: section?.id ?? ''
        })
      ),
      fallback: undefined
    })
  }
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
