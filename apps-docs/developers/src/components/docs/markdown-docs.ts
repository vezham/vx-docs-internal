import { defineDocs } from '@vezham/docs-mdx/macro'
import {
  createStaticDocsRuntime,
  docsMetaSchema,
  docsPageSchema
} from '@vezham/start/runtime/docs'

import { vxCore, vxDocs, vxI18n, vxMetadata } from '@generated/vx'

export const markdownDocs = defineDocs({
  dir: 'content/handbook-markdown',
  docs: {
    async: true,
    postprocess: { includeProcessedMarkdown: true },
    schema: docsPageSchema
  },
  meta: {
    schema: docsMetaSchema
  }
})

export const markdownDocsRuntime = createStaticDocsRuntime({
  docs: markdownDocs,
  docsRoute: '/handbook/markdown',
  i18n: vxI18n,
  head: {
    appName: vxCore.shortName,
    docsImageRoute: vxDocs.docsImageRoute,
    openGraphImage: vxMetadata.openGraph.image,
    openGraphImageSource: vxMetadata.openGraph.imageSource,
    siteDescription: vxMetadata.description,
    siteUrl: vxMetadata.url
  }
})
