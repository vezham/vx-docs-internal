import { z } from 'zod'

import { defineDocs } from '@vezham/docs-mdx/macro'
import {
  createStaticDocsRuntime,
  docsMetaSchema,
  docsPageSchema
} from '@vezham/start/runtime/docs'

import type { UiLibrary } from '@components/docs/library-selector'
import { vxCore, vxDocs, vxI18n, vxMetadata } from '@generated/vx'

import { componentLinksSchema } from '../../lib/docs/component-resources'

export const platformDocsPageSchema = docsPageSchema.extend({
  links: componentLinksSchema.optional(),
  status: z.enum(['new', 'updated', 'preview', 'new-dot']).optional(),
  image: z.string().optional(),
  github: z.object({ pull: z.number().optional() }).optional(),
  index: z.boolean().optional()
})

const webPlatformDocs = defineDocs({
  dir: 'content/docs-ui/web',
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
  dir: 'content/docs-ui/native',
  docs: {
    async: true,
    postprocess: { includeProcessedMarkdown: true },
    schema: platformDocsPageSchema
  },
  meta: {
    schema: docsMetaSchema
  }
})

const proPlatformDocs = defineDocs({
  dir: 'content/docs-ui-pro-v3',
  docs: {
    async: true,
    postprocess: { includeProcessedMarkdown: true },
    schema: platformDocsPageSchema
  },
  meta: { schema: docsMetaSchema }
})

const reactPlatformDocs = defineDocs({
  dir: 'content/docs-ui-react',
  docs: {
    async: true,
    postprocess: { includeProcessedMarkdown: true },
    schema: platformDocsPageSchema
  },
  meta: { schema: docsMetaSchema }
})

const runtimeOptions = {
  i18n: { ...vxI18n, fallbackLanguage: vxI18n.defaultLanguage },
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
    docsRoute: '/docs/ui/react-v3/web'
  }),
  native: createStaticDocsRuntime({
    ...runtimeOptions,
    docs: nativePlatformDocs,
    docsRoute: '/docs/ui/react-v3/native'
  })
}

const libraryRuntimes: Record<
  UiLibrary,
  Partial<typeof runtimes> & { default?: typeof runtimes.web }
> = {
  'react-v3': runtimes,
  'react-pro-v3': {
    default: createStaticDocsRuntime({
      ...runtimeOptions,
      docs: proPlatformDocs,
      docsRoute: '/docs/ui/react-pro-v3'
    })
  },
  react: {
    default: createStaticDocsRuntime({
      ...runtimeOptions,
      docs: reactPlatformDocs,
      docsRoute: '/docs/ui/react'
    })
  }
}

export const getAvailablePlatforms = (library: UiLibrary) =>
  (['web', 'native'] as const).filter(
    platform =>
      (libraryRuntimes[library][platform]?.source.getPages().length ?? 0) > 0
  )

export const getPlatformDocsRuntime = (
  platform: 'web' | 'native' | undefined,
  library: UiLibrary = 'react-v3'
) => {
  const runtime = libraryRuntimes[library][platform ?? 'default']
  if (!runtime)
    throw new Error(`No ${platform ?? 'default'} documentation for ${library}`)
  return runtime
}

export const getPlatformDocs = (
  platform: 'web' | 'native' | undefined,
  library: UiLibrary = 'react-v3'
) => {
  if (library === 'react-pro-v3') return proPlatformDocs
  if (library === 'react') return reactPlatformDocs
  return platform === 'web' ? webPlatformDocs : nativePlatformDocs
}
