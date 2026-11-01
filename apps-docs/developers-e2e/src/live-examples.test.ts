import { expect, test } from '@vezham/config/playwright/test'

test('accordion examples run locally and expose their source', async ({
  page
}) => {
  await page.goto('/docs-ui/web/components/accordion', {
    waitUntil: 'networkidle'
  })
  const resources = page.getByRole('navigation', {
    name: 'Component resources'
  })
  await expect(resources.getByRole('link')).toHaveText([
    'Figma',
    'Storybook',
    'React Aria',
    'Source',
    'Styles source',
    'HeroUI'
  ])
  await expect(
    resources.getByRole('link', { name: 'Storybook', exact: true })
  ).toHaveAttribute(
    'href',
    'https://storybook-v3.heroui.com/?path=/docs/components-navigation-accordion--docs'
  )
  const preview = page.locator('[data-component-preview="accordion-disabled"]')
  await preview.scrollIntoViewIfNeeded()
  await expect(
    preview.getByRole('button', { name: 'Disabled Item 1' })
  ).toBeDisabled()
  await preview
    .getByRole('button', { name: 'Active Item', exact: true })
    .click()
  await expect(
    preview.getByText('This item is active and can be toggled normally.')
  ).toBeVisible()
  await preview.getByRole('tab', { name: 'Code', exact: true }).click()
  const source = preview.getByRole('region', { name: 'Example source code' })
  await expect(source.locator('pre')).toContainText('@vezham/react-v3')
  await expect(preview.locator('figure[data-line-numbers]')).toBeVisible()
  await expect(preview.locator('figure')).toHaveCount(1)
  await expect(preview.getByRole('region')).toHaveCount(1)
  await expect(source.locator('code > .line').first()).toBeVisible()
  const sourceHeight = await source.evaluate(element => ({
    visible: element.clientHeight,
    total: element.scrollHeight
  }))
  expect(sourceHeight.visible).toBe(sourceHeight.total)
  const more = preview.getByRole('button', { name: 'Show more', exact: true })
  await more.scrollIntoViewIfNeeded()
  await expect(more).toHaveAttribute(
    'aria-controls',
    await source.evaluate(element => element.id)
  )
  const expandedScroll = await page.evaluate(() => window.scrollY)
  await more.click()
  const less = preview.getByRole('button', { name: 'Show less', exact: true })
  await expect(less).toHaveAttribute('aria-expanded', 'true')
  expect(
    Math.abs((await page.evaluate(() => window.scrollY)) - expandedScroll)
  ).toBeLessThan(2)
  await source.hover()
  const beforeWheel = await page.evaluate(() => window.scrollY)
  await page.mouse.wheel(0, 240)
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(beforeWheel)
  expect(await source.evaluate(element => element.scrollTop)).toBe(0)
  await less.scrollIntoViewIfNeeded()
  const controlTop = (await less.boundingBox())!.y
  await less.click()
  await expect(more).toHaveAttribute('aria-expanded', 'false')
  await expect
    .poll(async () => Math.abs((await more.boundingBox())!.y - controlTop))
    .toBeLessThan(2)
  await preview.getByRole('tab', { name: 'Code', exact: true }).focus()
  await page.keyboard.press('ArrowLeft')
  await expect(
    preview.getByRole('tab', { name: 'Preview', exact: true })
  ).toHaveAttribute('aria-selected', 'true')
  await expect(
    preview.getByRole('button', { name: 'Disabled Item 1' })
  ).toBeDisabled()
  await expect(page.getByRole('link', { name: /Live example:/ })).toHaveCount(0)
})

test('loading buttons update inside the local preview', async ({ page }) => {
  await page.goto('/docs-ui/web/components/button', {
    waitUntil: 'networkidle'
  })
  const preview = page.locator(
    '[data-component-preview="button-loading-state"]'
  )
  await preview.scrollIntoViewIfNeeded()
  await preview.getByRole('button', { name: 'Upload File' }).click()
  await expect(
    preview.getByRole('button', { name: 'Uploading...' })
  ).toBeVisible()
  await expect(
    preview.getByRole('button', { name: 'Upload File' })
  ).toBeVisible()
  const basic = page.locator('[data-component-preview="button-basic"]')
  await basic.getByRole('tab', { name: 'Code', exact: true }).click()
  await expect(basic.locator('pre')).toContainText('export function Basic')
  await expect(basic.getByRole('button', { name: 'Show more' })).toHaveCount(0)
})

test('modal examples open and close locally', async ({ page }) => {
  await page.goto('/docs-ui/web/components/modal', { waitUntil: 'networkidle' })
  const preview = page.locator('[data-component-preview="modal-default"]')
  await preview.scrollIntoViewIfNeeded()
  await preview.getByRole('button', { name: 'Open Modal' }).click()
  const dialog = page.getByRole('dialog', { name: 'Welcome to HeroUI' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Continue' }).click()
  await expect(dialog).toBeHidden()
})

test('source documentation retains colors, related content, and attribution', async ({
  page
}) => {
  await page.goto('/docs-ui/web/getting-started/colors', {
    waitUntil: 'networkidle'
  })
  const light = page
    .getByRole('region', { name: 'light color tokens' })
    .filter({
      has: page.getByRole('button', {
        name: 'Copy Background color',
        exact: true
      })
    })
    .first()
  const dark = page
    .getByRole('region', { name: 'dark color tokens' })
    .filter({
      has: page.getByRole('button', {
        name: 'Copy Background color',
        exact: true
      })
    })
    .first()
  const background = (region: typeof light) =>
    region
      .getByRole('button', { name: 'Copy Background color', exact: true })
      .evaluate(element => getComputedStyle(element).backgroundColor)
  expect(await background(light)).not.toBe(await background(dark))
  await expect(
    page.getByRole('button', { name: 'Copy Placeholder color', exact: true })
  ).toHaveCount(2)

  await page.goto('/docs-ui/web/components/accordion', {
    waitUntil: 'networkidle'
  })
  await expect(page.locator('[aria-label="Related components"] a')).toHaveCount(
    2
  )
  const preview = page.locator('[data-component-preview="accordion-basic"]')
  await expect(preview.locator('[role="tabpanel"] > div')).toHaveCSS(
    'min-height',
    '400px'
  )

  await page.goto('/docs-ui/web/components/tabs', { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toContainText('New')
  await expect(
    page.locator('[aria-label="Related showcases"] a')
  ).toHaveAttribute(
    'href',
    'https://heroui.com/showcase/apple-iphone-camera-zoom'
  )

  await page.goto('/docs-ui/web/releases/v3-2-7', { waitUntil: 'networkidle' })
  await expect(
    page.getByRole('link', { name: 'Contributors to pull request #6892' })
  ).toHaveAttribute('href', 'https://github.com/heroui-inc/heroui/pull/6892')
})

test('component galleries show themed previews in the source order', async ({
  page
}) => {
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 }
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/docs-ui/web/components', { waitUntil: 'networkidle' })
    const buttons = page.getByRole('list', { name: 'Web Buttons components' })
    await expect(buttons.getByRole('link')).toHaveText([
      'Button',
      'ButtonGroup',
      'CloseButton',
      'ToggleButton',
      'ToggleButtonGroup'
    ])
    const tile = buttons.getByRole('link', { name: 'Button', exact: true })
    await tile.scrollIntoViewIfNeeded()
    for (const theme of ['light', 'dark']) {
      await page.evaluate(value => {
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(value)
      }, theme)
      const image = tile.locator(`img[src$="/${theme}-button.png"]`)
      await expect(image).toBeVisible()
      await expect
        .poll(() =>
          image.evaluate(element => (element as HTMLImageElement).naturalWidth)
        )
        .toBeGreaterThan(0)
      const position = await tile.evaluate(element => {
        const title = element.firstElementChild!.getBoundingClientRect()
        const frame = element.lastElementChild!.getBoundingClientRect()
        return {
          title: title.top,
          frame: frame.top,
          height: frame.height,
          width: frame.width,
          cellWidth: element.parentElement!.getBoundingClientRect().width
        }
      })
      expect(position.height).toBe(198)
      expect(Math.abs(position.width - position.cellWidth)).toBeLessThan(1)
      if (viewport.width < 640)
        expect(position.title).toBeLessThan(position.frame)
      else expect(position.title).toBeGreaterThan(position.frame)
    }
    await tile.click()
    await expect(page).toHaveURL(/\/docs-ui\/web\/components\/button\/?$/)
  }

  await page.goto('/cn/docs-ui/web/components', { waitUntil: 'networkidle' })
  await expect(
    page
      .getByRole('list', { name: 'Web Buttons components' })
      .getByRole('link')
      .first()
  ).toHaveAttribute('href', '/cn/docs-ui/web/components/button')
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/docs-ui/native/components', { waitUntil: 'networkidle' })
  const nativeButtons = page.getByRole('list', {
    name: 'Native Buttons components'
  })
  await expect(nativeButtons.getByRole('link')).toHaveText([
    'Button',
    'CloseButton',
    'LinkButton'
  ])
  await expect(nativeButtons.locator('video').first()).toHaveAttribute(
    'src',
    /\/button-docs-dark\.mp4$/
  )
  const skeleton = page
    .getByRole('list', { name: 'Native Feedback components' })
    .locator('li')
    .filter({ hasText: 'SkeletonGroup' })
  await expect(skeleton.locator('video')).toHaveAttribute(
    'src',
    /\/skeleton-docs-(light|dark)\.mp4$/
  )
  await expect(
    page
      .getByRole('list', { name: 'Native Utilities components' })
      .locator('li')
      .filter({ hasText: 'ScrollShadow' })
      .locator('video')
  ).toHaveAttribute('src', /\/scroll-shadow-docs-light\.mp4$/)
})

test('native videos decode frames and provide working playback controls', async ({
  page
}) => {
  test.setTimeout(60_000)
  await page.emulateMedia({
    colorScheme: 'light',
    reducedMotion: 'no-preference'
  })
  await page.goto('/docs-ui/native/components/button', {
    waitUntil: 'domcontentloaded'
  })
  const frame = page.locator('[data-docs-video]').first()
  await frame.scrollIntoViewIfNeeded()
  const video = frame.locator('video')
  const controls = frame.getByRole('group', { name: 'Video controls' })
  await expect
    .poll(
      () =>
        video.evaluate(
          element => element.videoWidth > 0 && element.readyState >= 2
        ),
      { timeout: 20_000 }
    )
    .toBe(true)
  const geometry = await frame.boundingBox()
  expect(Math.abs(geometry!.width / geometry!.height - 16 / 9)).toBeLessThan(
    0.02
  )
  expect(await video.evaluate(element => element.controls)).toBe(false)
  await expect
    .poll(() => video.evaluate(element => element.currentTime))
    .toBeGreaterThan(0.1)
  await controls.getByRole('button', { name: 'Pause', exact: true }).click()
  await expect.poll(() => video.evaluate(element => element.paused)).toBe(true)
  const pausedAt = await video.evaluate(element => element.currentTime)
  await controls.getByRole('button', { name: 'Play', exact: true }).click()
  await expect
    .poll(() => video.evaluate(element => element.currentTime))
    .toBeGreaterThan(pausedAt + 0.1)
  if (await video.evaluate(element => element.muted))
    await controls.getByRole('button', { name: 'Unmute', exact: true }).click()
  await controls.getByRole('button', { name: 'Mute', exact: true }).click()
  await expect.poll(() => video.evaluate(element => element.muted)).toBe(true)
  await controls.getByRole('button', { name: 'Unmute', exact: true }).click()
  await expect.poll(() => video.evaluate(element => element.muted)).toBe(false)
  await video.evaluate(element => {
    element.currentTime = Math.min(5, element.duration / 2)
  })
  await controls.getByRole('button', { name: 'Restart', exact: true }).click()
  await expect
    .poll(() => video.evaluate(element => element.currentTime))
    .toBeLessThan(2)
  await page.locator('#api-reference').scrollIntoViewIfNeeded()
  await expect.poll(() => video.evaluate(element => element.paused)).toBe(true)
  await frame.scrollIntoViewIfNeeded()
  await expect.poll(() => video.evaluate(element => element.paused)).toBe(false)
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(video).toHaveAttribute('src', /\/button-docs-dark\.mp4$/)
  await expect
    .poll(
      () =>
        video.evaluate(
          element =>
            element.videoWidth > 0 &&
            element.readyState >= 2 &&
            element.currentTime > 0.1
        ),
      { timeout: 20_000 }
    )
    .toBe(true)
  await expect(frame.getByRole('alert')).toHaveCount(0)
})

test.describe('mobile native videos', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'
  })
  test('show the first frame and play on request', async ({ page }) => {
    await page.goto('/docs-ui/native/components/button', {
      waitUntil: 'domcontentloaded'
    })
    const frame = page.locator('[data-docs-video]').first()
    await frame.scrollIntoViewIfNeeded()
    const video = frame.locator('video')
    await expect
      .poll(
        () =>
          video.evaluate(
            element => element.readyState >= 2 && element.videoWidth > 0
          ),
        { timeout: 20_000 }
      )
      .toBe(true)
    expect(await video.evaluate(element => element.paused)).toBe(true)
    const geometry = await frame.boundingBox()
    expect(Math.abs(geometry!.width / geometry!.height - 16 / 9)).toBeLessThan(
      0.02
    )
    const controls = frame.getByRole('group', { name: 'Video controls' })
    await controls.getByRole('button', { name: 'Play', exact: true }).click()
    await expect
      .poll(() => video.evaluate(element => element.currentTime))
      .toBeGreaterThan(0.1)
    await controls.getByRole('button', { name: 'Pause', exact: true }).click()
    await expect
      .poll(() => video.evaluate(element => element.paused))
      .toBe(true)
    await expect(frame.getByRole('alert')).toHaveCount(0)
  })
})
