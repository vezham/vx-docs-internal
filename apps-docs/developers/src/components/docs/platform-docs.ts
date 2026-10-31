import { defineDocs } from '@vezham/docs-mdx/macro'
import {
  createStaticDocsRuntime,
  docsMetaSchema,
  docsPageSchema
} from '@vezham/start/runtime/docs'

import { vxCore, vxDocs, vxI18n, vxMetadata } from '@generated/vx'
import { componentLinksSchema } from '../../lib/docs/component-resources'

const platformDocsPageSchema = docsPageSchema.extend({
  links: componentLinksSchema.optional()
})

const webPlatformDocs = defineDocs({
  dir: 'content/platform-docs/web',
  docs: {
    async: true,
    postprocess: { includeProcessedMarkdown: true },
    schema: platformDocsPageSchema
  },
  meta: {
    schema: docsMetaSchema
  }
})

const nativePlatformDocs = defineDocs({
  dir: 'content/platform-docs/native',
  docs: {
    async: true,
    postprocess: { includeProcessedMarkdown: true },
    schema: platformDocsPageSchema
  },
  meta: {
    schema: docsMetaSchema
  }
})

const openapiFiles = import.meta.glob<string>('/openapi/**/*.{json,yaml,yml}', {
  eager: true,
  import: 'default',
  query: '?raw'
})

const runtimeOptions = {
  i18n: { ...vxI18n, fallbackLanguage: vxI18n.defaultLanguage },
  openapiDir: vxDocs.openapiDir,
  openapiFiles,
  head: {
    appName: vxCore.shortName,
    docsImageRoute: vxDocs.docsImageRoute,
    openGraphImage: new URL(vxMetadata.openGraph.image, vxMetadata.url).href,
    openGraphImageSource: 'url' as const,
    siteDescription: vxMetadata.description,
    siteUrl: vxMetadata.url
  }
}

const runtimes = {
  web: createStaticDocsRuntime({
    ...runtimeOptions,
    docs: webPlatformDocs,
    docsRoute: '/docs-ui/web'
  }),
  native: createStaticDocsRuntime({
    ...runtimeOptions,
    docs: nativePlatformDocs,
    docsRoute: '/docs-ui/native'
  })
}

export const getPlatformDocsRuntime = (platform: 'web' | 'native') =>
  runtimes[platform]

export const getPlatformDocs = (platform: 'web' | 'native') =>
  platform === 'web' ? webPlatformDocs : nativePlatformDocs
