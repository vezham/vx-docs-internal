import { type ReactNode, createElement, useCallback } from 'react'

import {
  Alert,
  Button,
  Label,
  ListBox,
  Select,
  Spinner
} from '@vezham/react-v3'

import type { IconWeight } from '@src/lib/icon-library/catalog'
import { applyIconSecondaryColor } from '@src/lib/icon-library/runtime'

export const AssetSelect = ({
  label,
  value,
  options,
  onChange
}: {
  label: string
  value: string
  options: { id: string; title: string }[]
  onChange: (value: string) => void
}) => (
  <Select
    selectedKey={value}
    onSelectionChange={key => {
      if (key !== null) onChange(String(key))
    }}
    className="min-w-36">
    <Label>{label}</Label>
    <Select.Trigger>
      <Select.Value />
      <Select.Indicator />
    </Select.Trigger>
    <Select.Popover>
      <ListBox items={options} aria-label={label}>
        {item => (
          <ListBox.Item id={item.id} textValue={item.title}>
            {item.title}
            <ListBox.ItemIndicator />
          </ListBox.Item>
        )}
      </ListBox>
    </Select.Popover>
  </Select>
)

export const CdnIcon = ({
  name,
  weight = 'outline',
  size = 36,
  color = 'currentColor',
  secondaryColor = color
}: {
  name: string
  weight?: IconWeight
  size?: number
  color?: string
  secondaryColor?: string
}) => {
  const attach = useCallback(
    (element: HTMLElement | null) => {
      const root = element?.shadowRoot
      if (!root || !weight.startsWith('duotone')) return
      const update = () => {
        const svg = root.querySelector('svg')
        if (svg) applyIconSecondaryColor(svg, weight)
      }
      update()
      const observer = new MutationObserver(update)
      observer.observe(root, { childList: true, subtree: true })
      return () => observer.disconnect()
    },
    [weight]
  )
  return createElement('vx-icon', {
    ref: attach,
    icon: name,
    weight,
    size: String(size),
    color,
    'secondary-color': secondaryColor,
    decorative: '',
    'aria-hidden': 'true',
    loading: 'lazy',
    style: { display: 'inline-block', width: size, height: size }
  })
}

export const ResourceStatus = ({
  error,
  loading,
  retry,
  children
}: {
  error?: string
  loading: boolean
  retry: () => void
  children: ReactNode
}) => {
  if (loading)
    return (
      <div
        className="flex min-h-72 items-center justify-center gap-3"
        role="status">
        <Spinner size="sm" />
        Loading the collection…
      </div>
    )
  if (error)
    return (
      <Alert status="danger">
        <Alert.Content>
          <Alert.Title>Unable to load</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Content>
        <Button variant="secondary" onPress={retry}>
          Try again
        </Button>
      </Alert>
    )
  return children
}
