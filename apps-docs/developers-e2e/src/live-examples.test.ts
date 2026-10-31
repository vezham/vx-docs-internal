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
    'Styles source'
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
