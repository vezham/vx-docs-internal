import { Link as RouterLink, useHydrated } from '@tanstack/react-router'
import { useCallback, useDeferredValue, useMemo } from 'react'

import { Card, Chip, Pagination, SearchField } from '@vezham/react-v3'

import { i18n } from '@app/docs'
import type { Locale } from '@generated/vx'
import {
  type AssetKind,
  type CatalogSearch,
  assetUrl,
  detailRoutes,
  filterAssets,
  formatLabel,
  iconWeights,
  kindLabels,
  loadCatalog,
  parseCatalogSearch
} from '@src/lib/icon-library/catalog'
import { loadIconRuntime } from '@src/lib/icon-library/runtime'
import { useResource } from '@src/lib/icon-library/use-resource'

import { AssetSelect, CdnIcon, ResourceStatus } from './controls'
import { AssetShell } from './shell'

const pageSize = 60
type Props = {
  kind: AssetKind
  locale: Locale
  search: CatalogSearch
  onSearchChange: (search: CatalogSearch) => void
}

export const AssetGallery = ({
  kind,
  locale,
  search: routeSearch,
  onSearchChange
}: Props) => {
  // vx-bot/NOTE: Static HTML contains default filters; restore URL filters after hydration.
  const search = useHydrated() ? routeSearch : parseCatalogSearch({}, kind)
  const loader = useCallback(async () => {
    const [assets] = await Promise.all([
      loadCatalog(kind),
      kind === 'icons' ? loadIconRuntime() : Promise.resolve()
    ])
    return assets
  }, [kind])
  const resource = useResource(kind, loader)
  const assets = resource.data
  const query = useDeferredValue(search.q)
  const results = useMemo(
    () => filterAssets(assets ?? [], { ...search, q: query }, kind),
    [assets, search, query, kind]
  )
  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const asset of assets ?? []) {
      const matchesWeight =
        kind !== 'icons' || asset.weights.includes(search.weight)
      counts.set(
        asset.category,
        (counts.get(asset.category) ?? 0) + (matchesWeight ? 1 : 0)
      )
    }
    return [
      { id: 'all', title: 'All categories' },
      ...Array.from(counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([id, count]) => ({
          id,
          title: `${formatLabel(id)} (${count.toLocaleString()})`
        }))
    ]
  }, [assets, kind, search.weight])
  const update = (patch: Partial<CatalogSearch>) =>
    onSearchChange({ ...search, page: 1, ...patch })
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize))
  const page = Math.min(search.page, totalPages)
  const shown = results.slice((page - 1) * pageSize, page * pageSize)

  return (
    <AssetShell active={kind} locale={locale}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {kindLabels[kind]}
          </h1>
          <p className="text-muted">
            {kind === 'icons'
              ? 'Find the right icon. Make it yours.'
              : kind === 'illustrations'
                ? 'A little character for your next project.'
                : 'Find a brand, choose a variant, and get its SVG.'}
          </p>
        </div>
        {assets && (
          <Chip variant="soft">
            <Chip.Label>
              {assets.length.toLocaleString()} {kindLabels[kind].toLowerCase()}
              {kind === 'icons' ? ' · v1.0.7' : ''}
            </Chip.Label>
          </Chip>
        )}
      </header>
      <div className="flex flex-wrap items-end gap-4">
        <SearchField
          aria-label={`Search ${kindLabels[kind].toLowerCase()}`}
          value={search.q}
          onChange={q => update({ q })}
          className="min-w-56 flex-1">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input
              placeholder={`Search ${kindLabels[kind].toLowerCase()}…`}
            />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <AssetSelect
          label="Category"
          value={search.category}
          options={categories}
          onChange={category => update({ category })}
        />
        {kind === 'icons' && (
          <AssetSelect
            label="Weight"
            value={search.weight}
            options={iconWeights.map(id => ({ id, title: formatLabel(id) }))}
            onChange={weight =>
              update({ weight: weight as CatalogSearch['weight'] })
            }
          />
        )}
        <AssetSelect
          label="Preview size"
          value={String(search.size)}
          options={(kind === 'icons'
            ? [24, 36, 48, 60, 72]
            : [48, 72, 96, 120, 144]
          ).map(size => ({
            id: String(size),
            title: `${size}px`
          }))}
          onChange={size => update({ size: Number(size) })}
        />
        <AssetSelect
          label="Sort"
          value={search.sort}
          options={[
            { id: 'featured', title: 'Featured' },
            { id: 'az', title: 'Name A–Z' },
            { id: 'za', title: 'Name Z–A' }
          ]}
          onChange={sort => update({ sort: sort as CatalogSearch['sort'] })}
        />
      </div>
      <ResourceStatus
        error={resource.error}
        loading={resource.loading}
        retry={resource.retry}>
        <div className="space-y-6">
          <p className="text-muted text-sm" aria-live="polite">
            {results.length.toLocaleString()}{' '}
            {results.length === 1 ? 'result' : 'results'}
            {search.q ? ` for “${search.q}”` : ''}
          </p>
          {shown.length ? (
            <div
              aria-label={`${kindLabels[kind]} results`}
              className={`grid gap-3 ${kind === 'icons' ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
              {shown.map(asset => (
                <RouterLink
                  key={asset.slug}
                  to={detailRoutes[kind]}
                  params={{
                    lang: locale === i18n.defaultLanguage ? undefined : locale,
                    name: asset.slug
                  }}
                  search={kind === 'icons' ? { weight: search.weight } : {}}
                  className="min-w-0 no-underline"
                  aria-label={`View ${asset.title}`}>
                  <Card className="h-full">
                    <Card.Content
                      className={`flex items-center justify-center ${kind === 'icons' ? 'min-h-24' : 'min-h-40'} ${kind === 'logos' ? 'asset-preview--logo' : ''}`}>
                      {kind === 'icons' ? (
                        <CdnIcon
                          name={asset.slug}
                          weight={search.weight}
                          size={search.size}
                        />
                      ) : (
                        <img
                          src={assetUrl(kind, asset)}
                          alt=""
                          loading="lazy"
                          style={{ width: search.size, height: search.size }}
                          className="h-full max-h-36 max-w-full object-contain"
                        />
                      )}
                    </Card.Content>
                    <Card.Footer className="min-w-0">
                      <span className="text-foreground truncate text-sm">
                        {kind === 'icons'
                          ? formatLabel(asset.slug)
                          : asset.title}
                      </span>
                    </Card.Footer>
                  </Card>
                </RouterLink>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <h2 className="text-xl font-medium">No matches yet</h2>
              <p className="text-muted mt-2">
                Try a different word or clear the category filter.
              </p>
            </div>
          )}
          {totalPages > 1 && (
            <Pagination>
              <Pagination.Summary>
                Page {page.toLocaleString()} of {totalPages.toLocaleString()}
              </Pagination.Summary>
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.Previous
                    isDisabled={page === 1}
                    onPress={() => update({ page: page - 1 })}>
                    <Pagination.PreviousIcon />
                    Previous
                  </Pagination.Previous>
                </Pagination.Item>
                <Pagination.Item>
                  <Pagination.Link isActive>{page}</Pagination.Link>
                </Pagination.Item>
                <Pagination.Item>
                  <Pagination.Next
                    isDisabled={page === totalPages}
                    onPress={() => update({ page: page + 1 })}>
                    Next
                    <Pagination.NextIcon />
                  </Pagination.Next>
                </Pagination.Item>
              </Pagination.Content>
            </Pagination>
          )}
        </div>
      </ResourceStatus>
    </AssetShell>
  )
}
