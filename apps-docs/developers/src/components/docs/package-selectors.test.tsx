import { fireEvent, render, waitFor } from '@testing-library/react'

import { docsPackageIds, docsPackages } from '../../config/packages'
import { PackageSelector, PackageVersionSelector } from './package-selectors'

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }))
vi.mock('@tanstack/react-router', async original => ({
  ...(await original<typeof import('@tanstack/react-router')>()),
  useNavigate: () => navigate
}))

describe('package selectors', () => {
  beforeEach(() => navigate.mockClear())

  it.each(['en', 'cn'] as const)(
    'lists all packages and preserves the section for %s',
    async locale => {
      const view = render(
        <PackageSelector packageId="env" locale={locale} page="guides" />
      )
      fireEvent.click(view.getByRole('button', { name: /Choose package/ }))
      for (const id of docsPackageIds)
        expect(
          await view.findByRole('option', {
            name: docsPackages[id].name
          })
        ).toBeTruthy()
      fireEvent.click(view.getByRole('option', { name: '@vezham/hooks' }))
      await waitFor(() =>
        expect(navigate).toHaveBeenCalledWith({
          to: `${locale === 'cn' ? '/cn' : ''}/docs/packages/hooks/guides`
        })
      )
    }
  )

  it('shows only the current documented version as Latest', async () => {
    const view = render(<PackageVersionSelector packageId="env" />)
    expect(
      view.getByRole('button', { name: /Package version/ }).textContent
    ).toContain(docsPackages.env.version)
    fireEvent.click(view.getByRole('button', { name: /Package version/ }))
    expect(await view.findByText('Latest')).toBeTruthy()
    const options = view.getAllByRole('option')
    expect(options).toHaveLength(1)
    expect(options[0].getAttribute('aria-selected')).toBe('true')
  })
})
