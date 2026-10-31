import { useRef, useState } from 'react'

import { Button, Tooltip } from '@vezham/react-v3'

type Swatch = {
  label: string
  variable: string
  cssValue?: string
  border?: boolean
  tooltip?: string
}

const colorValue = (value: string) =>
  value.startsWith('--') ? `var(${value})` : value

const ColorSwatch = ({ label, variable, cssValue, tooltip }: Swatch) => {
  const ref = useRef<HTMLButtonElement>(null)
  const [status, setStatus] = useState('')
  const background = colorValue(cssValue ?? variable)
  return (
    <Tooltip delay={0}>
      <Button
        ref={ref}
        aria-label={`Copy ${label} color`}
        variant="ghost"
        className="h-auto min-h-16 w-full min-w-0 flex-col items-start gap-1 rounded-xl border px-4 py-3 text-start"
        style={{ backgroundColor: background }}
        onPress={async () => {
          if (!ref.current) return
          try {
            await navigator.clipboard.writeText(
              getComputedStyle(ref.current).backgroundColor
            )
            setStatus('Copied color value')
          } catch {
            setStatus(`Color token: ${cssValue ?? variable}`)
          }
        }}>
        <span
          style={{
            backgroundColor: background,
            backgroundClip: 'text',
            color: 'transparent',
            filter: 'invert(1) grayscale(1) contrast(100)'
          }}>
          {label}
        </span>
        <span className="sr-only" role="status">
          {status}
        </span>
      </Button>
      <Tooltip.Content className="max-w-xs font-mono text-xs whitespace-pre-wrap">
        {status || tooltip || cssValue || variable}
      </Tooltip.Content>
    </Tooltip>
  )
}

const ThemeSwatches = ({
  theme,
  colors
}: {
  theme: 'light' | 'dark'
  colors: Swatch[]
}) => (
  <section
    data-theme={theme}
    className={`${theme} min-w-0 space-y-2 rounded-xl`}
    aria-label={`${theme} color tokens`}>
    <p className="text-muted text-xs capitalize">{theme}</p>
    <div className="grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(120px,1fr))]">
      {colors.map(color => (
        <ColorSwatch key={`${color.variable}:${color.label}`} {...color} />
      ))}
    </div>
  </section>
)

export const ColorSectionStacked = ({
  lightColors,
  darkColors
}: {
  lightColors: Swatch[]
  darkColors: Swatch[]
}) => (
  <div className="not-prose my-4 space-y-4">
    <ThemeSwatches theme="light" colors={lightColors} />
    <ThemeSwatches theme="dark" colors={darkColors} />
  </div>
)

type ColorGroup = {
  baseVariable: string
  baseCssValue?: string
  baseTooltip?: string
  hoverVariable: string
  hoverCssValue?: string
  hoverTooltip?: string
  foregroundVariable: string
  foregroundCssValue?: string
  foregroundTooltip?: string
}

export const ColorSectionSideBySide = ({
  name,
  soft,
  ...colors
}: ColorGroup & { name: string; soft?: ColorGroup }) => {
  const swatches = (group: ColorGroup, prefix: string): Swatch[] => [
    {
      label: `${prefix} Base`,
      variable: group.baseVariable,
      cssValue: group.baseCssValue,
      tooltip: group.baseTooltip
    },
    {
      label: `${prefix} Hover`,
      variable: group.hoverVariable,
      cssValue: group.hoverCssValue,
      tooltip: group.hoverTooltip
    },
    {
      label: `${prefix} Foreground`,
      variable: group.foregroundVariable,
      cssValue: group.foregroundCssValue,
      tooltip: group.foregroundTooltip
    }
  ]
  const all = [
    ...swatches(colors, name),
    ...(soft ? swatches(soft, `${name} Soft`) : [])
  ]
  return (
    <div className="not-prose my-4 grid gap-4 sm:grid-cols-2">
      <ThemeSwatches theme="light" colors={all} />
      <ThemeSwatches theme="dark" colors={all} />
    </div>
  )
}

type FieldColors = {
  bg: string
  bgTooltip?: string
  bgHover: string
  bgHoverTooltip?: string
  bgFocusTooltip?: string
  placeholder: string
  placeholderTooltip?: string
  foreground: string
  foregroundTooltip?: string
}

export const ColorSectionFormField = ({ colors }: { colors: FieldColors }) => {
  const swatches: Swatch[] = [
    { label: 'Background', variable: colors.bg, tooltip: colors.bgTooltip },
    {
      label: 'Hover',
      variable: colors.bg,
      cssValue: colors.bgHover,
      tooltip: colors.bgHoverTooltip
    },
    { label: 'Focus', variable: colors.bg, tooltip: colors.bgFocusTooltip },
    {
      label: 'Placeholder',
      variable: colors.placeholder,
      tooltip: colors.placeholderTooltip
    },
    {
      label: 'Foreground',
      variable: colors.foreground,
      tooltip: colors.foregroundTooltip
    }
  ]
  return <ColorSectionStacked lightColors={swatches} darkColors={swatches} />
}

export const ColorSectionPrimitive = ({ colors }: { colors: Swatch[] }) => (
  <div className="not-prose my-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
    {colors.map(color => (
      <ColorSwatch key={color.variable} {...color} />
    ))}
  </div>
)
