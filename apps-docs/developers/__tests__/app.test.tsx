import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { fireEvent, render, waitFor } from '@testing-library/react'

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
  it('keeps canonical Pro Web routes separate from Native routes', async () => {
    const router = createRouter({
      history: createMemoryHistory({
        initialEntries: ['/docs/ui/react-pro-v3/components/area-chart']
      }),
      routeTree
    })
    const currentMatch = () =>
      router.state.matches[router.state.matches.length - 1]
    await router.load()
    expect(currentMatch()?.routeId).toBe('/{-$lang}/docs/ui/react-pro-v3/$')
    expect(currentMatch()?.status).toBe('success')
    await router.navigate({
      to: '/{-$lang}/docs/ui/react-pro-v3/native/$',
      params: { _splat: 'components/fab' }
    })
    expect(currentMatch()?.routeId).toBe(
      '/{-$lang}/docs/ui/react-pro-v3/native/$'
    )
    expect(currentMatch()?.status).toBe('success')
  }, 20_000)

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
