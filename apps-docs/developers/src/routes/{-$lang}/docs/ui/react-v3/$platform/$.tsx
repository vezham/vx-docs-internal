import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router'

import { i18n } from '@app/docs'
import {
  getPlatformDocs,
  getPlatformDocsRuntime
} from '@components/docs/platform-docs'
import { getPlatformLayoutOptions } from '@components/docs/platform-layout'
import { PlatformDocsRoutePage } from '@components/docs/platform-route-page'
import {
  type PlatformSection,
  getPlatformPage,
  getPlatformSections
} from '@components/docs/platform-sections'
import { getUiLibrarySectionTitle } from '@config/ui-libraries'
import type { Locale } from '@generated/vx'
import { createPlatformDocsLoader } from '@src/lib/docs/platform-loader'
import { docsPageHead } from '@src/lib/page-head'

const library = 'react-v3' as const

const RouteComponent = () => {
  const navigate = useNavigate()
  const data = Route.useLoaderData()
  const { lang, platform, _splat } = Route.useParams()
  if (platform !== 'web' && platform !== 'native') throw notFound()

  const platformSections = getPlatformSections(platform, library)
  const section = _splat?.split('/')[0]
  const currentSection = platformSections.find(item => item.id === section)
  if (!data || !currentSection || !_splat) throw notFound()

  const locale = (lang ?? i18n.defaultLanguage) as Locale
  const getPlatformParams = (value: 'web' | 'native') => ({
    lang: locale === i18n.defaultLanguage ? undefined : locale,
    platform: value,
    _splat: getPlatformPage(value, _splat, library)
  })

  return (
    <PlatformDocsRoutePage
      data={data}
      platform={platform}
      docs={getPlatformDocs(platform, library)}
      shell="notebook"
      getLayoutOptions={locale =>
        getPlatformLayoutOptions({
          library,
          locale: locale as Locale,
          page: _splat,
          platform,
          platforms: data.platforms,
          selectedSection: section as PlatformSection,
          getPlatformParams,
          onSectionChange: value => {
            void navigate({
              to: '/{-$lang}/docs/ui/react-v3/$platform/$',
              params: {
                ...getPlatformParams(platform),
                _splat:
                  platformSections.find(item => item.id === value)?.page ??
                  _splat
              }
            })
          }
        })
      }
    />
  )
}

export const Route = createFileRoute('/{-$lang}/docs/ui/react-v3/$platform/$')({
  component: RouteComponent,
  head: ({ loaderData, params }) => {
    const head = docsPageHead(
      loaderData,
      getPlatformDocsRuntime(
        params.platform === 'native' ? 'native' : 'web',
        library
      ).getDocsRouteHead(loaderData),
      {
        section: getUiLibrarySectionTitle(
          library,
          params.platform === 'native' ? 'native' : 'web'
        )
      }
    )
    if (!loaderData?.image || !head.meta) return head
    return {
      ...head,
      meta: head.meta.map(meta =>
        ('property' in meta && meta.property === 'og:image') ||
        ('name' in meta && meta.name === 'twitter:image')
          ? { ...meta, content: loaderData.image }
          : meta
      )
    }
  },
  loader: createPlatformDocsLoader(library)
})
