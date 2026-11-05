import type { Asset, AssetKind, IconWeight } from './catalog'
import { iconCdnUrl } from './runtime'

type Options = {
  kind: AssetKind
  asset: Asset
  weight: IconWeight
  size: number
  color: string
  secondaryColor: string
  source: string
}
type Snippet = {
  id: string
  title: string
  language: string
  code: string
  logo?: string
}

export const getAssetSnippets = ({
  kind,
  asset,
  weight,
  size,
  color,
  secondaryColor,
  source
}: Options): Snippet[] => {
  if (kind !== 'icons')
    return [
      {
        id: 'html',
        title: 'HTML',
        language: 'html',
        logo: 'html5',
        code: `<img src="${source}" alt="${asset.title}" width="${size}" height="${size}" />`
      },
      {
        id: 'react',
        title: 'React',
        language: 'tsx',
        logo: 'react',
        code: `export const ${kind === 'logos' ? 'BrandLogo' : 'Illustration'} = () => (\n  <img src=${JSON.stringify(source)} alt=${JSON.stringify(asset.title)} width={${size}} height={${size}} />\n);`
      },
      {
        id: 'css',
        title: 'CSS',
        language: 'css',
        logo: 'css3',
        code: `.asset {\n  width: ${size}px;\n  height: ${size}px;\n  background: center / contain no-repeat url("${source}");\n}`
      }
    ]
  const secondary = weight.startsWith('duotone')
  const jsxColor = `color="${color}"${secondary ? ` secondaryColor="${secondaryColor}"` : ''}`
  const jsColor = `color: '${color}'${secondary ? `, secondaryColor: '${secondaryColor}'` : ''}`
  const htmlColor = `color="${color}"${secondary ? ` secondary-color="${secondaryColor}"` : ''}`
  const filename = `${asset.slug}${weight === 'outline' ? '' : '-' + weight}.svg`
  const svgUrl = new URL(`icons/${filename}`, iconCdnUrl).href
  const flutterName = asset.slug.replace(/-([a-z0-9])/g, (_, char: string) =>
    char.toUpperCase()
  )
  const flutterWeight = weight.replace(/-([a-z])/g, (_, char: string) =>
    char.toUpperCase()
  )
  return [
    {
      id: 'vanilla',
      title: 'JS',
      language: 'javascript',
      logo: 'javascript',
      code: `import { ${asset.title} } from '@vezham/icons';\n\nconst icon = ${asset.title}({ size: ${size}, weight: '${weight}', ${jsColor} });\ndocument.body.appendChild(icon);`
    },
    {
      id: 'cdn',
      title: 'CDN',
      language: 'html',
      logo: 'javascript',
      code: `<script defer src="${iconCdnUrl}"></script>\n\n<vx-icon icon="${asset.slug}" weight="${weight}" size="${size}" ${htmlColor}></vx-icon>`
    },
    {
      id: 'svg-url',
      title: 'SVG URL',
      language: 'html',
      code: `<img src="${svgUrl}" width="${size}" height="${size}" alt="${asset.slug} icon" />`
    },
    {
      id: 'react',
      title: 'React',
      language: 'tsx',
      logo: 'react',
      code: `import { ${asset.title} } from '@vezham/icons-react';\n\n<${asset.title} size={${size}} weight="${weight}" ${jsxColor} />`
    },
    {
      id: 'direct',
      title: 'Direct',
      language: 'tsx',
      logo: 'react',
      code: `import ${asset.title} from '@vezham/icons-react/icons/${asset.title}';\n\n<${asset.title} size={${size}} weight="${weight}" ${jsxColor} />`
    },
    {
      id: 'react-native',
      title: 'React Native',
      language: 'tsx',
      logo: 'react',
      code: `import { ${asset.title} } from '@vezham/icons-react-native';\n\n<${asset.title} size={${size}} weight="${weight}" ${jsxColor} />`
    },
    {
      id: 'vue',
      title: 'Vue',
      language: 'vue',
      logo: 'vue',
      code: `<script setup>\nimport { ${asset.title} } from '@vezham/icons-vue';\n</script>\n\n<template>\n  <${asset.title} :size="${size}" weight="${weight}" ${jsxColor} />\n</template>`
    },
    {
      id: 'svelte',
      title: 'Svelte',
      language: 'svelte',
      logo: 'svelte',
      code: `<script>\nimport { ${asset.title} } from '@vezham/icons-svelte';\n</script>\n\n<${asset.title} size={${size}} weight="${weight}" ${jsxColor} />`
    },
    {
      id: 'flutter',
      title: 'Flutter',
      language: 'dart',
      logo: 'flutter',
      code: `import 'package:flutter_svg/flutter_svg.dart';\nimport 'package:vezham_icons/icons.dart';\n\nSvgPicture.string(\n  vezhamIconSvg(Vezham.${flutterWeight}.${flutterName}),\n  width: ${size},\n  height: ${size},\n)`
    }
  ]
}
