import { deserializePageTree } from '@vezham/docs-core/source/client'

import { getPlatformDocsRuntime } from '../../components/docs/platform-docs'
import { getPlatformSections } from '../../components/docs/platform-sections'
import { createPlatformDocsLoader } from './platform-loader'

const loader = createPlatformDocsLoader()

describe('UI documentation', () => {
  // vx-bot/NOTE: The first loader call compiles MDX on shared CI workers.
  it.each(['web', 'native'] as const)(
    'loads the %s introduction and section navigation',
    async platform => {
      const data = await loader({
        params: { platform, _splat: 'getting-started' }
      })
      expect(data.title).toBeTruthy()
      expect(data.routePath).toBe(`/docs-ui/${platform}/getting-started`)
      expect(
        deserializePageTree(data.pageTree).children.length
      ).toBeGreaterThan(0)
      expect(data.markdownUrl).toContain(`/docs-ui/${platform}/`)
    },
    20_000
  )

  it('retains Chinese paths with English fallback content', async () => {
    const data = await loader({
      params: { platform: 'web', lang: 'cn', _splat: 'components/button' }
    })
    expect(data.title).toBe('Button')
    expect(data.locale).toBe('cn')
    expect(data.routePath).toBe('/cn/docs-ui/web/components/button')
    expect(deserializePageTree(data.pageTree).children.length).toBeGreaterThan(
      0
    )
  })

  it('includes copied example source in markdown exports', async () => {
    const runtime = getPlatformDocsRuntime('web')
    const { page } = runtime.getDocsPage({ slugs: ['components', 'button'] })
    const markdown = await runtime.getLLMText(page)
    expect(markdown).toContain('Button')
    expect(markdown).toContain('@heroui/react')
    expect(markdown).toContain('@vezham/react-v3')
    expect(markdown).toContain('button-basic')
    expect(markdown).not.toContain('Live example:')
  })

  it('offers migration only on Web and rejects unknown platforms', async () => {
    expect(
      getPlatformSections('native').map(section => section.id)
    ).not.toContain('migration')
    expect(getPlatformSections('web').map(section => section.id)).toContain(
      'migration'
    )
    await expect(
      loader({ params: { platform: 'other', _splat: 'getting-started' } })
    ).rejects.toMatchObject({ isNotFound: true })
  })
})
