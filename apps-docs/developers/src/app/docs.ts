import { defineDocs } from '@vezham/docs-mdx/macro'
import {
  createStaticDocsRuntime,
  docsMetaSchema,
  docsPageSchema
} from '@vezham/start/runtime/docs'

import { vxCore, vxDocs, vxI18n, vxMetadata } from '@generated/vx'

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    async: true,
    postprocess: { includeProcessedMarkdown: true },
    schema: docsPageSchema
  },
  meta: {
    schema: docsMetaSchema
  }
})

export const { i18n, source, getLLMText } = createStaticDocsRuntime({
  i18n: vxI18n,
  docs,
  docsRoute: vxDocs.docsRoute,
  head: {
    appName: vxCore.shortName,
    docsImageRoute: vxDocs.docsImageRoute,
    openGraphImage: vxMetadata.openGraph.image,
    openGraphImageSource: vxMetadata.openGraph.imageSource,
    siteDescription: vxMetadata.description,
    siteUrl: vxMetadata.url
  }
})
