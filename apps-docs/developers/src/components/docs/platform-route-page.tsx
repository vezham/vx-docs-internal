import { Link } from '@tanstack/react-router'
import { Suspense, use } from 'react'

import { useDocsLoader } from '@vezham/docs-core/source/client'
import { DocsLayout, DocsPage } from '@vezham/start/layouts/docs'
import { getMDXComponents } from '@vezham/start/mdx'
import type { DocsRoutePageProps } from '@vezham/start/pages/docs/route'

import { ComponentLinks } from './component-links'
import type { getPlatformDocs } from './platform-docs'

type Props = Omit<DocsRoutePageProps, 'docs'> & {
  docs: ReturnType<typeof getPlatformDocs>
}

const components = getMDXComponents()

const Content = ({
  docs,
  path,
  markdownUrl,
  shell
}: Pick<Props, 'docs' | 'shell'> & {
  path: string
  markdownUrl: string
}) => {
  const page = docs.getPage(path)
  if (!page) throw new Error(`Unknown platform docs page: ${path}`)
  const { toc } = use(page.load())
  const MDX = page.body
  return (
    <DocsPage
      title={page.title}
      description={page.description}
      markdownUrl={markdownUrl}
      shell={shell}
      toc={toc}>
      <ComponentLinks links={page.links} />
      <MDX components={components} />
    </DocsPage>
  )
}

export const PlatformDocsRoutePage = ({
  data,
  docs,
  getLayoutOptions,
  shell = 'notebook'
}: Props) => {
  const page = useDocsLoader(data)
  return (
    <DocsLayout
      {...getLayoutOptions(page.locale)}
      shell={shell}
      tree={page.pageTree}>
      <Link to={page.markdownUrl} hidden />
      <Suspense>
        <Content
          docs={docs}
          path={page.path}
          markdownUrl={page.markdownUrl}
          shell={shell}
        />
      </Suspense>
    </DocsLayout>
  )
}
