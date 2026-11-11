import { fireEvent, render, waitFor } from '@testing-library/react'
import type { ComponentProps } from 'react'

import { NotebookDrawerHeader } from './notebook-drawer'

const { navigate, close } = vi.hoisted(() => ({
  navigate: vi.fn(),
  close: vi.fn()
}))

vi.mock('@tanstack/react-router', async original => ({
  ...(await original<typeof import('@tanstack/react-router')>()),
  useNavigate: () => navigate
}))

vi.mock('@vezham/docs-react/layouts/notebook', () => ({
  useNotebookLayout: () => ({
    slots: {
      sidebar: {
        trigger: (props: ComponentProps<'button'>) => (
          <button {...props} onClick={close} />
        )
      }
    }
  })
}))

vi.mock('../brand', () => ({
  Brand: { Link: () => <a href="/">Vezham Developers</a> }
}))

describe('notebook drawer', () => {
  beforeEach(() => vi.clearAllMocks())

  it.each(['en', 'cn'] as const)(
    'keeps the active section in sync and navigates with the %s locale',
    async locale => {
      const prefix = locale === 'cn' ? '/cn' : ''
      const props = {
        locale,
        sections: [
          {
            id: 'start',
            title: 'Getting Started',
            url: `${prefix}/docs/packages/env/getting-started`
          },
          {
            id: 'guides',
            title: 'Guides',
            url: `${prefix}/docs/packages/env/guides`
          }
        ]
      }
      const view = render(
        <NotebookDrawerHeader {...props} selectedSection="start" />
      )
      const triggers = () =>
        view.getAllByRole('button', { name: /Documentation section/ })
      expect(triggers()[0].textContent).toContain('Getting Started')
      fireEvent.click(triggers()[0])
      fireEvent.click(await view.findByRole('option', { name: 'Guides' }))
      await waitFor(() =>
        expect(navigate).toHaveBeenCalledWith({
          to: `${prefix}/docs/packages/env/guides`
        })
      )
      view.rerender(
        <NotebookDrawerHeader {...props} selectedSection="guides" />
      )
      for (const trigger of triggers())
        expect(trigger.textContent).toContain('Guides')
      fireEvent.click(view.getByRole('button', { name: 'Close sidebar' }))
      expect(close).toHaveBeenCalledOnce()
    }
  )
})
