import { deserializePageTree } from '@vezham/docs-core/source/client'

import {
  getPlatformDocsRuntime,
  platformDocsPageSchema
} from '../../components/docs/platform-docs'
import { getPlatformSections } from '../../components/docs/platform-sections'
import { getComponentResources } from './component-resources'
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
      expect(data.routePath).toBe(
        `/docs/ui/react-v3/${platform}/getting-started`
      )
      expect(
        deserializePageTree(data.pageTree).children.length
      ).toBeGreaterThan(0)
      expect(data.markdownUrl).toContain(`/docs/ui/react-v3/${platform}/`)
    },
    20_000
  )

  it('retains Chinese paths with English fallback content', async () => {
    const data = await loader({
      params: { platform: 'web', lang: 'cn', _splat: 'components/button' }
    })
    expect(data.title).toBe('Button')
    expect(data.locale).toBe('cn')
    expect(data.routePath).toBe('/cn/docs/ui/react-v3/web/components/button')
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

  it.each(['web', 'native'] as const)(
    'preserves %s component resource metadata',
    platform => {
      const runtime = getPlatformDocsRuntime(platform)
      const { page } = runtime.getDocsPage({
        slugs: ['components', 'accordion']
      })
      const resources = getComponentResources(page.data.links)
      expect(resources.map(resource => resource.label)).toEqual(
        platform === 'web'
          ? ['Figma', 'Storybook', 'React Aria', 'Source', 'Styles source']
          : ['Source', 'Styles source']
      )
      expect(
        resources.find(resource => resource.label === 'Source')?.href
      ).toBe(
        platform === 'web'
          ? 'https://github.com/heroui-inc/heroui/tree/v3/packages/react/src/components/accordion/accordion.tsx'
          : 'https://github.com/heroui-inc/heroui-native/tree/main/src/components/accordion/accordion.tsx'
      )
    }
  )

  it('preserves absolute resource URLs in imported metadata', () => {
    expect(
      getComponentResources({
        rac: 'https://react-spectrum.adobe.com/react-aria/Form.html'
      })
    ).toMatchObject([
      {
        label: 'React Aria',
        href: 'https://react-spectrum.adobe.com/react-aria/Form.html'
      }
    ])
  })

  it('retains status, release attribution, and social images', () => {
    const runtime = getPlatformDocsRuntime('web')
    expect(
      runtime.getDocsPage({ slugs: ['components', 'tabs'] }).page.data.status
    ).toBe('new')
    expect(
      runtime.getDocsPage({ slugs: ['getting-started', 'agents-md'] }).page.data
        .status
    ).toBe('preview')
    const metadata = platformDocsPageSchema.parse({
      title: 'Release',
      github: { pull: 6892 },
      image: 'https://example.com/cover.jpg'
    })
    expect(metadata.github).toEqual({ pull: 6892 })
    expect(metadata.image).toBe('https://example.com/cover.jpg')
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
