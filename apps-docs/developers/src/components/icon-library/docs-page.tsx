import { Suspense, use } from 'react'

import { useDocsLoader } from '@vezham/docs-core/source/client'
import { DocsLayout, DocsPage } from '@vezham/start/layouts/docs'
import { getMDXComponents } from '@vezham/start/mdx'

import { baseOptions } from '@config/layout'
import type { Locale } from '@generated/vx'
import { type IconDocsLoaderData, iconDocs } from '@src/lib/icon-library/docs'

import { AssetNavigation } from './shell'

const mdxComponents = getMDXComponents()
const Content = ({
  path,
  markdownUrl,
  locale
}: {
  path: string
  markdownUrl: string
  locale: Locale
}) => {
  const page = iconDocs.getPage(path)
  if (!page) throw new Error('Unknown icon guide')
  const { toc } = use(page.load())
  const MDX = page.body
  return (
    <DocsPage
      title={page.title}
      description={page.description}
      toc={toc}
      markdownUrl={markdownUrl}
      shell="notebook">
      <div className="not-prose mb-6">
        <AssetNavigation active="docs" locale={locale} />
      </div>
      <MDX components={mdxComponents} />
    </DocsPage>
  )
}
export const IconDocsPage = ({ data }: { data: IconDocsLoaderData }) => {
  const page = useDocsLoader(data)
  return (
    <DocsLayout
      {...baseOptions(page.locale as Locale)}
      tree={page.pageTree}
      shell="notebook">
      <a href={page.markdownUrl} hidden>
        Markdown
      </a>
      <Suspense>
        <Content
          path={page.path}
          markdownUrl={page.markdownUrl}
          locale={page.locale as Locale}
        />
      </Suspense>
    </DocsLayout>
  )
}
