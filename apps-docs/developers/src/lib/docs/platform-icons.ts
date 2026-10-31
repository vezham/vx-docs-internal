import { type ReactNode, createElement, isValidElement } from 'react'

import {
  Book,
  Book2,
  CodeFile,
  CodeSquare,
  Copy,
  Figma,
  Layers,
  Moon,
  PaintBrush,
  Palette,
  Rocket,
  Route,
  Star,
  Widget
} from '@vezham/icons-react'

const icons: Record<string, typeof Book> = {
  'circles-4-diamond': Widget,
  'book-open': Book2,
  route: Route,
  rocket: Rocket,
  sparkles: Star,
  figma: Figma,
  'code-pull-request-arrow-right': CodeFile,
  'copy-transparent': Copy,
  'bucket-paint': Palette,
  layers: Layers,
  windows: Widget,
  'chevrons-expand-horizontal': CodeSquare,
  brush: PaintBrush,
  palette: Palette,
  book: Book,
  moon: Moon,
  terminal: CodeSquare
}

export const resolvePlatformIcon = (icon: ReactNode): ReactNode => {
  if (!isValidElement<{ 'data-vx-icon'?: string }>(icon)) return icon
  const name = icon.props['data-vx-icon']
  if (!name) return icon
  // vx-bot/NOTE: Upstream icon names do not all exist in the generic docs icon CDN.
  return createElement(icons[name] ?? CodeFile, {
    size: 16,
    'aria-hidden': true
  })
}
