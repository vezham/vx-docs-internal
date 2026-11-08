import { JSDOM } from 'jsdom'
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { loadEnv } from 'vite'

if (!process.argv[2] || !process.argv[3])
  throw new Error(
    'Usage: node import-icon-library.mjs /path/to/reicon /path/to/vx-fe-apps-cdns'
  )
const src = path.resolve(process.argv[2])
const app = path.resolve(import.meta.dirname, '..')
const env = loadEnv(process.env.NODE_ENV ?? 'development', app, 'V_')
if (!env.V_LOGOS_CDN_URL?.trim())
  throw new Error('V_LOGOS_CDN_URL must be configured in the app environment.')
const logosOrigin = env.V_LOGOS_CDN_URL.trim().replace(/\/+$/, '')
const cdn = path.resolve(process.argv[3], 'apps-cdns')
const collectionOutput = kind => path.join(cdn, `${kind}-cdn`, 'public')
for (const kind of ['illustrations', 'logos']) {
  if (!fs.existsSync(collectionOutput(kind)))
    throw new Error(`Missing CDN app: ${kind}-cdn`)
}
const out = app + '/public/icon-catalog'
fs.mkdirSync(out, { recursive: true })
fs.copyFileSync(src + '/public/vezham-icons.zip', out + '/vezham-icons.zip')
fs.mkdirSync(app + '/src/lib/icon-library', { recursive: true })
const w = new JSDOM('', { runScripts: 'outside-only' }).window
const response = await fetch(
  'https://cdn.jsdelivr.net/npm/@vezham/icons@1.0.7/dist/cdn/vezham-icons.js'
)
if (!response.ok) throw new Error('Unable to download the pinned icon runtime')
w.eval(
  (await response.text()).replace(
    'C.VezhamIcons=H',
    'C.__IconData=o;C.VezhamIcons=H'
  )
)
const tags = new Map(
  JSON.parse(fs.readFileSync(src + '/src/data/search-index.json')).map(x => [
    x.n,
    x
  ])
)
const names = JSON.parse(fs.readFileSync(src + '/scripts/icon-names.json'))
const weights = {
  O: 'outline',
  F: 'filled',
  DO: 'duotone-outline',
  DF: 'duotone-filled'
}
const icons = w.VezhamIcons.icons.map(slug => [
  slug,
  names[slug] || slug,
  w.VezhamIcons.categoryOf(slug),
  tags.get(slug)?.t.join(' ') || slug,
  '',
  Object.keys(w.__IconData[slug][1]).map(k => weights[k]),
  null
])
fs.writeFileSync(out + '/icons.json', JSON.stringify(icons))
const all = new Map()
for (const filename of fs.readdirSync(src + '/public/illustration-data/all')) {
  for (const row of (data =>
    Array.isArray(data)
      ? data
      : Array.isArray(data.entries)
        ? data.entries
        : [])(
    JSON.parse(
      fs.readFileSync(src + '/public/illustration-data/all/' + filename)
    )
  )) {
    all.set(row[0], [row[0], row[1], row[5], row[2], row[6], null, null])
  }
}
const featured = JSON.parse(
  fs.readFileSync(src + '/public/illustration-data/featured.json')
).map(r => r[0])
const rank = new Map(featured.map((slug, i) => [slug, i]))
const illustrations = [...all.values()].sort(
  (a, b) =>
    (rank.get(a[0]) ?? 100000) - (rank.get(b[0]) ?? 100000) ||
    a[0].localeCompare(b[0])
)
fs.writeFileSync(
  path.join(collectionOutput('illustrations'), 'catalog.json'),
  JSON.stringify(illustrations)
)
const logoMap = JSON.parse(
  fs.readFileSync(src + '/public/logos-data/icons.json')
)
const categoryMap = JSON.parse(
  fs.readFileSync(src + '/public/logos-data/brands-by-category.json')
)
const categoryBySlug = {}
for (const [category, slugs] of Object.entries(categoryMap))
  for (const slug of slugs)
    categoryBySlug[slug.toLowerCase().replace(/[^a-z0-9]/g, '')] = category
const logos = Object.entries(logoMap).map(([slug, variants]) => [
  slug,
  slug
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' '),
  categoryBySlug[slug.replace(/[^a-z0-9]/g, '')] || 'General',
  slug,
  '',
  null,
  Object.fromEntries(
    Object.keys(variants).map(variant => [
      variant,
      `${logosOrigin}/assets/${slug}/${variant}.svg`
    ])
  )
])
fs.writeFileSync(
  path.join(collectionOutput('logos'), 'catalog.json'),
  JSON.stringify(logos)
)
for (const [kind, rows] of [
  ['illustrations', illustrations],
  ['logos', logos]
]) {
  fs.writeFileSync(
    path.join(collectionOutput(kind), 'catalog-manifest.json'),
    JSON.stringify(
      {
        schemaVersion: 1,
        collection: kind,
        catalog: '/catalog.json',
        assets: '/assets/',
        entries: rows.length,
        assetFiles:
          kind === 'illustrations'
            ? rows.length
            : rows.reduce((count, row) => count + Object.keys(row[6]).length, 0)
      },
      null,
      2
    ) + '\n'
  )
}
const props = node =>
  Object.fromEntries(
    node.properties
      .filter(ts.isPropertyAssignment)
      .map(p => [p.name.getText().replace(/['"]/g, ''), p.initializer])
  )
const text = n => (n && ts.isStringLiteralLike(n) ? n.text : undefined)
const sourceFile = file =>
  ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )
const constant = (file, name) => {
  const ast = sourceFile(file)
  return ast.statements
    .filter(ts.isVariableStatement)
    .flatMap(s => s.declarationList.declarations)
    .find(d => d.name.getText() === name).initializer
}
const faq = constant(
  src + '/src/pages/faq/FaqPage.tsx',
  'FAQ_CATEGORIES'
).elements.map(n => {
  const p = props(n)
  return {
    id: text(p.id),
    title: text(p.title),
    items: p.items.elements.map(item => {
      const q = props(item)
      return {
        id: text(q.id),
        question: text(q.question),
        answer: text(q.markdownAnswer)
      }
    })
  }
})
faq[0].items[0].answer =
  'Vezham is a vector-asset library with UI icons, SVG illustrations, and brand logos. This browser uses the pinned @vezham/icons@1.0.7 CDN runtime for icons, alongside the existing illustration and logo collections.'
const packageLogos = {
  vanilla: 'javascript',
  'react-native': 'reactnative',
  vscode: 'visual-studio-code',
  mcp: 'mcp-model-context-protocol'
}
const registryLabels = {
  flutter: 'pub.dev',
  figma: 'Figma',
  vscode: 'Marketplace'
}
const registryLogos = {
  flutter: 'dart',
  figma: 'figma',
  vscode: 'visual-studio-code'
}
const packages = constant(
  src + '/src/pages/packages/data.tsx',
  'PACKAGES'
).elements.map(n => {
  const p = props(n)
  const item = Object.fromEntries(
    ['id', 'name', 'description', 'npmUrl', 'sourceUrl', 'guideUrl'].map(k => [
      k,
      text(p[k])
    ])
  )
  if (item.id === 'flutter') {
    item.name = 'vezham_icons'
    item.npmUrl = 'https://pub.dev/packages/vezham_icons'
  }
  item.logo = packageLogos[item.id] ?? item.id
  item.registryLabel = registryLabels[item.id] ?? 'npm'
  item.registryLogo = registryLogos[item.id] ?? 'npm'
  item.sourceLogo = 'github'
  return item
})
const tools = constant(
  src + '/src/pages/packages/data.tsx',
  'TOOLS'
).elements.map(n => {
  const p = props(n)
  const a = props(p.primaryAction)
  return {
    id: text(p.id),
    logo: packageLogos[text(p.id)] ?? text(p.id),
    name: text(p.name),
    description: text(p.description),
    npmUrl: text(a.href),
    registryLabel: registryLabels[text(p.id)] ?? 'npm',
    registryLogo: registryLogos[text(p.id)] ?? 'npm',
    sourceLogo: 'github',
    sourceUrl: text(p.sourceUrl),
    guideUrl: text(p.guideUrl)
  }
})
fs.writeFileSync(
  app + '/src/lib/icon-library/content.json',
  JSON.stringify({ packages: [...packages, ...tools], faq }, null, 2) + '\n'
)
const docs = app + '/content/docs-icons'
fs.mkdirSync(docs, { recursive: true })
const fw = [
  ['vanilla', 'javascript', 'Vanilla JS / CDN'],
  ['react', 'react', 'React'],
  ['react-native', 'react-native', 'React Native'],
  ['vue', 'vue', 'Vue'],
  ['svelte', 'svelte', 'Svelte'],
  ['flutter', 'flutter', 'Flutter'],
  ['figma', 'figma', 'Figma'],
  ['vscode', 'vscode', 'VS Code'],
  ['mcp', 'mcp', 'MCP Server'],
  ['svg', 'svg', 'Raw SVG']
]
for (const [id, folder, title] of fw) {
  // vx-bot/NOTE: Preserve the local SVG guide, which documents this app's export behavior.
  if (id === 'svg' && fs.existsSync(docs + '/svg.mdx')) continue
  const md = fs
    .readFileSync(src + '/docs/' + folder + '/index.md', 'utf8')
    .replace(/^# .+\n/, '')
    .replaceAll('@vezham/icons@latest', '@vezham/icons@1.0.7')
    .replaceAll(
      'Browse all icons at [vezham.com](https://vezham.com).',
      'Browse the full [icon gallery](/icons).'
    )
    .replace(/\]\(https:\/\/vezham\.com\/docs\/?\)/g, '](/docs)')
    .replace(/\]\(https:\/\/vezham\.com\/?\)/g, '](/icons)')
    .replaceAll(
      './packages/icons-flutter',
      'https://github.com/vezham/reicon/tree/main/packages/icons-flutter'
    )
    .replaceAll('/vezham-icons.zip', '/icon-catalog/vezham-icons.zip')
    .replace(
      'Get the complete, compressed package containing all 2,700+ icon designs across outline, filled, duotone-outline, and duotone-filled weights.',
      'Download the original SVG archive, with outline, filled, duotone-outline, and duotone-filled weights. For exports from the pinned CDN version used by this browser, open an [icon detail page](/icons) and choose Download SVG.'
    )
    .replace(
      /```bash\n((?:(?:npm install|yarn add|pnpm add|bun add) [^\n]+\n|# or\n)+)```/g,
      (block, commands) => {
        const packages = /^npm install ([^\n]+)$/m.exec(commands)?.[1]
        if (
          !packages ||
          packages.split(/\s+/).some(name => name.startsWith('-'))
        )
          return block
        return `<InstallTabs packages=${JSON.stringify(packages)} />`
      }
    )
  fs.writeFileSync(
    docs + '/' + id + '.mdx',
    `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify('Use Vezham Icons with ' + title + '.')}\nlogo: ${JSON.stringify(packageLogos[id] ?? id)}\n---\n\n${md.trim()}${id === 'svg' ? "\n\n## Illustrations and logos\n\nOpen any [illustration](/illustrations) or [logo](/logos) to copy its original SVG, download the vector file, or export a transparent PNG/WebP at the selected size. Logos include a variant selector when multiple versions are available.\n\nRaster exports preserve the artwork's aspect ratio inside a square canvas. Use **Open SVG** to open the original file, or copy an HTML, React, or CSS embed snippet." : ''}\n`
  )
}
for (const name of [
  'props',
  'weights',
  'styling',
  'accessibility',
  'performance',
  'typescript',
  'troubleshooting'
]) {
  const raw = fs.readFileSync(src + '/docs/shared/' + name + '.md', 'utf8')
  const title = /^# (.+)/m.exec(raw)?.[1] || name
  fs.writeFileSync(
    docs + '/' + name + '.mdx',
    `---\ntitle: ${JSON.stringify(title)}\n---\n\n${raw
      .replace(/^# .+\n/, '')
      .replaceAll('@vezham/icons@latest', '@vezham/icons@1.0.7')
      .trim()}\n`
  )
}
fs.writeFileSync(
  docs + '/index.mdx',
  `---\ntitle: Vezham Icons\ndescription: Browse vector assets and use them in your framework of choice.\n---\n\nVezham brings UI icons, illustrations, and brand logos into one library. Search the catalogs, open an asset to customize its preview, and copy the code you need.\n\n## Quick start with the CDN\n\nThe icon browser uses this pinned, framework-independent web component:\n\n\`\`\`html\n<script defer src="https://cdn.jsdelivr.net/npm/@vezham/icons@1.0.7/dist/cdn/vezham-icons.js"></script>\n<vx-icon icon="home" weight="outline" size="24"></vx-icon>\n\`\`\`\n\n## Choose a framework\n\n${fw.map(([id, , title]) => '- [' + title + '](/docs/' + id + ')').join('\n')}\n\n## Explore the library\n\n- [Icons](/icons) — four drawing weights, color controls, and SVG or raster exports.\n- [Illustrations](/illustrations) — search the full illustration collection.\n- [Logos](/logos) — browse brands and available variants.\n- [Packages and tools](/packages) — integrations for your app and design workflow.\n- [FAQ](/faq) — answers about the library.\n`
)
fs.writeFileSync(
  docs + '/meta.json',
  JSON.stringify(
    {
      title: 'Icon documentation',
      pages: [
        'index',
        '---Frameworks---',
        ...fw.map(f => f[0]),
        '---Reference---',
        'props',
        'weights',
        'styling',
        'accessibility',
        'performance',
        'typescript',
        'troubleshooting'
      ]
    },
    null,
    2
  ) + '\n'
)
fs.writeFileSync(
  out + '/manifest.json',
  JSON.stringify(
    {
      version: '1.0.7',
      icons: icons.length,
      frameworks: fw.map(([id, , title]) => ({ id, title }))
    },
    null,
    2
  ) + '\n'
)
console.log(
  JSON.stringify({
    icons: icons.length,
    illustrations: illustrations.length,
    logos: logos.length,
    docs: 18,
    faq: faq.reduce((n, g) => n + g.items.length, 0)
  })
)
