import { useParams } from '@tanstack/react-router'
import { type ComponentProps, type ReactNode, useState } from 'react'

import { Callout } from '@vezham/docs-react/components/callout'
import { Tab, Tabs } from '@vezham/docs-react/components/tabs'
import { useTheme } from '@vezham/docs-react/provider/base'
import { Button } from '@vezham/react-v3'

import { herouiCatalog as catalog } from '@src/lib/docs/heroui-catalog'

export { Callout, Tab, Tabs }

type ImageProps = ComponentProps<'img'> & { darkSrc?: string }

export const DocsImage = ({ darkSrc, src, alt, ...props }: ImageProps) => {
  const { resolvedTheme } = useTheme()
  return (
    <img
      {...props}
      src={resolvedTheme === 'dark' && darkSrc ? darkSrc : src}
      alt={alt ?? ''}
      loading="lazy"
    />
  )
}

type VideoProps = {
  src?: string
  srcLight?: string
  srcDark?: string
  height?: number
  muted?: boolean
}

export const VideoPlayer = ({ src, srcLight, srcDark, height }: VideoProps) => {
  const { resolvedTheme } = useTheme()
  return (
    <video
      aria-label="HeroUI component demonstration"
      src={resolvedTheme === 'dark' && srcDark ? srcDark : (src ?? srcLight)}
      style={{ maxHeight: height ?? 480 }}
      className="my-6 w-full rounded-xl"
      controls
      playsInline
      muted
      preload="none"
    />
  )
}

export const NativeVideoPlayerView = VideoPlayer

const ComponentCategory = ({
  category,
  platform
}: {
  category: string
  platform: 'web' | 'native'
}) => {
  const { lang } = useParams({ strict: false })
  return (
    <ul className="not-prose my-6 grid list-none gap-4 p-0 sm:grid-cols-2">
      {catalog
        .filter(
          item =>
            item.platform === platform &&
            item.category === category.toLowerCase().replace(/ /g, '-')
        )
        .map(item => (
          <li key={item.url} className="rounded-xl border p-4">
            <a
              href={`${lang === 'cn' ? '/cn' : ''}${item.url}`}
              className="font-medium">
              {item.title}
            </a>
            <p className="text-muted mt-1 text-sm">{item.description}</p>
          </li>
        ))}
    </ul>
  )
}

export const ComponentsCategory = ({ category }: { category: string }) => (
  <ComponentCategory category={category} platform="web" />
)

export const NativeComponentsCategory = ({
  category
}: {
  category: string
}) => <ComponentCategory category={category} platform="native" />

export const CollapsibleCode = ({
  code,
  lang
}: {
  code: string
  lang?: string
}) => (
  <details className="my-4 rounded-xl border p-4">
    <summary>View {lang ?? ''} source</summary>
    <pre className="overflow-auto">
      <code>{code}</code>
    </pre>
  </details>
)

export const CopyPrompt = ({
  children,
  prompt
}: {
  children?: ReactNode
  prompt?: string
}) => {
  const [status, setStatus] = useState('Copy setup prompt')
  return (
    <div className="my-6 space-y-4 rounded-xl border p-6">
      {children}
      {prompt && (
        <Button
          variant="secondary"
          onPress={async () => {
            try {
              await navigator.clipboard.writeText(prompt)
              setStatus('Copied')
            } catch {
              setStatus('Select the prompt below to copy')
            }
          }}>
          {status}
        </Button>
      )}
      <details>
        <summary>View setup prompt</summary>
        <pre className="overflow-auto whitespace-pre-wrap">
          <code>{prompt}</code>
        </pre>
      </details>
      <span className="sr-only" role="status">
        {status}
      </span>
    </div>
  )
}

export const NativeImageHeroView = () => (
  <DocsImage
    src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/heroui-native-og-light-1.webp"
    darkSrc="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/heroui-native-og-dark-1.webp"
    alt="HeroUI Native"
  />
)

export const NativeTryOnDevice = () => (
  <p>
    <a href="https://heroui.com/docs/native/getting-started/quick-start">
      Try HeroUI Native on your device
    </a>
  </p>
)

export const PRContributors = () => (
  <p>
    <a href="https://github.com/heroui-inc/heroui/graphs/contributors">
      HeroUI contributors
    </a>
  </p>
)

export const RelatedComponents = ({ component }: { component: string }) => (
  <p>
    <a href="/docs-ui/web/components">
      Browse components related to {component}
    </a>
  </p>
)

export const RelatedShowcases = ({ component }: { component: string }) => (
  <p>
    <a href="https://heroui.com/showcase">
      Explore showcases using {component}
    </a>
  </p>
)

export const HandPointUp = () => <span aria-hidden="true">↑</span>

type ColorProps = {
  name?: string
  baseVariable?: string
  variable?: string
  baseTooltip?: string
  foregroundVariable?: string
  foregroundTooltip?: string
  hoverTooltip?: string
}

const ColorSection = ({
  name,
  baseVariable,
  variable,
  baseTooltip,
  foregroundVariable,
  foregroundTooltip,
  hoverTooltip
}: ColorProps) => (
  <div className="my-4 overflow-hidden rounded-xl border">
    <div
      className="p-6"
      style={{
        background: `var(${baseVariable ?? variable ?? '--background'})`,
        color: `var(${foregroundVariable ?? '--foreground'})`
      }}>
      {name}
    </div>
    <pre className="m-0 overflow-auto p-4 text-sm">
      <code>
        {[
          baseTooltip ?? baseVariable ?? variable,
          foregroundTooltip,
          hoverTooltip
        ]
          .filter(Boolean)
          .join('\n\n')}
      </code>
    </pre>
  </div>
)

export const ColorSectionSideBySide = ColorSection
export const ColorSectionStacked = ColorSection
export const ColorSectionFormField = ({
  colors
}: {
  colors: Record<string, string>
}) => (
  <dl className="my-4 grid gap-4 sm:grid-cols-2">
    {Object.entries(colors)
      .filter(([key]) => key.endsWith('Tooltip'))
      .map(([key, value]) => (
        <div key={key} className="rounded-xl border p-4">
          <dt className="text-muted text-sm">{key.replace('Tooltip', '')}</dt>
          <dd>
            <code className="whitespace-pre-wrap">{value}</code>
          </dd>
        </div>
      ))}
  </dl>
)

export const ColorSectionPrimitive = ({
  colors
}: {
  colors: { label: string; variable: string; tooltip: string }[]
}) => (
  <div className="my-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
    {colors.map(color => (
      <div key={color.variable} className="overflow-hidden rounded-xl border">
        <div
          className="h-16"
          style={{ background: `var(${color.variable})` }}
        />
        <div className="p-3">
          <p className="font-medium">{color.label}</p>
          <code className="text-xs">{color.tooltip}</code>
        </div>
      </div>
    ))}
  </div>
)
