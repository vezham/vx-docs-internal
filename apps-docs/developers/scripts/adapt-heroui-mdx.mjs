import { readFile, readdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const mdxRequire = createRequire(require.resolve('@vezham/docs-mdx'))
const { createProcessor } = await import(
  pathToFileURL(mdxRequire.resolve('@mdx-js/mdx')).href
)
const root = path.resolve(import.meta.dirname, '../content/docs-react-v3')
const processor = createProcessor()
const allNames = new Set()
const visit = (node, callback) => {
  callback(node)
  for (const child of node.children ?? []) visit(child, callback)
}
for (const file of await readdir(root, { recursive: true })) {
  if (!file.endsWith('.mdx')) continue
  const filename = path.join(root, file)
  const text = await readFile(filename, 'utf8')
  const end = text.indexOf('\n---', 4) + 4
  const body = text
    .slice(end)
    .replace(/\nimport \{[^\n]+\} from '[^'\n]*heroui-mdx(?:\.tsx)?'\n/g, '\n')
  const tree = processor.parse(body)
  const names = new Set()
  visit(tree, node => {
    if (node.type.startsWith('mdxJsx') && /^[A-Z]/.test(node.name ?? '')) {
      names.add(node.name.split('.')[0])
      allNames.add(node.name)
    }
  })
  const adapter = path
    .relative(
      path.dirname(filename),
      path.resolve(import.meta.dirname, '../src/components/docs/heroui-mdx.tsx')
    )
    .split(path.sep)
    .join('/')
  const adapted = names.size
    ? `${text.slice(0, end)}\n\nimport { ${[...names].sort().join(', ')} } from '${adapter}'\n${body}`
    : text
  await writeFile(filename, adapted)
}
console.log([...allNames].sort().join('\n'))
