import { expect, test } from '@vezham/config/playwright/test'

test('accordion examples run locally and expose their source', async ({
  page
}) => {
  await page.goto('/docs-ui/web/components/accordion', {
    waitUntil: 'networkidle'
  })
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
  await expect(preview.locator('pre')).toContainText('@vezham/react-v3')
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
