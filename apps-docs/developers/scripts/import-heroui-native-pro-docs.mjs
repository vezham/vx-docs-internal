import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const app = path.resolve(import.meta.dirname, '..')
const snapshot = path.resolve(
  process.argv[2] ?? 'test-output/heroui-pro-native-import'
)
const content = path.join(app, 'content/docs-react-pro-v3/native')
const gallery = JSON.parse(
  await readFile(path.join(snapshot, 'gallery.json'), 'utf8')
)
const paths = JSON.parse(
  await readFile(path.join(snapshot, 'pages.json'), 'utf8')
)
const prefix = '/docs/ui/react-pro-v3/native'
const pagePaths = paths.map(route => route.replace('/docs/native/', ''))
const knownPaths = new Set([...pagePaths, 'components'])
const write = async (file, value) => {
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, value)
}
const adaptLinks = body =>
  body.replace(/https:\/\/heroui\.pro\/docs\/native(?:\/[^\s)"<>]*)?/g, url => {
    const [pathname, hash] = url.split('#')
    const slug = pathname.replace('https://heroui.pro/docs/native/', '')
    return knownPaths.has(slug)
      ? `${prefix}/${slug}${hash ? '#' + hash : ''}`
      : url
  })
const entries = []
for (const route of paths) {
  const slug = route.replace('/docs/native/', '')
  const raw = await readFile(path.join(snapshot, slug + '.mdx'), 'utf8')
  const title = /^# (.+)$/m.exec(raw)?.[1]
  const description = /^> (.+)$/m.exec(raw)?.[1] ?? ''
  if (!title) throw new Error(`Missing title: ${route}`)
  let body = raw
    .replace(/^<page[^>]*>\s*\n/, '')
    .replace(/\n<\/page>\s*$/, '')
    .replace(/^# .+\n/, '')
    .replace(/^\*\*(?:Category|URL)\*\*:.*\n/gm, '')
    .replace(/^> .+\n/m, '')
  body = adaptLinks(body)
    .replace(
      '<FigmaShowcase />',
      '[Open Figma downloads on HeroUI Pro](https://heroui.pro/docs/native/getting-started/figma#download)'
    )
    .replace(
      '<NativeImageHeroView target="home" />',
      '<NativeImageHeroView href="https://heroui.pro/docs/native/getting-started" linkLabel="Preview on HeroUI Pro" />'
    )
  const component = gallery.groups
    .flatMap(group => group.components)
    .find(item => slug === `components/${item.slug}`)
  if (component) component.title = title
  const group =
    component &&
    gallery.groups.find(item => item.components.includes(component))
  const filename = component
    ? path.join(
        content,
        'components',
        `(${group.category})`,
        component.slug + '.mdx'
      )
    : path.join(
        content,
        slug === 'getting-started' ? 'getting-started/index.mdx' : slug + '.mdx'
      )
  const imports = path
    .relative(
      path.dirname(filename),
      path.join(app, 'src/components/docs/heroui-mdx.tsx')
    )
    .split(path.sep)
    .join('/')
  const preview = component
    ? `<NativeVideoPlayerView srcLight=${JSON.stringify(component.video.light)} srcDark=${JSON.stringify(component.video.dark)} href=${JSON.stringify('https://heroui.pro' + route)} linkLabel="Preview on HeroUI Pro" aria-label=${JSON.stringify(title + ' preview')} />\n\n`
    : ''
  await write(
    filename,
    `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\nsourceUrl: https://heroui.pro${route}\n${component?.status ? `status: ${component.status}\n` : ''}---\n\nimport { Callout, Tab, Tabs, NativeVideoPlayerView, NativeImageHeroView } from '${imports}'\n${body.includes('<Accordion>') ? "import { Accordion } from '@vezham/react-v3'\n" : ''}\n${preview}${body.trim()}\n`
  )
  entries.push({ path: slug, title, sourceUrl: 'https://heroui.pro' + route })
}
await write(
  path.join(content, 'meta.json'),
  JSON.stringify(
    { title: 'Vezham Pro v3 Native', pages: ['getting-started', 'components'] },
    null,
    2
  ) + '\n'
)
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
        'ci-caching',
        'licensing',
        'figma',
        '---Handbook---',
        'provider',
        'portal',
        'colors',
        'theming',
        'design-systems',
        'styling',
        'animation',
        'composition',
        '---UI for Agents---',
        'overview',
        'mcp-server',
        'agent-skills',
        'design-taste'
      ]
    },
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
        ...gallery.groups.flatMap(group => [
          `---${group.title}---`,
          ...group.components.map(item => `(${group.category})/${item.slug}`)
        ])
      ]
    },
    null,
    2
  ) + '\n'
)
await write(
  path.join(content, 'components/index.mdx'),
  `---\ntitle: All Components\ndescription: Browse Vezham Pro Native components for mobile applications.\nsourceUrl: ${gallery.sourceUrl}\n---\n\nimport { NativeProComponentsCategory } from '../../../../src/components/docs/heroui-mdx.tsx'\n\n${gallery.groups.map(group => `## ${group.title}\n\n<NativeProComponentsCategory category="${group.category}" />`).join('\n\n')}\n`
)
await write(
  path.join(app, 'src/lib/docs/heroui-pro-native-presentation.json'),
  JSON.stringify(
    { ...gallery, pagePaths: ['components', ...pagePaths] },
    null,
    2
  ) + '\n'
)
await write(
  path.join(content, '..', 'native-import-manifest.json'),
  JSON.stringify(
    {
      sourceUrl: 'https://heroui.pro/docs/native',
      package: 'heroui-native-pro',
      components: gallery.groups.flatMap(group => group.components).length,
      pages: entries
    },
    null,
    2
  ) + '\n'
)
console.log(
  `Imported ${gallery.groups.flatMap(group => group.components).length} Native components and ${entries.filter(item => item.path.startsWith('getting-started')).length} guides.`
)
