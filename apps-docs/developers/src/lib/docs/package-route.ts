import { notFound } from '@tanstack/react-router'

import { localizedUrl } from '@vezham/start/runtime/docs'

import { i18n } from '@app/docs'
import { packagesDocsRuntime } from '@components/docs/packages-docs'
import {
  docsPackages,
  getDocsPackage,
  getPackageDocsPath
} from '@config/packages'
import { docsPageHead } from '@src/lib/page-head'

import { filterPlatformPageTree } from './platform-page-tree'

type Params = { package?: string; _splat?: string; lang?: string }

export const loadPackageDocs = async ({ params }: { params: Params }) => {
  const packageId = getDocsPackage(params.package)
  const page = params._splat
  if (!packageId || !page) throw notFound()

  const data = await packagesDocsRuntime.createDocsLoader()({
    params: { lang: params.lang, _splat: `${packageId}/${page}` }
  })
  const tree = packagesDocsRuntime.source.getPageTree(data.locale)
  const source = packagesDocsRuntime.source
  const folder = tree.children.find(
    node =>
      node.type === 'folder' &&
      source.getNodeMeta(node, data.locale)?.path === `${packageId}/meta.json`
  )
  const sections =
    folder?.type === 'folder'
      ? folder.children.flatMap(node => {
          const index = node.type === 'folder' ? node.index : node
          if (index?.type !== 'page') return []
          const entry = source.getNodePage(index, data.locale)
          if (!entry) return []
          return [
            {
              id: entry.slugs[1],
              title: entry.data.title,
              path: getPackageDocsPath(
                packageId,
                entry.slugs.slice(1).join('/')
              )
            }
          ]
        })
      : []
  const section = sections.find(item => item.id === page.split('/')[0])
  if (!section) throw notFound()
  const docsBase = localizedUrl(i18n, data.locale, '/docs/packages')
  const nodes = filterPlatformPageTree({
    docsBase,
    nodes: tree.children,
    prefix: packageId
  })

  return {
    ...data,
    packageId,
    page,
    sections,
    pageTree: await packagesDocsRuntime.source.serializePageTree({
      ...tree,
      $id: `${data.locale}:packages:${packageId}:${section.id}`,
      name: docsPackages[packageId].name,
      children: filterPlatformPageTree({
        docsBase,
        nodes,
        prefix: `${packageId}/${section.id}`
      }),
      fallback: undefined
    })
  }
}

export const packageDocsRouteOptions = {
  loader: loadPackageDocs,
  head: ({
    loaderData
  }: {
    loaderData?: Awaited<ReturnType<typeof loadPackageDocs>>
  }) =>
    docsPageHead(loaderData, packagesDocsRuntime.getDocsRouteHead(loaderData), {
      section: loaderData ? docsPackages[loaderData.packageId].name : undefined
    })
}

export const packageMarkdownHandler = async ({
  params
}: {
  params: Params
}) => {
  const packageId = getDocsPackage(params.package)
  if (!packageId) return new Response(null, { status: 404 })
  const { page } = packagesDocsRuntime.getDocsPage({
    slugs: [packageId, ...(params._splat?.split('/') ?? [])],
    lang: params.lang,
    pathFormat: 'markdown-url'
  })
  return new Response(await packagesDocsRuntime.getLLMText(page), {
    headers: { 'Content-Type': 'text/markdown' }
  })
}
