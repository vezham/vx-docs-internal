import { deserializePageTree } from '@vezham/docs-core/source/client'

import { handbookDocsRuntime } from '../../components/docs/handbook-docs'
import { markdownDocsRuntime } from '../../components/docs/markdown-docs'

describe('MDX handbook', () => {
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
    const data = await markdownDocsRuntime.createDocsLoader()({ params: {} })
    expect(data.title).toBe('Overview')
    expect(data.routePath).toBe('/handbook/markdown')
    expect(data.markdownUrl).toBe('/handbook/markdown/index.md')
    const { page } = markdownDocsRuntime.getDocsPage({ slugs: [] })
    expect(await markdownDocsRuntime.getLLMText(page)).toContain('Basic Syntax')
    await expect(
      markdownDocsRuntime.createDocsLoader()({
        params: { _splat: 'overview' }
      })
    ).rejects.toMatchObject({ isNotFound: true })
  })
})
