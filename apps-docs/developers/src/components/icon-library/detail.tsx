import {
  Link as RouterLink,
  type SearchSchemaInput
} from '@tanstack/react-router'
import { useCallback, useState } from 'react'

import { useTheme } from '@vezham/docs-react/provider/base'
import { CodeBlock } from '@vezham/react-pro-v3/code-block'
import {
  Breadcrumbs,
  Button,
  Card,
  Chip,
  ColorField,
  ColorSwatch,
  Label,
  Link,
  Slider,
  Tabs,
  parseColor
} from '@vezham/react-v3'

import { i18n } from '@app/docs'
import type { Locale } from '@generated/vx'
import {
  type AssetKind,
  type IconWeight,
  assetUrl,
  catalogRoutes,
  detailRoutes,
  formatLabel,
  kindLabels,
  loadCatalog
} from '@src/lib/icon-library/catalog'
import {
  getIconSvg,
  iconCdnUrl,
  loadIconRuntime
} from '@src/lib/icon-library/runtime'
import { downloadSvg, fetchAssetSvg } from '@src/lib/icon-library/svg'
import { useResource } from '@src/lib/icon-library/use-resource'

import { AssetSelect, CdnIcon, ResourceStatus } from './controls'
import { AssetShell } from './shell'

export const parseDetailSearch = (
  input: Record<string, unknown> & SearchSchemaInput
) => ({
  weight: typeof input.weight === 'string' ? input.weight : 'outline'
})

const Snippet = ({ code, language }: { code: string; language: string }) => {
  const { resolvedTheme } = useTheme()
  return (
    <CodeBlock className="min-w-0">
      <CodeBlock.Header>
        <span className="text-muted text-sm">{language}</span>
        <CodeBlock.CopyButton code={code} />
      </CodeBlock.Header>
      <CodeBlock.Code
        code={code}
        language={language}
        theme={resolvedTheme === 'dark' ? 'github-dark' : 'github-light'}
        className="max-h-96 overflow-auto"
      />
    </CodeBlock>
  )
}

const SvgSource = ({
  name,
  source,
  weight,
  size,
  color,
  secondaryColor
}: {
  name: string
  source?: string
  weight: string
  size: number
  color: string
  secondaryColor: string
}) => {
  const load = useCallback(
    () =>
      source
        ? fetchAssetSvg(source)
        : getIconSvg(name, weight, size, color, secondaryColor),
    [source, name, weight, size, color, secondaryColor]
  )
  const resource = useResource(
    `${source ?? name}:${weight}:${size}:${color}:${secondaryColor}`,
    load
  )
  return (
    <ResourceStatus
      loading={resource.loading}
      error={resource.error}
      retry={resource.retry}>
      <Snippet
        code={(resource.data ?? '').replace(/></g, '>\n<')}
        language="xml"
      />
    </ResourceStatus>
  )
}

type Props = {
  kind: AssetKind
  name: string
  locale: Locale
  initialWeight?: string
}
export const AssetDetail = ({
  kind,
  name,
  locale,
  initialWeight = 'outline'
}: Props) => {
  const loader = useCallback(async () => {
    const [assets] = await Promise.all([
      loadCatalog(kind),
      kind === 'icons' ? loadIconRuntime() : Promise.resolve()
    ])
    return assets
  }, [kind])
  const resource = useResource(kind, loader)
  const asset = resource.data?.find(
    item =>
      item.slug === name || item.title.toLowerCase() === name.toLowerCase()
  )
  const [weight, setWeight] = useState(initialWeight)
  const [size, setSize] = useState(128)
  const [exportSize, setExportSize] = useState('128')
  const [color, setColor] = useState('#0485f7')
  const [secondaryColor, setSecondaryColor] = useState('#9ecfff')
  const [variant, setVariant] = useState('original')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const activeWeight = asset?.weights.includes(weight as IconWeight)
    ? (weight as IconWeight)
    : (asset?.weights[0] ?? 'outline')
  const activeVariant = asset?.variants[variant]
    ? variant
    : asset?.variants.original
      ? 'original'
      : (Object.keys(asset?.variants ?? {})[0] ?? 'original')
  const source =
    asset && kind !== 'icons' ? assetUrl(kind, asset, activeVariant) : ''
  const embedSource =
    source && typeof window !== 'undefined'
      ? new URL(source, window.location.origin).href
      : source
  const lang = locale === i18n.defaultLanguage ? undefined : locale
  const loadSvg = () =>
    kind === 'icons' && asset
      ? getIconSvg(
          asset.slug,
          activeWeight,
          Number(exportSize),
          color,
          secondaryColor
        )
      : fetchAssetSvg(source)
  const copySvg = async () => {
    if (!asset) return
    setBusy(true)
    try {
      await navigator.clipboard.writeText(await loadSvg())
      setMessage('SVG copied to clipboard.')
    } catch (error: unknown) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to copy. Use the SVG source tab and try again.'
      )
    } finally {
      setBusy(false)
    }
  }
  const exportFile = async (format: 'svg' | 'png' | 'webp') => {
    if (!asset) return
    setBusy(true)
    try {
      const svg = await loadSvg()
      const filename =
        kind === 'icons'
          ? `${asset.slug}-${activeWeight}-${exportSize}`
          : `${asset.slug}${kind === 'logos' ? '-' + activeVariant : ''}${format === 'svg' ? '' : '-' + exportSize}`
      await downloadSvg(svg, filename, format, Number(exportSize))
      setMessage(
        format === 'svg'
          ? 'SVG downloaded.'
          : `${format.toUpperCase()} exported at ${exportSize}px.`
      )
    } catch (error: unknown) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Export failed. Please try again.'
      )
    } finally {
      setBusy(false)
    }
  }
  const reset = () => {
    setWeight('outline')
    setSize(128)
    setExportSize('128')
    setColor('#0485f7')
    setSecondaryColor('#9ecfff')
    setVariant('original')
    setMessage('')
  }
  const snippets = asset
    ? kind === 'icons'
      ? [
          {
            id: 'cdn',
            title: 'CDN',
            language: 'html',
            code: `<script defer src="${iconCdnUrl}"></script>\n\n<vx-icon icon="${asset.slug}" weight="${activeWeight}" size="${size}" color="${color}" secondary-color="${secondaryColor}"></vx-icon>`
          },
          {
            id: 'react',
            title: 'React',
            language: 'tsx',
            code: `import { ${asset.title} } from '@vezham/icons-react';\n\n<${asset.title} size={${size}} weight="${activeWeight}" color="${color}" secondaryColor="${secondaryColor}" />`
          },
          {
            id: 'react-native',
            title: 'React Native',
            language: 'tsx',
            code: `import { ${asset.title} } from '@vezham/icons-react-native';\n\n<${asset.title} size={${size}} weight="${activeWeight}" color="${color}" secondaryColor="${secondaryColor}" />`
          },
          {
            id: 'vue',
            title: 'Vue',
            language: 'vue',
            code: `<script setup>\nimport { ${asset.title} } from '@vezham/icons-vue';\n</script>\n\n<template>\n  <${asset.title} :size="${size}" weight="${activeWeight}" color="${color}" secondaryColor="${secondaryColor}" />\n</template>`
          },
          {
            id: 'svelte',
            title: 'Svelte',
            language: 'svelte',
            code: `<script>\nimport { ${asset.title} } from '@vezham/icons-svelte';\n</script>\n\n<${asset.title} size={${size}} weight="${activeWeight}" color="${color}" secondaryColor="${secondaryColor}" />`
          }
        ]
      : [
          {
            id: 'html',
            title: 'HTML',
            language: 'html',
            code: `<img src="${embedSource}" alt="${asset.title}" width="${size}" height="${size}" />`
          },
          {
            id: 'react',
            title: 'React',
            language: 'tsx',
            code: `export const ${kind === 'logos' ? 'BrandLogo' : 'Illustration'} = () => (\n  <img src=${JSON.stringify(embedSource)} alt=${JSON.stringify(asset.title)} width={${size}} height={${size}} />\n);`
          },
          {
            id: 'css',
            title: 'CSS',
            language: 'css',
            code: `.asset {\n  width: ${size}px;\n  height: ${size}px;\n  background: center / contain no-repeat url("${embedSource}");\n}`
          }
        ]
    : []
  const related =
    resource.data
      ?.filter(
        item => item.category === asset?.category && item.slug !== asset?.slug
      )
      .slice(0, 8) ?? []

  return (
    <AssetShell active={kind} locale={locale}>
      <Breadcrumbs>
        <Breadcrumbs.Item
          href={`${lang ? '/' + lang : ''}${catalogRoutes[kind]}`}>
          {kindLabels[kind]}
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>{asset?.title ?? formatLabel(name)}</Breadcrumbs.Item>
      </Breadcrumbs>
      <ResourceStatus
        loading={resource.loading}
        error={resource.error}
        retry={resource.retry}>
        {!asset ? (
          <div className="py-20 text-center">
            <h1 className="text-3xl font-semibold">Asset not found</h1>
            <p className="text-muted mt-3">
              This asset is not in the current collection.
            </p>
            <Link
              href={`${lang ? '/' + lang : ''}${catalogRoutes[kind]}`}
              className="mt-6">
              Browse {kindLabels[kind].toLowerCase()}
            </Link>
          </div>
        ) : (
          <>
            <header className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                {kind === 'icons' ? formatLabel(asset.slug) : asset.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                <Chip variant="soft">
                  <Chip.Label>{formatLabel(asset.category)}</Chip.Label>
                </Chip>
                {asset.subcategory && (
                  <Chip variant="soft">
                    <Chip.Label>{formatLabel(asset.subcategory)}</Chip.Label>
                  </Chip>
                )}
                <span className="text-muted text-sm">{asset.slug}</span>
              </div>
            </header>
            <div className="grid min-w-0 gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
              <div className="space-y-6">
                <Card>
                  <Card.Content
                    className={`flex min-h-80 items-center justify-center overflow-hidden ${kind === 'logos' ? (activeVariant.includes('white') ? 'bg-black' : 'bg-white') : ''}`}>
                    {kind === 'icons' ? (
                      <CdnIcon
                        name={asset.slug}
                        weight={activeWeight}
                        size={size}
                        color={color}
                        secondaryColor={secondaryColor}
                      />
                    ) : (
                      <img
                        src={source}
                        alt={asset.title}
                        width={size}
                        height={size}
                        style={{ width: size, height: size }}
                        className="max-w-full object-contain"
                      />
                    )}
                  </Card.Content>
                </Card>
                <Slider
                  aria-label="Preview size"
                  value={size}
                  minValue={24}
                  maxValue={256}
                  step={8}
                  onChange={value => setSize(Number(value))}>
                  <Label>Preview size</Label>
                  <Slider.Output />
                  <Slider.Track>
                    <Slider.Fill />
                    <Slider.Thumb />
                  </Slider.Track>
                </Slider>
                {kind === 'icons' && (
                  <>
                    <AssetSelect
                      label="Weight"
                      value={activeWeight}
                      options={asset.weights.map(id => ({
                        id,
                        title: formatLabel(id)
                      }))}
                      onChange={setWeight}
                    />
                    <ColorField
                      value={parseColor(color)}
                      onChange={value => {
                        if (value) setColor(value.toString('hex'))
                      }}>
                      <Label>Primary color</Label>
                      <ColorField.Group>
                        <ColorField.Prefix>
                          <ColorSwatch color={color} size="xs" />
                        </ColorField.Prefix>
                        <ColorField.Input />
                      </ColorField.Group>
                    </ColorField>
                    {activeWeight.startsWith('duotone') && (
                      <ColorField
                        value={parseColor(secondaryColor)}
                        onChange={value => {
                          if (value) setSecondaryColor(value.toString('hex'))
                        }}>
                        <Label>Secondary color</Label>
                        <ColorField.Group>
                          <ColorField.Prefix>
                            <ColorSwatch color={secondaryColor} size="xs" />
                          </ColorField.Prefix>
                          <ColorField.Input />
                        </ColorField.Group>
                      </ColorField>
                    )}
                  </>
                )}
                {kind === 'logos' && (
                  <AssetSelect
                    label="Logo variant"
                    value={activeVariant}
                    options={Object.keys(asset.variants).map(id => ({
                      id,
                      title: formatLabel(id)
                    }))}
                    onChange={setVariant}
                  />
                )}
                <Button variant="tertiary" onPress={reset}>
                  Reset preview
                </Button>
              </div>
              <div className="min-w-0 space-y-6">
                <div className="flex flex-wrap items-end gap-3">
                  <AssetSelect
                    label="Export size"
                    value={exportSize}
                    options={[32, 64, 128, 256, 512, 1024].map(n => ({
                      id: String(n),
                      title: `${n}px`
                    }))}
                    onChange={setExportSize}
                  />
                  <Button isDisabled={busy} onPress={() => void copySvg()}>
                    Copy SVG
                  </Button>
                  <Button
                    variant="secondary"
                    isDisabled={busy}
                    onPress={() => void exportFile('svg')}>
                    Download SVG
                  </Button>
                  <Button
                    variant="secondary"
                    isDisabled={busy}
                    onPress={() => void exportFile('png')}>
                    PNG
                  </Button>
                  <Button
                    variant="secondary"
                    isDisabled={busy}
                    onPress={() => void exportFile('webp')}>
                    WebP
                  </Button>
                  {kind !== 'icons' && (
                    <Link
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer">
                      Open SVG
                      <Link.Icon />
                    </Link>
                  )}
                </div>
                <p
                  role="status"
                  aria-live="polite"
                  className="text-muted min-h-5 text-sm">
                  {busy
                    ? 'Preparing your SVG…'
                    : message ||
                      'Copy the SVG, export an image, or use an embed snippet below.'}
                </p>
                <Tabs defaultSelectedKey={snippets[0]?.id}>
                  <Tabs.ListContainer>
                    <Tabs.List aria-label="Integration code">
                      {snippets.map(snippet => (
                        <Tabs.Tab id={snippet.id} key={snippet.id}>
                          {snippet.title}
                          <Tabs.Indicator />
                        </Tabs.Tab>
                      ))}
                      <Tabs.Tab id="svg">
                        SVG
                        <Tabs.Indicator />
                      </Tabs.Tab>
                    </Tabs.List>
                  </Tabs.ListContainer>
                  {snippets.map(snippet => (
                    <Tabs.Panel id={snippet.id} key={snippet.id}>
                      <Snippet
                        code={snippet.code}
                        language={snippet.language}
                      />
                    </Tabs.Panel>
                  ))}
                  <Tabs.Panel id="svg">
                    <SvgSource
                      name={asset.slug}
                      source={kind === 'icons' ? undefined : source}
                      weight={activeWeight}
                      size={Number(exportSize)}
                      color={color}
                      secondaryColor={secondaryColor}
                    />
                  </Tabs.Panel>
                </Tabs>
                <Link
                  href={`${lang ? '/' + lang : ''}/docs/${kind === 'icons' ? 'vanilla' : 'svg'}`}>
                  Read the integration guide
                  <Link.Icon />
                </Link>
              </div>
            </div>
            {related.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">
                  More in {formatLabel(asset.category)}
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                  {related.map(item => (
                    <RouterLink
                      key={item.slug}
                      to={detailRoutes[kind]}
                      params={{ lang, name: item.slug }}
                      search={{}}
                      className="min-w-0 no-underline">
                      <Card className="h-full">
                        <Card.Content
                          className={`flex min-h-24 items-center justify-center ${kind === 'logos' ? 'bg-white' : ''}`}>
                          {kind === 'icons' ? (
                            <CdnIcon name={item.slug} size={32} />
                          ) : (
                            <img
                              src={assetUrl(kind, item)}
                              alt=""
                              loading="lazy"
                              className="max-h-20 max-w-full object-contain"
                            />
                          )}
                        </Card.Content>
                        <Card.Footer>
                          <span className="truncate text-xs">
                            {formatLabel(item.slug)}
                          </span>
                        </Card.Footer>
                      </Card>
                    </RouterLink>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </ResourceStatus>
    </AssetShell>
  )
}
