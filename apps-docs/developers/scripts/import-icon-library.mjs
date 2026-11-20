import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const [workspace] = process.argv.slice(2)
if (!workspace || process.argv.length !== 3)
  throw new Error(
    'Usage: node apps-docs/developers/scripts/import-icon-library.mjs /path/to/vx-fe-assets-pkgs'
  )

const readJson = file => JSON.parse(readFileSync(file, 'utf8'))
const assetsRoot = path.resolve(workspace, 'packages')
const packageRoot = path.join(assetsRoot, 'icons')
const catalogDir = path.resolve(import.meta.dirname, '../public/icon-catalog')
const manifestPath = path.join(catalogDir, 'manifest.json')
const catalogPath = path.join(catalogDir, 'icons.json')
const pkg = readJson(path.join(packageRoot, 'package.json'))
const manifest = readJson(manifestPath)

if (pkg.name !== '@vezham/icons' || pkg.version !== manifest.version)
  throw new Error(
    `Expected @vezham/icons@${manifest.version} to match the catalog's pinned runtime.`
  )

const dist = path.join(packageRoot, 'dist')
const buildManifest = path.join(dist, 'package.json')
if (
  !existsSync(buildManifest) ||
  readJson(buildManifest).version !== pkg.version
)
  throw new Error('Run pnpm nx build icons in the assets workspace first.')

const names = readJson(path.join(dist, 'icon-names.json'))
const previous = new Map(readJson(catalogPath).map(row => [row[0], row]))
const require = createRequire(import.meta.url)
const { loadIconData } = require(
  path.join(assetsRoot, 'icons-data/icon-source.cjs')
)
const supportedWeights = [
  'outline',
  'filled',
  'duotone-outline',
  'duotone-filled'
]
const rows = new Map()

for (const [category, group] of Object.entries(loadIconData().categories)) {
  for (const [slug, icon] of Object.entries(group.icons)) {
    const title = names[slug]
    if (!title || rows.has(slug))
      throw new Error(
        `Missing or ambiguous name for ${slug}. Rebuild the icons package.`
      )

    const existing = previous.get(slug)
    const tags = Array.isArray(icon.description) ? icon.description : []
    rows.set(slug, [
      slug,
      title,
      category,
      existing?.[3] ?? [slug, ...tags].join(' '),
      existing?.[4] ?? '',
      supportedWeights.filter(weight => icon.weights[weight]),
      null
    ])
  }
}

if (!rows.size || rows.size !== Object.keys(names).length)
  throw new Error('The generated icon names do not match the source catalog.')

const icons = [...rows.values()].sort((a, b) => a[1].localeCompare(b[1]))
writeFileSync(catalogPath, JSON.stringify(icons))
writeFileSync(
  manifestPath,
  JSON.stringify({ ...manifest, icons: icons.length }, null, 2) + '\n'
)
console.log(
  `Refreshed ${icons.length} Vezham icons for @vezham/icons@${pkg.version}.`
)
