import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { ComponentPreview } from './index'

const animations = Object.getOwnPropertyDescriptor(
  Element.prototype,
  'getAnimations'
)

beforeEach(() => {
  Object.defineProperty(Element.prototype, 'getAnimations', {
    configurable: true,
    value: () => []
  })
})

afterEach(() => {
  if (animations)
    Object.defineProperty(Element.prototype, 'getAnimations', animations)
  else Reflect.deleteProperty(Element.prototype, 'getAnimations')
})

describe('local component previews', () => {
  it('renders the disabled accordion and its active items', async () => {
    render(
      <ComponentPreview name="accordion-disabled">
        <pre>Example source</pre>
      </ComponentPreview>
    )
    expect(
      await screen.findByRole('button', { name: 'Disabled Item 1' })
    ).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Active Item' }))
    expect(
      await screen.findByText(
        'This item is active and can be toggled normally.'
      )
    ).toBeVisible()
    fireEvent.click(screen.getByRole('tab', { name: 'Code' }))
    expect(await screen.findByText('Example source')).toBeVisible()
  })
})
