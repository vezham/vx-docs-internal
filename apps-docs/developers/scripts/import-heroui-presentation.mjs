import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'
import prettier from 'prettier'
import ts from 'typescript'

const upstream = path.resolve(process.argv[2])
const readConstant = async (file, name) => {
  const source = await readFile(path.join(upstream, 'src', file), 'utf8')
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
  const declaration = ast.statements
    .filter(ts.isVariableStatement)
    .flatMap(statement => [...statement.declarationList.declarations])
    .find(item => item.name.getText(ast) === name)
  if (!declaration?.initializer) throw new Error(`Missing ${name} in ${file}`)
  const exports = {}
  const output = ts.transpileModule(
    `export const value = ${declaration.initializer.getText(ast)}`,
    { compilerOptions: { module: ts.ModuleKind.CommonJS } }
  ).outputText
  vm.runInNewContext(output, { exports })
  return exports.value
}
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
const categorySource = 'components/components-category.tsx'
const nativeCategorySource = 'components/native/components-category.tsx'
const galleryGroups = {
  web: await readConstant(categorySource, 'COMPONENT_GROUPS'),
  native: await readConstant(nativeCategorySource, 'COMPONENT_GROUPS')
}
const cdn = await readConstant('utils/constants.ts', 'CDN_URL')
const galleryMedia = {
  imageBaseUrl: `${cdn}/docs/related-components`,
  nativeVideoBaseUrl: await readConstant(
    nativeCategorySource,
    'VIDEO_BASE_URL'
  ),
  nativeVideoNames: await readConstant(
    nativeCategorySource,
    'VIDEO_NAME_OVERRIDES'
  )
}
const output = path.resolve(
  import.meta.dirname,
  '../src/lib/docs/heroui-presentation.ts'
)
await writeFile(
  output,
  await prettier.format(
    `// vx-bot/INFO: Generated from HeroUI docs (Apache-2.0); see content/ui-docs/LICENSE-HeroUI.\nexport const relatedComponents: Record<string, string[]> = ${JSON.stringify(related, null, 2)}\n\nexport const relatedShowcases = ${JSON.stringify(cards, null, 2)}\n\nexport const componentGalleryGroups = ${JSON.stringify(galleryGroups, null, 2)}\n\nexport const componentGalleryMedia: { imageBaseUrl: string; nativeVideoBaseUrl: string; nativeVideoNames: Record<string, string> } = ${JSON.stringify(galleryMedia, null, 2)}\n`,
    { ...(await prettier.resolveConfig(output)), filepath: output }
  )
)
console.log(
  `Imported related-component data for ${Object.keys(related).length} components and ${cards.length} showcases`
)
