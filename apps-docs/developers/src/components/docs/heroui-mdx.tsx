import { type ComponentProps, type ReactNode, use, useState } from 'react'

import { Callout } from '@vezham/docs-react/components/callout'
import { Tab, Tabs } from '@vezham/docs-react/components/tabs'
import { Button } from '@vezham/react-v3'

import { PageMetadata } from './page-metadata'

export { Callout, Tab, Tabs }
export { ComponentPreview } from '@components/docs/component-preview'

export {
  DocsImage,
  VideoPlayer,
  NativeVideoPlayerView,
  NativeImageHeroView,
  NativeTryOnDevice
} from './docs-media'

export {
  ComponentsCategory,
  NativeComponentsCategory
} from './component-gallery'

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

export const PRContributors = () => {
  const { github, platform } = use(PageMetadata)
  if (!github?.pull) return null
  const repo = platform === 'native' ? 'heroui-native' : 'heroui'
  return (
    <p>
      <a
        href={`https://github.com/heroui-inc/${repo}/pull/${github.pull}`}
        target="_blank"
        rel="noopener noreferrer">
        Contributors to pull request #{github.pull}
      </a>
    </p>
  )
}

export { RelatedComponents, RelatedShowcases } from './related-content'

export const HandPointUp = (props: ComponentProps<'span'>) => (
  <span {...props} aria-hidden="true">
    ↑
  </span>
)

export {
  ColorSectionFormField,
  ColorSectionPrimitive,
  ColorSectionSideBySide,
  ColorSectionStacked
} from './color-sections'
