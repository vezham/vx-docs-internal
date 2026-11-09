import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { fireEvent, render, waitFor, within } from '@testing-library/react'

import { createRouter } from '@vezham/start/router/tanstack'

import { vxI18n } from '../src/generated/vx'
import { routeTree } from '../src/routeTree.gen'

const renderApp = async (path = '/') => {
  const router = createRouter({
    history: createMemoryHistory({
      initialEntries: [path]
    }),
    routeTree
  })

  await router.load()

  return { ...render(<RouterProvider router={router} />), router }
}

describe('App', () => {
  it.each([
    ['/docs/ui/react/web/getting-started', 'Getting Started - Vezham Web'],
    [
      '/docs/ui/react/native/getting-started',
      'Getting Started - Vezham Native'
    ],
    ['/docs/ui/react-v3/web/getting-started', 'Introduction - Vezham v3 Web'],
    [
      '/docs/ui/react-v3/native/getting-started',
      'Introduction - Vezham v3 Native'
    ],
    [
      '/docs/ui/react-pro-v3/web/getting-started',
      'Introduction - Vezham Pro v3 Web'
    ],
    [
      '/cn/docs/ui/react-pro-v3/native/getting-started',
      'Introduction - Vezham Pro v3 Native'
    ],
    ['/docs/assets/guides', 'Guides - Assets'],
    ['/docs/assets/guides/react', 'React - Assets'],
    ['/handbook', 'Handbook'],
    ['/cn/handbook/markdown', 'Markdown - Handbook']
  ])(
    'sets route-owned title context at %s',
    async (path, expected) => {
      const router = createRouter({
        history: createMemoryHistory({ initialEntries: [path] }),
        routeTree
      })
      await router.load()
      const match = router.state.matches[router.state.matches.length - 1]
      expect(match?.status).toBe('success')
      expect(match?.meta).toContainEqual({
        title: `${expected} | Vezham Developers`
      })
    },
    20_000
  )

  it.each([
    '/docs/pro',
    '/cn/docs/pro',
    '/docs/ui/web/getting-started',
    '/docs/ui/native/getting-started',
    '/docs-ui/web/getting-started',
    '/docs/react',
    '/icons',
    '/icons/align-bottom',
    '/illustrations',
    '/illustration/accelerometer',
    '/logos',
    '/logo/react',
    '/packages',
    '/faq'
  ])('does not resolve the retired route %s', async path => {
    const router = createRouter({
      history: createMemoryHistory({ initialEntries: [path] }),
      routeTree
    })
    await router.load()
    expect(
      router.state.matches.filter(
        match => match.routeId !== '__root__' && match.routeId !== '/{-$lang}'
      )
    ).toEqual([])
    expect(router.state.location.pathname).toBe(path)
  })

  it.each([
    '/handbook',
    '/cn/handbook',
    '/handbook/markdown',
    '/handbook/markdown/handbooks/basic'
  ])(
    'keeps the active handbook route %s',
    async path => {
      const router = createRouter({
        history: createMemoryHistory({ initialEntries: [path] }),
        routeTree
      })
      await router.load()
      expect(
        router.state.matches[router.state.matches.length - 1]?.status
      ).toBe('success')
    },
    20_000
  )

  it.each([
    '/docs/assets/icons',
    '/docs/assets/icons/align-bottom?weight=filled',
    '/docs/assets/illustrations',
    '/docs/assets/illustrations/accelerometer',
    '/docs/assets/logos',
    '/docs/assets/logos/react',
    '/docs/assets/packages',
    '/docs/assets/faq',
    '/docs/assets/guides',
    '/docs/assets/guides/react',
    '/cn/docs/assets/icons',
    '/cn/docs/assets/guides/react'
  ])(
    'loads the asset library at %s',
    async path => {
      const router = createRouter({
        history: createMemoryHistory({ initialEntries: [path] }),
        routeTree
      })
      await router.load()
      const match = router.state.matches[router.state.matches.length - 1]
      expect(match?.status).toBe('success')
      expect(match?.routeId).toContain('/docs/assets/')
      if (path.includes('weight=filled'))
        expect(router.state.location.search).toMatchObject({ weight: 'filled' })
    },
    20_000
  )

  it.each([
    ['/docs/assets', '/docs/assets/icons'],
    ['/cn/docs/assets', '/cn/docs/assets/icons']
  ])(
    'opens the asset entry URL %s at %s',
    async (from, to) => {
      const router = createRouter({
        history: createMemoryHistory({ initialEntries: [from] }),
        routeTree
      })
      await router.load()
      await waitFor(() => expect(router.state.location.pathname).toBe(to))
      expect(
        router.state.matches[router.state.matches.length - 1]?.status
      ).toBe('success')
    },
    20_000
  )

  it('keeps icon resources and framework guides in the shared notebook shell', async () => {
    const animations = Object.getOwnPropertyDescriptor(
      Element.prototype,
      'getAnimations'
    )
    Object.defineProperty(Element.prototype, 'getAnimations', {
      configurable: true,
      value: () => []
    })
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = () => undefined
        unobserve = () => undefined
        disconnect = () => undefined
      }
    )
    try {
      const { container, findByRole, queryByRole, router } = await renderApp(
        '/docs/assets/packages'
      )
      await findByRole('heading', { name: 'Packages and tools' })
      expect(container.querySelector('#nd-notebook-layout')).toBeTruthy()
      expect(container.querySelector('#nd-sidebar')).toBeTruthy()
      expect(queryByRole('button', { name: 'Collapse sidebar' })).toBeNull()
      const navigation = within(
        await findByRole('navigation', { name: 'Icon library sections' })
      )
      const selected = navigation.getByRole('link', { name: 'Packages' })
      expect(selected.getAttribute('aria-current')).toBe('page')
      fireEvent.click(navigation.getByRole('link', { name: 'Guides' }))
      await waitFor(() =>
        expect(router.state.location.pathname).toBe('/docs/assets/guides')
      )
      await findByRole('heading', { name: 'Vezham Icons' }, { timeout: 10_000 })
      expect(container.querySelector('#nd-notebook-layout')).toBeTruthy()
      expect(
        await findByRole('button', { name: 'Collapse sidebar' })
      ).toBeTruthy()
      expect(
        container.querySelector('#nd-subnav a[aria-current="page"]')
          ?.textContent
      ).toBe('Guides')
      expect(
        container.querySelector(
          '#nd-sidebar a[href="/docs/assets/guides/react"]'
        )
      ).toBeTruthy()
    } finally {
      vi.unstubAllGlobals()
      if (animations)
        Object.defineProperty(Element.prototype, 'getAnimations', animations)
      else Reflect.deleteProperty(Element.prototype, 'getAnimations')
    }
  }, 20_000)

  it('uses the same platform route for Pro Web and Native', async () => {
    const router = createRouter({
      history: createMemoryHistory({
        initialEntries: ['/docs/ui/react-pro-v3/web/components/area-chart']
      }),
      routeTree
    })
    const currentMatch = () =>
      router.state.matches[router.state.matches.length - 1]
    await router.load()
    expect(currentMatch()?.routeId).toBe(
      '/{-$lang}/docs/ui/react-pro-v3/$platform/$'
    )
    expect(currentMatch()?.status).toBe('success')
    await router.navigate({
      to: '/{-$lang}/docs/ui/react-pro-v3/$platform/$',
      params: { platform: 'native', _splat: 'components/fab' }
    })
    expect(currentMatch()?.routeId).toBe(
      '/{-$lang}/docs/ui/react-pro-v3/$platform/$'
    )
    expect(currentMatch()?.status).toBe('success')
  }, 20_000)

  it.each([
    ['/docs', '/docs/ui/react/web/getting-started'],
    ['/cn/docs', '/cn/docs/ui/react/web/getting-started'],
    ['/docs/ui', '/docs/ui/react/web/getting-started'],
    ['/cn/docs/ui', '/cn/docs/ui/react/web/getting-started'],
    ['/docs/ui/react', '/docs/ui/react/web/getting-started'],
    ['/docs/ui/react/web', '/docs/ui/react/web/getting-started'],
    ['/docs/ui/react/native', '/docs/ui/react/native/getting-started'],
    ['/cn/docs/ui/react', '/cn/docs/ui/react/web/getting-started'],
    ['/docs/ui/react-v3', '/docs/ui/react-v3/web/getting-started'],
    ['/docs/ui/react-pro-v3', '/docs/ui/react-pro-v3/web/getting-started'],
    ['/docs/ui/react-pro-v3/web', '/docs/ui/react-pro-v3/web/getting-started'],
    [
      '/docs/ui/react-pro-v3/native',
      '/docs/ui/react-pro-v3/native/getting-started'
    ],
    ['/cn/docs/ui/react-pro-v3', '/cn/docs/ui/react-pro-v3/web/getting-started']
  ])(
    'redirects UI library URL %s to %s',
    async (from, to) => {
      const router = createRouter({
        history: createMemoryHistory({ initialEntries: [from] }),
        routeTree
      })
      await router.load()
      await waitFor(() => expect(router.state.location.pathname).toBe(to))
      expect(
        router.state.matches[router.state.matches.length - 1]?.status
      ).toBe('success')
    },
    20_000
  )

  it.each([
    '/docs/ui/react/other/getting-started',
    '/docs/ui/react/getting-started',
    '/docs/ui/react-pro-v3/other/components/area-chart',
    '/docs/ui/react-pro-v3/getting-started',
    '/docs/ui/react-pro-v3/components/area-chart'
  ])(
    'rejects UI library URL without a supported platform: %s',
    async path => {
      const router = createRouter({
        history: createMemoryHistory({ initialEntries: [path] }),
        routeTree
      })
      await router.load()
      expect(
        router.state.matches[router.state.matches.length - 1]?.status
      ).toBe('notFound')
    },
    20_000
  )

  it('switches a Web-only page to the Native introduction', async () => {
    const animations = Object.getOwnPropertyDescriptor(
      Element.prototype,
      'getAnimations'
    )
    Object.defineProperty(Element.prototype, 'getAnimations', {
      configurable: true,
      value: () => []
    })
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = () => undefined
        unobserve = () => undefined
        disconnect = () => undefined
      }
    )
    try {
      const { findAllByRole, router } = await renderApp(
        '/docs/ui/react-v3/web/migration'
      )
      const tabs = await findAllByRole('tab', { name: 'Native' })
      fireEvent.click(tabs[0])
      await waitFor(() =>
        expect(router.state.location.pathname).toBe(
          '/docs/ui/react-v3/native/getting-started'
        )
      )
    } finally {
      vi.unstubAllGlobals()
      if (animations)
        Object.defineProperty(Element.prototype, 'getAnimations', animations)
      else Reflect.deleteProperty(Element.prototype, 'getAnimations')
    }
  }, 20_000)

  it('uses the configured default language for the document', async () => {
    await renderApp()

    await waitFor(() =>
      expect(document.documentElement.lang).toBe(vxI18n.defaultLanguage)
    )
  })

  it('should render successfully', async () => {
    const { baseElement } = await renderApp()

    await waitFor(() => expect(baseElement).toBeTruthy())
  })

  it('should mount app shell container', async () => {
    const { baseElement } = await renderApp()

    await waitFor(() =>
      expect(baseElement.querySelector('.vx-app')).toBeTruthy()
    )
  })
})
