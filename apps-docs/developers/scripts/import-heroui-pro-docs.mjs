import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import ts from 'typescript'

// vx-bot/NOTE: Input is a snapshot exported by the authenticated HeroUI MCP, not package internals.
const app = path.resolve(import.meta.dirname, '..')
const snapshot = path.resolve(
  process.argv[2] ?? 'test-output/heroui-pro-import'
)
const content = path.join(app, 'content/docs-ui-pro-v3')
const demosRoot = path.join(app, 'src/demos/heroui-pro')
const require = createRequire(import.meta.url)
const packageMetadata = JSON.parse(
  await readFile(require.resolve('@vezham/react-pro-v3/package.json'), 'utf8')
)
const compatibilityNotes =
  packageMetadata.version === '1.0.0-beta.10'
    ? {
        agenda:
          'The live example targets the installed 1.0.0-beta.10 package and uses `visibleDays` and `slotDuration`. Swipe navigation, time-zone overrides, and declined event status in the upstream reference require a newer package.',
        'data-grid':
          'The live Sticky Header example uses a demo wrapper with sticky table-header styles. The installed 1.0.0-beta.10 package does not expose the newer upstream `stickyHeader` prop.',
        'holo-card':
          'The installed 1.0.0-beta.10 package uses its default pointer tracking. Hover activation and configurable tilt settings described in the upstream reference require a newer package.'
      }
    : {}
const categories = JSON.parse(
  await readFile(path.join(snapshot, 'categories.json'), 'utf8')
)
const gallery = JSON.parse(
  await readFile(
    path.join(app, 'src/lib/docs/heroui-pro-presentation.json'),
    'utf8'
  )
)
const categoryTitles = Object.fromEntries(
  gallery.groups.map(group => [group.category, group.title])
)
const registry = {}
const pages = []
const supportingFiles = new Map()
const primaryFiles = new Map()
for (const file of await readdir(demosRoot, { recursive: true }).catch(
  () => []
)) {
  if (!/\.[jt]sx?$/.test(file)) continue
  const filename = path.join(demosRoot, file)
  if (
    (await readFile(filename, 'utf8')).startsWith(
      '// Adapted documented HeroUI Pro example;'
    )
  )
    await unlink(filename)
}
const write = async (file, value) => {
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, value)
}
const slugify = value =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
const adapt = value =>
  value
    .replaceAll('@heroui-pro/react', '@vezham/react-pro-v3')
    .replaceAll('@heroui/react', '@vezham/react-v3')
    .replaceAll('from "../index"', 'from "@vezham/react-pro-v3/kanban"')
    .replaceAll('from "../use-kanban"', 'from "@vezham/react-pro-v3/kanban"')
    .replace(
      'import {ChevronDown, FileText} from "../../icons";',
      'import {AltArrowDown as ChevronDown, DocumentText as FileText} from "@vezham/icons-react";'
    )
    .replaceAll('](/docs/react/', '](/docs/ui/react-pro-v3/')
    .replaceAll('.replaceAll(/', '.replace(/')

const adaptExample = (code, slug) => {
  code = adapt(code)
  if (slug === 'rich-text-editor')
    code = code.replace(
      '"use client";',
      '"use client";\nimport type {} from "@tiptap/starter-kit";'
    )
  if (slug === 'agenda')
    code = code
      .replace('    allowsSwipe: true,\n', '')
      .replace('snapMinutes: 15', 'slotDuration: 15')
      .replace('status: "declined"', 'status: "unconfirmed"')
      .replaceAll('agenda.renderedDays', 'agenda.visibleDays')
      .replaceAll('<Agenda.DayColumns>', '<>')
      .replaceAll('</Agenda.DayColumns>', '</>')
  if (slug === 'holo-card')
    code = code
      .replace(
        /\n\s*(activateOnHover|hoverScale=\{[^}]+\}|maxTilt=\{[^}]+\}|shineOpacity=\{[^}]+\})(?=\n)/g,
        ''
      )
      .replace(
        /\s*\/\/ `activateOnHover`[^\n]*\n\s*\/\/ and the effect[^\n]*\n/,
        '\n'
      )
  if (slug === 'data-grid' && code.includes('export function Default('))
    code = code
      .replace(
        '"allowsColumnResize" | "scrollContainerClassName" | "stickyHeader" | "variant"',
        '"allowsColumnResize" | "scrollContainerClassName" | "variant"'
      )
      .replace('> = {}) {', '> & { stickyHeader?: boolean } = {}) {')
      .replace(
        'scrollContainerClassName={scrollContainerClassName}',
        'scrollContainerClassName={[scrollContainerClassName, stickyHeader ? "[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:bg-surface" : ""].filter(Boolean).join(" ")}'
      )
      .replace('        stickyHeader={stickyHeader}\n', '')
  return code
}

const isCompleteExample = code => {
  const source = ts.createSourceFile(
    'demo.tsx',
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )
  if (
    source.parseDiagnostics.length ||
    /from ["'](?:react-router|next\/(?:navigation|router))["']/.test(code)
  )
    return false
  const declared = new Set(['React'])
  const used = new Set()
  let incomplete = false
  const collectName = name => {
    if (ts.isIdentifier(name)) declared.add(name.text)
    else if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name))
      for (const item of name.elements)
        if (ts.isBindingElement(item)) collectName(item.name)
  }
  const walk = node => {
    if (
      node.name &&
      (ts.isVariableDeclaration(node) ||
        ts.isFunctionDeclaration(node) ||
        ts.isParameter(node) ||
        ts.isImportSpecifier(node) ||
        ts.isImportClause(node) ||
        ts.isNamespaceImport(node))
    )
      collectName(node.name)
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(source)
      const root = tag.split('.')[0]
      if (/^[A-Z]/.test(root)) used.add(root)
      if (['Sidebar', 'Sidebar.Mobile', 'Navbar'].includes(tag)) {
        if (
          ts.isJsxSelfClosingElement(node) ||
          !node.parent.children.some(
            child =>
              ts.isJsxElement(child) ||
              ts.isJsxSelfClosingElement(child) ||
              (ts.isJsxExpression(child) && child.expression)
          )
        )
          incomplete = true
      }
    }
    ts.forEachChild(node, walk)
  }
  walk(source)
  return !incomplete && [...used].every(name => declared.has(name))
}

const exportsFrom = code => {
  const source = ts.createSourceFile(
    'demo.tsx',
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )
  const names = []
  for (const node of source.statements) {
    if (
      !node.modifiers?.some(item => item.kind === ts.SyntaxKind.ExportKeyword)
    )
      continue
    if (
      ts.isFunctionDeclaration(node) &&
      (node.modifiers.some(item => item.kind === ts.SyntaxKind.AsyncKeyword) ||
        node.parameters.some(parameter =>
          parameter.name.getText(source).includes('children')
        ))
    )
      continue
    if (node.modifiers.some(item => item.kind === ts.SyntaxKind.DefaultKeyword))
      names.push('default')
    else if (
      ts.isFunctionDeclaration(node) &&
      node.name &&
      /^[A-Z]/.test(node.name.text)
    )
      names.push(node.name.text)
    else if (ts.isVariableStatement(node))
      for (const item of node.declarationList.declarations) {
        if (
          ts.isIdentifier(item.name) &&
          /^[A-Z]/.test(item.name.text) &&
          item.initializer &&
          (ts.isArrowFunction(item.initializer) ||
            ts.isFunctionExpression(item.initializer))
        )
          names.push(item.name.text)
      }
  }
  return names
}

for (const [category, slugs] of Object.entries(categories)) {
  for (const slug of slugs) {
    let raw = await readFile(
      path.join(snapshot, 'components', slug + '.mdx'),
      'utf8'
    )
    const title = /^# (.+)$/m.exec(raw)?.[1] ?? slug
    const description =
      /^> (.+)$/m.exec(raw)?.[1] ?? `${title} component documentation.`
    const sourceUrl = `https://heroui.pro/docs/react/components/${slug}`
    raw = raw
      .replace(/^# .+\n/, '')
      .replace(/^\*\*(?:Category|URL|Source)\*\*:.*\n/gm, '')
      .replace(/^> .+\n/m, '')
    let count = 0
    const seenNames = new Set()
    const file = path.join(
      content,
      'components',
      `(${category})`,
      slug + '.mdx'
    )
    const body = raw.replace(
      /(^|\n)(`{3,})(tsx?|jsx?)([^\n]*)\n([\s\S]*?)\n\2(?=\n|$)/g,
      (full, start, fence, lang, meta, original, offset) => {
        const prefix = raw.slice(0, offset)
        const heading =
          [...prefix.matchAll(/^#{2,4} (.+)$/gm)].at(-1)?.[1] ?? 'Usage'
        const supportFilename =
          /(?:^|\n)(?:packages|apps)\/[^\n]+\/([^/\n]+\.[cm]?[jt]sx?)\s*$/.exec(
            prefix
          )?.[1]
        const code = adaptExample(original.trim(), slug)
        if (supportFilename) {
          // vx-bot/NOTE: Supporting files accompany the primary demo in the upstream export.
          const supportPath = path.join(demosRoot, slug, supportFilename)
          supportingFiles.set(supportPath, code)
          return start + fence + lang + meta + '\n' + code + '\n' + fence
        }
        const names = exportsFrom(code)
        if (!names.length || !isCompleteExample(code))
          return start + fence + lang + meta + '\n' + code + '\n' + fence
        const matchingName = names.find(
          name => slugify(name) === slugify(heading)
        )
        const exportName =
          matchingName ??
          (heading === 'Usage'
            ? names.find(name => /^(default|Default)$/.test(name))
            : undefined) ??
          names[0]
        let basename = slugify(exportName)
        if (seenNames.has(basename)) basename += '-' + slugify(heading)
        let suffix = 2
        const initial = basename
        while (seenNames.has(basename)) basename = initial + '-' + suffix++
        seenNames.add(basename)
        const id = `pro-${slug}-${basename}`
        const filename = `${slug}/${basename}.tsx`
        primaryFiles.set(path.join(demosRoot, filename), code)
        registry[id] = { file: filename, exportName }
        count++
        const sourceFence = code.includes('````') ? '`````' : '````'
        return `${start}<ComponentPreview name="${id}">\n\n${sourceFence}tsx\n${code}\n${sourceFence}\n\n</ComponentPreview>`
      }
    )
    const imports = path
      .relative(
        path.dirname(file),
        path.join(app, 'src/components/docs/heroui-mdx.tsx')
      )
      .split(path.sep)
      .join('/')
    const note = compatibilityNotes[slug]
      ? `<Callout type="info">\n${compatibilityNotes[slug]}\n</Callout>\n\n`
      : ''
    const mdx = `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\nsourceUrl: ${sourceUrl}\n---\n\nimport { Callout, ComponentPreview } from '${imports}'\n\n${note}${adapt(body).trim()}\n`
    await write(file, mdx)
    pages.push({ slug, title, description, category, examples: count })
  }
}

for (const [filename, code] of [...supportingFiles, ...primaryFiles]) {
  await write(
    filename,
    '// Adapted documented HeroUI Pro example; see ../README.md.\n' +
      code +
      '\n'
  )
}
await write(
  path.join(demosRoot, 'index.ts'),
  `// Generated by scripts/import-heroui-pro-docs.mjs.\nimport type { ComponentType } from 'react'\n\nexport const proDemos: Record<string, { loader: () => Promise<ComponentType>; file: string }> = {\n${Object.entries(
    registry
  )
    .map(
      ([name, item]) =>
        `  ${JSON.stringify(name)}: { file: ${JSON.stringify(item.file)}, loader: () => import(${JSON.stringify('./' + item.file.replace(/\.tsx$/, ''))}).then(module => module.${item.exportName}) }`
    )
    .join(',\n')}\n}\n`
)
await write(
  path.join(content, 'meta.json'),
  JSON.stringify(
    { title: 'Vezham Pro v3', pages: ['getting-started', 'components'] },
    null,
    2
  ) + '\n'
)
await write(
  path.join(content, 'components/meta.json'),
  JSON.stringify(
    {
      title: 'Components',
      root: true,
      pages: [
        'index',
        ...Object.entries(categories).flatMap(([category, slugs]) => [
          `---${categoryTitles[category]}---`,
          ...slugs.map(slug => `(${category})/${slug}`)
        ])
      ]
    },
    null,
    2
  ) + '\n'
)
await write(
  path.join(content, 'components/index.mdx'),
  `---\ntitle: React Components\ndescription: Browse Vezham Pro components for charts, data display, forms, navigation, AI interfaces, and more.\nsourceUrl: ${gallery.sourceUrl}\n---\n\nimport { ProComponentsCategory } from '../../../src/components/docs/heroui-mdx.tsx'\n\n${Object.keys(
    categories
  )
    .map(
      category =>
        `## ${categoryTitles[category]}\n\n<ProComponentsCategory category="${category}" />`
    )
    .join('\n\n')}\n`
)

const guides = (await readdir(path.join(snapshot, 'guides'))).filter(name =>
  name.endsWith('.mdx')
)
for (const name of guides) {
  const raw = await readFile(path.join(snapshot, 'guides', name), 'utf8')
  const title = /^# (.+)$/m.exec(raw)?.[1] ?? name.replace('.mdx', '')
  const description =
    /^> (.+)$/m.exec(raw)?.[1] ?? `${title} for Vezham Pro v3.`
  let body = adapt(
    raw
      .replace(/^# .+\n/, '')
      .replace(/^\*\*(?:Category|URL|Source)\*\*:.*\n/gm, '')
      .replace(/^> .+\n/m, '')
  )
    .replace(/<ComponentCount\s*\/>/g, String(pages.length))
    .replace(/<ExampleCount\s*\/>/g, String(Object.keys(registry).length))
  if (name === 'index.mdx' || name === 'installation.mdx')
    body = `This workspace exposes HeroUI Pro ${packageMetadata.version} through the \`@vezham/react-pro-v3\` npm alias. Use this alias in workspace imports; the upstream CLI instructions apply when setting up a separate licensed project.\n\n${body.trim()}`
  const file = path.join(content, 'getting-started', name)
  const imports = path
    .relative(
      path.dirname(file),
      path.join(app, 'src/components/docs/heroui-mdx.tsx')
    )
    .split(path.sep)
    .join('/')
  await write(
    file,
    `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\nsourceUrl: https://heroui.pro/docs/react/getting-started${name === 'index.mdx' ? '' : '/' + name.replace('.mdx', '')}\n---\n\nimport { Callout, Tab, Tabs } from '${imports}'\n\n${body.trim()}\n`
  )
}
await write(
  path.join(content, 'getting-started/meta.json'),
  JSON.stringify(
    {
      title: 'Getting Started',
      root: true,
      pages: [
        '---Overview---',
        'index',
        'installation',
        '---Handbook---',
        'colors',
        'theming',
        'styling',
        'animation',
        'composition'
      ]
    },
    null,
    2
  ) + '\n'
)
await write(
  path.join(content, 'import-manifest.json'),
  JSON.stringify(
    {
      package: '@vezham/react-pro-v3',
      version: packageMetadata.version,
      components: pages,
      demos: Object.keys(registry)
    },
    null,
    2
  ) + '\n'
)
console.log(
  `Imported ${pages.length} component pages, ${guides.length} guides and ${Object.keys(registry).length} live demos.`
)
