import { deserializePageTree } from '@vezham/docs-core/source/client'
import { decodeMarkdownUrl } from '@vezham/start/runtime/docs'

import { handbookDocsRuntime } from '../../components/docs/handbook-docs'

describe('MDX handbook', () => {
  it('includes Markdown in the shared handbook source', () => {
    expect(
      handbookDocsRuntime.source.getPages().map(page => page.slugs.join('/'))
    ).toContain('markdown')
  })
  it.each([undefined, 'cn'])(
    'loads the MDX index for locale %s',
    async lang => {
      const data = await handbookDocsRuntime.createDocsLoader()({
        params: { lang }
      })
      const prefix = lang ? `/${lang}` : ''
      expect(data.title).toBe('Handbook')
      expect(data.routePath).toBe(`${prefix}/handbook`)
      expect(data.markdownUrl).toBe(`${prefix}/handbook/index.md`)
      const tree = JSON.stringify(deserializePageTree(data.pageTree).children)
      expect(tree).toContain(`${prefix}/handbook`)
      const { page } = handbookDocsRuntime.getDocsPage({ slugs: [], lang })
      expect(await handbookDocsRuntime.getLLMText(page)).toContain(
        'TODO: Add the Vezham engineering handbook.'
      )
    }
  )

  it.each(['get-started', 'missing', 'markdown/missing'])(
    'rejects missing handbook page %s instead of inventing a TODO page',
    async slug => {
      await expect(
        handbookDocsRuntime.createDocsLoader()({ params: { _splat: slug } })
      ).rejects.toMatchObject({ isNotFound: true })
    }
  )

  it('loads the Markdown index directly and rejects the retired overview alias', async () => {
    const data = await handbookDocsRuntime.createDocsLoader()({
      params: { _splat: 'markdown' }
    })
    expect(data.title).toBe('Overview')
    expect(data.routePath).toBe('/handbook/markdown')
    expect(data.markdownUrl).toBe('/handbook/markdown.md')
    const { page } = handbookDocsRuntime.getDocsPage({ slugs: ['markdown'] })
    expect(await handbookDocsRuntime.getLLMText(page)).toContain('Basic Syntax')
    await expect(
      handbookDocsRuntime.createDocsLoader()({
        params: { _splat: 'markdown/overview' }
      })
    ).rejects.toMatchObject({ isNotFound: true })
  })

  it.each([
    'markdown',
    'markdown/handbooks/basic',
    'markdown/handbooks/extended',
    'markdown/handbooks/hacks',
    'markdown/ref/md-affine',
    'markdown/ref/md-cliq',
    'markdown/ref/md-mdlivepreview',
    'markdown/ref/md-vhm-v1',
    'markdown/todo',
    'markdown/todo/mdx-fumadocs'
  ])('loads the nested content and Markdown export for %s', async slug => {
    const data = await handbookDocsRuntime.createDocsLoader()({
      params: { _splat: slug }
    })
    expect(data.routePath).toBe(`/handbook/${slug}`)
    const { page } = handbookDocsRuntime.getDocsPage({
      slugs: data.markdownUrl.replace('/handbook/', '').split('/'),
      pathFormat: 'markdown-url'
    })
    expect(await handbookDocsRuntime.getLLMText(page)).toBeTruthy()
  })

  it.each(['index.md', 'handbooks/basic.md'])(
    'preserves section-relative Markdown export %s',
    async path => {
      const { page } = handbookDocsRuntime.getDocsPage({
        slugs: ['markdown', ...decodeMarkdownUrl(path.split('/'))]
      })
      expect(await handbookDocsRuntime.getLLMText(page)).toContain('Syntax')
    }
  )
})
