import { readFile, readdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import vm from 'node:vm'
import ts from 'typescript'
import yaml from 'yaml'

const upstream = path.resolve(process.argv[2])
const app = path.resolve(import.meta.dirname, '..')
const local = path.join(app, 'content/docs-ui')
const require = createRequire(import.meta.url)
const mdxRequire = createRequire(require.resolve('@vezham/docs-mdx'))
const { createProcessor } = await import(
  pathToFileURL(mdxRequire.resolve('@mdx-js/mdx')).href
)
const processor = createProcessor()
const issues = []
const totals = {
  pages: 0,
  metadataFiles: 0,
  previews: 0,
  demos: 0,
  resourcePages: 0,
  statusPages: 0,
  galleryEntries: 0,
  customComponents: new Set()
}
const visit = (node, callback) => {
  callback(node)
  for (const child of node.children ?? []) visit(child, callback)
}
const parse = text => {
  const end = text.indexOf('\n---', 4)
  return {
    metadata: yaml.parse(text.slice(4, end)),
    tree: processor.parse(text.slice(end + 4))
  }
}
const texts = tree => {
  const result = []
  visit(tree, node => {
    if (node.type === 'text') result.push(node.value)
  })
  return result
}
const select = (tree, predicate) => {
  const result = []
  visit(tree, node => {
    if (predicate(node)) result.push(node)
  })
  return result
}
const attributes = node =>
  Object.fromEntries(
    (node.attributes ?? []).map(attribute => [
      attribute.name,
      typeof attribute.value === 'object' && attribute.value
        ? attribute.value.value
        : attribute.value
    ])
  )
const normalizedMetadata = value =>
  JSON.parse(
    JSON.stringify(value)
      .replaceAll('/docs/react', '/docs/ui/web')
      .replaceAll('/docs/native', '/docs/ui/native')
      .replaceAll('](/showcase)', '](https://heroui.com/showcase)')
  )
const exportedNames = async (file, seen = new Set()) => {
  if (seen.has(file)) return new Set()
  seen.add(file)
  const source = ts.createSourceFile(
    file,
    await readFile(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  )
  const names = new Set()
  for (const statement of source.statements) {
    if (
      ts.isExportDeclaration(statement) &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause)
    ) {
      for (const element of statement.exportClause.elements)
        names.add(element.name.text)
    } else if (
      statement.modifiers?.some(
        modifier => modifier.kind === ts.SyntaxKind.ExportKeyword
      )
    ) {
      if (statement.name) names.add(statement.name.text)
      if (ts.isVariableStatement(statement))
        for (const declaration of statement.declarationList.declarations)
          names.add(declaration.name.getText(source))
    }
  }
  return names
}
const readConstant = async (file, name) => {
  const source = ts.createSourceFile(
    file,
    await readFile(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  )
  const declaration = source.statements
    .filter(ts.isVariableStatement)
    .flatMap(statement => [...statement.declarationList.declarations])
    .find(item => item.name.getText(source) === name)
  if (!declaration?.initializer) throw new Error(`Missing ${name} in ${file}`)
  const exports = {}
  vm.runInNewContext(
    ts.transpileModule(
      `export const value = ${declaration.initializer.getText(source)}`,
      {
        compilerOptions: { module: ts.ModuleKind.CommonJS }
      }
    ).outputText,
    { exports }
  )
  return exports.value
}
const presentation = path.join(app, 'src/lib/docs/heroui-presentation.ts')
const gallery = await readConstant(presentation, 'componentGalleryGroups')
for (const [platform, file] of [
  ['web', 'components/components-category.tsx'],
  ['native', 'components/native/components-category.tsx']
]) {
  const expected = await readConstant(
    path.join(upstream, 'src', file),
    'COMPONENT_GROUPS'
  )
  if (JSON.stringify(gallery[platform]) !== JSON.stringify(expected))
    issues.push(`${platform}: changed gallery category or component order`)
  totals.galleryEntries += expected.reduce(
    (count, group) => count + group.components.length,
    0
  )
}
const media = await readConstant(presentation, 'componentGalleryMedia')
const nativeSource = path.join(
  upstream,
  'src/components/native/components-category.tsx'
)
const cdn = await readConstant(
  path.join(upstream, 'src/utils/constants.ts'),
  'CDN_URL'
)
const expectedMedia = {
  imageBaseUrl: `${cdn}/docs/related-components`,
  nativeVideoBaseUrl: await readConstant(nativeSource, 'VIDEO_BASE_URL'),
  nativeVideoNames: await readConstant(nativeSource, 'VIDEO_NAME_OVERRIDES')
}
if (JSON.stringify(media) !== JSON.stringify(expectedMedia))
  issues.push(
    'Gallery media URLs or native video overrides differ from upstream'
  )
const adapters = await exportedNames(
  path.join(app, 'src/components/docs/heroui-mdx.tsx')
)
const sourceRegistry = await readFile(
  path.join(upstream, 'src/demos/en/index.ts'),
  'utf8'
)
const registry = Object.fromEntries(
  [...sourceRegistry.matchAll(/"([\w-]+)":\s*\{.*?file: "([^"]+)"/gs)].map(
    match => [match[1], match[2]]
  )
)
const demoRoot = path.join(app, 'src/demos/heroui')
const importedRegistry = await readFile(path.join(demoRoot, 'index.ts'), 'utf8')
const importedEntries = Object.fromEntries(
  [...importedRegistry.matchAll(/"([\w-]+)":\s*\{.*?file: "([^"]+)"/gs)].map(
    match => [match[1], match[2]]
  )
)
for (const [name, file] of Object.entries(registry))
  if (importedEntries[name] !== file.replace(/^en\//, ''))
    issues.push(`${name}: missing or changed demo registry entry`)
for (const name of Object.keys(importedEntries))
  if (!(name in registry))
    issues.push(`${name}: demo registry entry not present upstream`)

for (const [sourcePlatform, platform] of [
  ['react', 'web'],
  ['native', 'native']
]) {
  const sourceRoot = path.join(upstream, 'content/docs/en', sourcePlatform)
  const files = (await readdir(sourceRoot, { recursive: true })).filter(file =>
    /\.(mdx|json)$/.test(file)
  )
  const localFiles = (
    await readdir(path.join(local, platform), { recursive: true })
  ).filter(file => /\.(mdx|json)$/.test(file))
  for (const file of localFiles)
    if (!files.includes(file))
      issues.push(`${platform}/${file}: not present upstream`)
  for (const file of files) {
    const label = `${platform}/${file}`
    let imported
    try {
      imported = await readFile(path.join(local, platform, file), 'utf8')
    } catch {
      issues.push(`${label}: missing file`)
      continue
    }
    const original = await readFile(path.join(sourceRoot, file), 'utf8')
    if (file.endsWith('.json')) {
      totals.metadataFiles++
      const expected = JSON.parse(original)
      if (file === 'meta.json')
        expected.pages = expected.pages.filter(page => !page.startsWith('['))
      if (
        JSON.stringify(normalizedMetadata(expected)) !==
        JSON.stringify(JSON.parse(imported))
      )
        issues.push(`${label}: changed navigation metadata`)
      continue
    }
    totals.pages++
    const source = parse(original)
    const target = parse(imported)
    for (const [key, value] of Object.entries(source.metadata)) {
      const isStatus =
        key === 'icon' &&
        ['new', 'updated', 'preview', 'new-dot'].includes(value)
      if (
        JSON.stringify(target.metadata[isStatus ? 'status' : key]) !==
        JSON.stringify(value)
      )
        issues.push(`${label}: changed ${key} metadata`)
    }
    if (target.metadata.links) totals.resourcePages++
    if (target.metadata.status) totals.statusPages++
    const importedProse = texts(target.tree).join(' ')
    for (const text of texts(source.tree))
      if (text.length > 25 && !importedProse.includes(text))
        issues.push(`${label}: missing prose: ${text.slice(0, 80)}`)
    const headings = tree =>
      select(tree, node => node.type === 'heading').map(node =>
        texts(node).join('')
      )
    if (
      JSON.stringify(headings(source.tree)) !==
      JSON.stringify(headings(target.tree))
    )
      issues.push(`${label}: changed headings`)
    const previews = tree =>
      select(
        tree,
        node =>
          node.type.startsWith('mdxJsx') && node.name === 'ComponentPreview'
      )
    const sourcePreviews = previews(source.tree)
    const targetPreviews = previews(target.tree)
    if (sourcePreviews.length !== targetPreviews.length)
      issues.push(`${label}: changed preview count`)
    for (const [index, preview] of targetPreviews.entries()) {
      totals.previews++
      const props = attributes(preview)
      if (
        JSON.stringify(attributes(sourcePreviews[index] ?? {})) !==
        JSON.stringify(props)
      )
        issues.push(`${label}: dropped preview attributes for ${props.name}`)
      const demoFile = registry[props.name]
      if (!demoFile) {
        issues.push(`${label}: unknown demo ${props.name}`)
        continue
      }
      const code = select(preview, node => node.type === 'code')[0]?.value
      const executable = await readFile(
        path.join(demoRoot, demoFile.replace(/^en\//, '')),
        'utf8'
      )
      if (
        code?.trim() !== executable.slice(executable.indexOf('\n') + 1).trim()
      )
        issues.push(
          `${label}: displayed source differs from executable demo ${props.name}`
        )
    }
    visit(target.tree, node => {
      if (!node.type.startsWith('mdxJsx') || !/^[A-Z]/.test(node.name ?? ''))
        return
      const name = node.name.split('.')[0]
      totals.customComponents.add(name)
      if (!adapters.has(name))
        issues.push(`${label}: missing MDX adapter ${name}`)
    })
  }
}

for (const file of new Set(Object.values(registry))) {
  totals.demos++
  let expected = await readFile(path.join(upstream, 'src/demos', file), 'utf8')
  expected = expected
    .replaceAll('@heroui/react', '@vezham/react-v3')
    .replaceAll('/docs/react/', '/docs/ui/web/')
  if (!/\bReact[.<]/.test(expected))
    expected = expected
      .replace(/^import React from "react";\n/m, '')
      .replace('import React, {', 'import {')
  expected = expected.replace(
    'import Image from "next/image";',
    'import type {ComponentProps} from "react";\n\nconst Image = (props: ComponentProps<"img">) => <img {...props} />;'
  )
  expected = expected.replace(
    'import Link from "next/link";',
    'import type {ComponentProps} from "react";\n\nconst Link = (props: ComponentProps<"a">) => <a {...props} />;'
  )
  const actual = await readFile(
    path.join(demoRoot, file.replace(/^en\//, '')),
    'utf8'
  )
  const normalize = value =>
    value
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n')
      .trim()
  if (normalize(expected) !== normalize(actual.slice(actual.indexOf('\n') + 1)))
    issues.push(`${file}: executable source differs from upstream adaptations`)
}
const license = await readFile(path.resolve(upstream, '../../LICENSE'), 'utf8')
for (const file of [
  path.join(local, 'LICENSE-HeroUI'),
  path.join(demoRoot, 'LICENSE')
])
  if ((await readFile(file, 'utf8')) !== license)
    issues.push(`${file}: missing or changed upstream license`)

console.log(
  JSON.stringify(
    { ...totals, customComponents: totals.customComponents.size, issues },
    null,
    2
  )
)
if (issues.length) process.exitCode = 1
