import { type Asset, filterAssets, parseCatalogSearch } from './catalog'

const assets: Asset[] = [
  {
    slug: 'filter',
    title: 'Filter',
    category: 'settings',
    keywords: 'preferences',
    subcategory: '',
    weights: ['outline'],
    variants: {}
  },
  {
    slug: 'settings',
    title: 'Settings',
    category: 'settings',
    keywords: 'gear cog',
    subcategory: '',
    weights: ['outline', 'filled'],
    variants: {}
  },
  {
    slug: 'home',
    title: 'Home',
    category: 'building',
    keywords: 'house dashboard',
    subcategory: '',
    weights: ['outline', 'filled'],
    variants: {}
  }
]
describe('asset catalog search', () => {
  it('ranks a matching icon above broad category matches and supports synonyms', () => {
    expect(
      filterAssets(assets, parseCatalogSearch({ q: 'gear' }), 'icons').map(
        asset => asset.slug
      )
    ).toEqual(['settings', 'filter'])
  })
  it('combines keyword, category and available-weight filters', () => {
    expect(
      filterAssets(
        assets,
        parseCatalogSearch({
          q: 'preferences',
          category: 'settings',
          weight: 'filled'
        }),
        'icons'
      )
    ).toEqual([])
    expect(
      filterAssets(
        assets,
        parseCatalogSearch({
          q: 'house',
          category: 'building',
          weight: 'filled'
        }),
        'icons'
      ).map(asset => asset.slug)
    ).toEqual(['home'])
  })
  it('bounds query size and rejects unsupported style and pagination input', () => {
    const parsed = parseCatalogSearch({
      q: 'x'.repeat(500),
      weight: 'bad',
      size: 10000,
      page: -10
    })
    expect(parsed.q).toHaveLength(200)
    expect(parsed).toMatchObject({ weight: 'outline', size: 72, page: 1 })
  })
})
