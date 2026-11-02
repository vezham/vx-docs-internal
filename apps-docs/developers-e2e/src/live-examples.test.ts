import { expect, test } from '@vezham/config/playwright/test'

test('component documentation is reachable from the gallery', async ({
  page
}) => {
  await page.goto('/docs/ui/react-v3/web/components', { waitUntil: 'load' })
  const buttons = page.getByRole('list', { name: 'Web Buttons components' })
  const link = buttons.getByRole('link', { name: 'Button', exact: true })
  await expect(link).toHaveAttribute(
    'href',
    '/docs/ui/react-v3/web/components/button'
  )
  const href = await link.getAttribute('href')
  await page.goto(href ?? '', { waitUntil: 'load' })
  await expect(page).toHaveURL(
    /\/docs\/ui\/react-v3\/web\/components\/button\/?$/
  )
  await expect(
    page.getByRole('heading', { name: 'Button', level: 1, exact: true })
  ).toBeVisible()
})

test('a local demo works and exposes its source', async ({ page }) => {
  await page.goto('/docs/ui/react-v3/web/components/accordion', {
    waitUntil: 'load'
  })
  const preview = page.locator('[data-component-preview="accordion-disabled"]')
  // vx-bot/NOTE: Keep the lazy demo visible if hydration restores the page scroll.
  await expect
    .poll(
      async () => {
        await preview.evaluate(element =>
          element.scrollIntoView({ block: 'center', behavior: 'instant' })
        )
        return preview
          .getByRole('button', { name: 'Active Item', exact: true })
          .count()
      },
      { timeout: 20_000 }
    )
    .toBe(1)
  await expect(
    preview.getByRole('button', { name: 'Disabled Item 1', exact: true })
  ).toBeDisabled()
  await preview
    .getByRole('button', { name: 'Active Item', exact: true })
    .click()
  await expect(
    preview.getByText('This item is active and can be toggled normally.')
  ).toBeVisible()
  await preview.getByRole('tab', { name: 'Code', exact: true }).click()
  await expect(
    preview.getByRole('region', { name: 'Example source code' }).locator('pre')
  ).toContainText('@vezham/react-v3')
})

test('native setup documentation renders', async ({ page }) => {
  await page.goto('/docs/ui/react-v3/native/getting-started/quick-start', {
    waitUntil: 'load'
  })
  await expect(
    page.getByRole('heading', { name: 'Quick Start', level: 1, exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', {
      name: /Option 1: Create a New Project/,
      level: 2
    })
  ).toBeVisible()
  await expect(
    page.locator('pre').filter({ hasText: 'create-heroui-native-app' }).first()
  ).toBeVisible()
})
