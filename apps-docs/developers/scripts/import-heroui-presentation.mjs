import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'
import prettier from 'prettier'
import ts from 'typescript'

const upstream = path.resolve(process.argv[2])
const load = async file => {
  const source = await readFile(path.join(upstream, 'src', file), 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS }
  }).outputText
  const exports = {}
  vm.runInNewContext(output, {
    exports,
    require: () => ({
      __esModule: true,
      default: null,
      CORE_TEAM_AUTHORS: { jrgarciadev: {} }
    })
  })
  return exports
}

const registry = await load('components-registry.ts')
const showcases = await load('showcases/registry/navigation.ts')
const names = []
// vx-bot/NOTE: Discover the complete map from the source declaration, including components without relations.
const source = await readFile(
  path.join(upstream, 'src/components-registry.ts'),
  'utf8'
)
const ast = ts.createSourceFile(
  'components-registry.ts',
  source,
  ts.ScriptTarget.Latest,
  true
)
const declaration = ast.statements.find(
  statement =>
    ts.isVariableStatement(statement) &&
    statement.declarationList.declarations.some(
      item => item.name.getText(ast) === 'componentsMap'
    )
)
const map = declaration.declarationList.declarations.find(
  item => item.name.getText(ast) === 'componentsMap'
).initializer
for (const property of map.properties)
  names.push(property.name.getText(ast).replaceAll('"', '').replaceAll("'", ''))
const related = Object.fromEntries(
  [...new Set(names)].map(name => [
    name,
    registry
      .getRelatedComponents(name)
      .slice(0, 3)
      .map(item => item.name)
  ])
)
const cards = showcases.navigationShowcases.map(
  ({ name, title, description, posterUrl, components }) => ({
    name,
    title,
    description,
    posterUrl,
    components
  })
)
const output = path.resolve(
  import.meta.dirname,
  '../src/lib/docs/heroui-presentation.ts'
)
await writeFile(
  output,
  await prettier.format(
    `// vx-bot/INFO: Generated from HeroUI docs (Apache-2.0); see content/platform-docs/LICENSE-HeroUI.\nexport const relatedComponents: Record<string, string[]> = ${JSON.stringify(related, null, 2)}\n\nexport const relatedShowcases = ${JSON.stringify(cards, null, 2)}\n`,
    { ...(await prettier.resolveConfig(output)), filepath: output }
  )
)
console.log(
  `Imported related-component data for ${Object.keys(related).length} components and ${cards.length} showcases`
)
