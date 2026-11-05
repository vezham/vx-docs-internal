import { type Asset, iconWeights } from './catalog'
import { getAssetSnippets } from './snippets'

const asset: Asset = {
  slug: 'align-bottom',
  title: 'AlignBottom',
  category: 'arrows',
  keywords: '',
  subcategory: '',
  weights: [...iconWeights],
  variants: {}
}
const options = {
  kind: 'icons' as const,
  asset,
  weight: 'duotone-filled' as const,
  size: 16,
  color: '#123456',
  secondaryColor: '#abcdef',
  source: ''
}

describe('asset integration snippets', () => {
  it('restores every integration and uses the selected weight, colors and size', () => {
    const snippets = getAssetSnippets(options)
    expect(snippets.map(snippet => snippet.id)).toEqual([
      'vanilla',
      'cdn',
      'svg-url',
      'react',
      'direct',
      'react-native',
      'vue',
      'svelte',
      'flutter'
    ])
    expect(snippets.find(snippet => snippet.id === 'vanilla')?.code).toContain(
      "secondaryColor: '#abcdef'"
    )
    expect(snippets.find(snippet => snippet.id === 'cdn')?.code).toContain(
      'size="16" color="#123456" secondary-color="#abcdef"'
    )
    expect(snippets.find(snippet => snippet.id === 'direct')?.code).toContain(
      '@vezham/icons-react/icons/AlignBottom'
    )
    expect(snippets.find(snippet => snippet.id === 'flutter')?.code).toContain(
      'Vezham.duotoneFilled.alignBottom'
    )
  })

  it('pins SVG URLs and maps all available weights to the published filenames', () => {
    for (const weight of iconWeights) {
      const snippets = getAssetSnippets({ ...options, weight })
      const svg = snippets.find(snippet => snippet.id === 'svg-url')?.code
      expect(svg).toContain(
        `@vezham/icons@1.0.7/dist/cdn/icons/align-bottom${weight === 'outline' ? '' : '-' + weight}.svg`
      )
      if (!weight.startsWith('duotone'))
        expect(
          snippets.find(snippet => snippet.id === 'react')?.code
        ).not.toContain('secondaryColor')
    }
  })

  it('keeps image integrations on the selected CDN and logo variant', () => {
    const source = 'https://logos.test.vezham.com/assets/react/text.svg'
    const snippets = getAssetSnippets({ ...options, kind: 'logos', source })
    expect(snippets.map(snippet => snippet.logo)).toEqual([
      'html5',
      'css3',
      'react',
      'vue'
    ])
    for (const snippet of snippets) expect(snippet.code).toContain(source)
    expect(snippets[0].code).toContain('width="16" height="16"')
    expect(snippets.find(snippet => snippet.id === 'vue')?.code).toContain(
      ':width="16" :height="16"'
    )
  })
})
