import {
  createFileRoute,
  notFound,
  redirect,
  useNavigate
} from '@tanstack/react-router'

import { i18n } from '@app/docs'
import {
  getPlatformDocs,
  getPlatformDocsRuntime
} from '@components/docs/platform-docs'
import { getPlatformLayoutOptions } from '@components/docs/platform-layout'
import { PlatformDocsRoutePage } from '@components/docs/platform-route-page'
import { getPlatformSections } from '@components/docs/platform-sections'
import type { Locale } from '@generated/vx'
import { createPlatformDocsLoader } from '@src/lib/docs/platform-loader'

const library = 'react' as const
const loadDocs = createPlatformDocsLoader(library)

const RouteComponent = () => {
  const navigate = useNavigate()
  const data = Route.useLoaderData()
  const { _splat } = Route.useParams()
  const sections = getPlatformSections('web', library)
  const section = sections.find(item => item.id === _splat?.split('/')[0])
  if (!data || !section || !_splat) throw notFound()

  return (
    <PlatformDocsRoutePage
      data={data}
      docs={getPlatformDocs(undefined, library)}
      shell="notebook"
      getLayoutOptions={locale => {
        const getPlatformParams = (platform: 'web' | 'native') => ({
          lang: locale === i18n.defaultLanguage ? undefined : locale,
          platform,
          _splat
        })

        return getPlatformLayoutOptions({
          library,
          locale: locale as Locale,
          page: _splat,
          platforms: data.platforms,
          selectedSection: section.id,
          getPlatformParams,
          onSectionChange: value => {
            void navigate({
              to: '/{-$lang}/docs/ui/react/$',
              params: { ...getPlatformParams('web'), _splat: value }
            })
          }
        })
      }}
    />
  )
}

export const Route = createFileRoute('/{-$lang}/docs/ui/react/$')({
  beforeLoad: ({ params }) => {
    if (params._splat === 'get-started') {
      throw redirect({
        to: '/{-$lang}/docs/ui/react/$',
        params: { lang: params.lang, _splat: 'getting-started' }
      })
    }
  },
  component: RouteComponent,
  loader: ({ params }) => loadDocs({ params }),
  head: ({ loaderData }) =>
    getPlatformDocsRuntime(undefined, library).getDocsRouteHead(loaderData)
})
