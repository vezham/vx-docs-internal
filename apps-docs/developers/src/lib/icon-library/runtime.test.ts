describe('icon CDN runtime', () => {
  afterEach(() => {
    document.querySelector('#vezham-icon-runtime')?.remove()
    delete window.VezhamIcons
    vi.resetModules()
  })
  it('shares one deferred script and waits for the runtime to become ready', async () => {
    const { loadIconRuntime, iconCdnUrl } = await import('./runtime')
    const first = loadIconRuntime()
    const second = loadIconRuntime()
    expect(first).toBe(second)
    expect(document.querySelectorAll('#vezham-icon-runtime')).toHaveLength(1)
    const script = document.querySelector<HTMLScriptElement>(
      '#vezham-icon-runtime'
    )
    expect(script?.src).toBe(iconCdnUrl)
    expect(script?.defer).toBe(true)
    window.VezhamIcons = {
      icons: ['home'],
      categories: ['building'],
      ready: Promise.resolve(),
      preload: vi.fn()
    }
    script?.dispatchEvent(new Event('load'))
    expect((await first).icons).toEqual(['home'])
  })
  it('can retry after a failed script load', async () => {
    const { loadIconRuntime } = await import('./runtime')
    const pending = loadIconRuntime()
    const failure = expect(pending).rejects.toThrow(
      'icon renderer could not load'
    )
    document
      .querySelector('#vezham-icon-runtime')
      ?.dispatchEvent(new Event('error'))
    await failure
    expect(document.querySelector('#vezham-icon-runtime')).toBeNull()
    const retry = loadIconRuntime()
    window.VezhamIcons = {
      icons: ['home'],
      categories: [],
      ready: Promise.resolve(),
      preload: vi.fn()
    }
    document
      .querySelector('#vezham-icon-runtime')
      ?.dispatchEvent(new Event('load'))
    expect((await retry).icons).toEqual(['home'])
  })
})
