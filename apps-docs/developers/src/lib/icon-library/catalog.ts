import type { SearchSchemaInput } from '@tanstack/react-router'

export type AssetKind = 'icons' | 'illustrations' | 'logos'
export const iconWeights = [
  'outline',
  'filled',
  'duotone-outline',
  'duotone-filled'
] as const
export type IconWeight = (typeof iconWeights)[number]
export type Asset = {
  slug: string
  title: string
  category: string
  keywords: string
  subcategory: string
  weights: IconWeight[]
  variants: Record<string, string>
}
type AssetRow = [
  string,
  string,
  string,
  string,
  string,
  IconWeight[] | null,
  Record<string, string> | null
]

export const catalogRoutes = {
  icons: '/icons',
  illustrations: '/illustration',
  logos: '/logos'
} as const
export const detailRoutes = {
  icons: '/{-$lang}/icon/$name',
  illustrations: '/{-$lang}/illustration/$name',
  logos: '/{-$lang}/logo/$name'
} as const
export const kindLabels = {
  icons: 'Icons',
  illustrations: 'Illustrations',
  logos: 'Logos'
}
export const formatLabel = (value: string) =>
  value.replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
const catalogs = new Map<AssetKind, Promise<Asset[]>>()

export const loadCatalog = (kind: AssetKind): Promise<Asset[]> => {
  const cached = catalogs.get(kind)
  if (cached) return cached
  const request = fetch(`/icon-catalog/${kind}.json`)
    .then(async response => {
      if (!response.ok)
        throw new Error('The asset catalog could not load. Please try again.')
      const rows: AssetRow[] = await response.json()
      return rows.map(
        ([
          slug,
          title,
          category,
          keywords,
          subcategory,
          weights,
          variants
        ]) => ({
          slug,
          title,
          category,
          keywords,
          subcategory,
          weights: weights ?? [],
          variants: variants ?? {}
        })
      )
    })
    .catch(() => {
      catalogs.delete(kind)
      throw new Error('The asset catalog could not load. Please try again.')
    })
  catalogs.set(kind, request)
  return request
}

export const assetUrl = (
  kind: AssetKind,
  asset: Asset,
  variant = 'original'
) =>
  kind === 'logos'
    ? (asset.variants[variant] ??
      asset.variants.original ??
      Object.values(asset.variants)[0])
    : `https://cdn.reicon.dev/${encodeURIComponent(asset.slug)}.svg`

export type CatalogSearch = {
  q: string
  category: string
  weight: IconWeight
  size: number
  sort: 'featured' | 'az' | 'za'
  page: number
}

export const parseCatalogSearch = (
  input: Record<string, unknown>
): CatalogSearch => ({
  q: typeof input.q === 'string' ? input.q.slice(0, 200) : '',
  category: typeof input.category === 'string' ? input.category : 'all',
  weight: iconWeights.includes(input.weight as IconWeight)
    ? (input.weight as IconWeight)
    : 'outline',
  size: Math.min(72, Math.max(24, Number(input.size) || 36)),
  sort: input.sort === 'az' || input.sort === 'za' ? input.sort : 'featured',
  page: Math.max(1, Math.floor(Number(input.page) || 1))
})

export const validateCatalogSearch = (
  input: Record<string, unknown> & SearchSchemaInput
) => parseCatalogSearch(input)

const synonyms: Record<string, string[]> = {
  gear: ['settings', 'cog'],
  settings: ['gear', 'cog'],
  user: ['profile', 'person', 'account'],
  search: ['magnifier', 'find'],
  email: ['mail', 'letter'],
  home: ['house', 'building'],
  delete: ['trash', 'bin'],
  plus: ['add'],
  close: ['cross', 'cancel'],
  favorite: ['heart', 'star']
}

export const filterAssets = (
  assets: readonly Asset[],
  search: CatalogSearch,
  kind: AssetKind
) => {
  const terms = search.q.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const result = assets.filter(asset => {
    if (search.category !== 'all' && asset.category !== search.category)
      return false
    if (kind === 'icons' && !asset.weights.includes(search.weight)) return false
    const text =
      `${asset.slug} ${asset.title} ${asset.category} ${asset.subcategory} ${asset.keywords}`.toLowerCase()
    return terms.every(term =>
      [term, ...(synonyms[term] ?? [])].some(value => text.includes(value))
    )
  })
  if (search.sort === 'az')
    result.sort((a, b) => a.title.localeCompare(b.title))
  if (search.sort === 'za')
    result.sort((a, b) => b.title.localeCompare(a.title))
  if (search.sort === 'featured' && terms.length) {
    const relevance = (asset: Asset) =>
      terms.reduce((score, term) => {
        const name = asset.slug.replace(/-/g, ' ')
        return (
          score +
          Math.max(
            ...[term, ...(synonyms[term] ?? [])].map(value =>
              name === value
                ? 100
                : name.startsWith(value)
                  ? 40
                  : name.includes(value)
                    ? 20
                    : asset.keywords.toLowerCase().includes(value)
                      ? 5
                      : 0
            )
          )
        )
      }, 0)
    result.sort((a, b) => relevance(b) - relevance(a))
  }
  return result
}
