import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router'

import { localizedUrl } from '@vezham/start/runtime/docs'

import { i18n } from '@app/docs'
import {
  getPlatformDocs,
  getPlatformDocsRuntime
} from '@components/docs/platform-docs'
import {
  PlatformDrawerFooter,
  PlatformDrawerHeader
} from '@components/docs/platform-drawer'
import { PlatformNotebookHeader } from '@components/docs/platform-notebook-header'
import { PlatformDocsRoutePage } from '@components/docs/platform-route-page'
import {
  type PlatformSection,
  getPlatformPage,
  getPlatformSections
} from '@components/docs/platform-sections'
import { PlatformTabs } from '@components/docs/platform-tabs'
import { baseOptions } from '@config/layout'
import type { Locale } from '@generated/vx'
import { createPlatformDocsLoader } from '@src/lib/docs/platform-loader'

const RouteComponent = () => {
  const navigate = useNavigate()
  const data = Route.useLoaderData()
  const { lang, platform, _splat } = Route.useParams()
  if (platform !== 'web' && platform !== 'native') throw notFound()

  const platformSections = getPlatformSections(platform)
  const section = _splat?.split('/')[0]
  const currentSection = platformSections.find(item => item.id === section)
  if (!data || !currentSection || !_splat) throw notFound()

  const locale = (lang ?? i18n.defaultLanguage) as Locale
  const getPlatformParams = (value: 'web' | 'native') => ({
    lang: locale === i18n.defaultLanguage ? undefined : locale,
    platform: value,
    _splat: getPlatformPage(value, _splat)
  })

  return (
    <PlatformDocsRoutePage
      data={data}
      docs={getPlatformDocs(platform)}
      shell="notebook"
      getLayoutOptions={locale => ({
        ...baseOptions(locale as Locale),
        links: [
          {
            text: 'Layout previews',
            url: localizedUrl(i18n, locale, '/layouts')
          }
        ],
        nav: {
          title: 'Developer Docs | Vezham',
          mode: 'top',
          children: (
            <PlatformTabs
              getPlatformParams={getPlatformParams}
              platform={platform}
            />
          )
        },
        sidebar: {
          banner: props => (
            <PlatformDrawerHeader
              {...props}
              getPlatformParams={getPlatformParams}
              locale={locale as Locale}
              platform={platform}
              selectedSection={section as PlatformSection}
              onSectionChange={value =>
                navigate({
                  to: '/{-$lang}/docs-ui/$platform/$',
                  params: {
                    ...getPlatformParams(platform),
                    _splat:
                      platformSections.find(item => item.id === value)?.page ??
                      _splat
                  }
                })
              }
            />
          ),
          footer: props => (
            <PlatformDrawerFooter
              {...props}
              getPlatformParams={getPlatformParams}
              locale={locale as Locale}
              page={_splat}
              platform={platform}
            />
          )
        },
        tabMode: 'navbar',
        slots: {
          header: props => (
            <PlatformNotebookHeader
              {...props}
              locale={locale as Locale}
              page={_splat}
              platform={platform}
              selectedSection={section as PlatformSection}
            />
          )
        },
        tabs: platformSections.map(item => ({
          title: item.title,
          url: localizedUrl(i18n, locale, `/docs-ui/${platform}/${item.page}`),
          urls:
            item.id === section
              ? new Set([
                  localizedUrl(i18n, locale, `/docs-ui/${platform}/${_splat}`)
                ])
              : undefined
        }))
      })}
    />
  )
}

export const Route = createFileRoute('/{-$lang}/docs-ui/$platform/$')({
  component: RouteComponent,
  head: ({ loaderData, params }) => {
    const head = getPlatformDocsRuntime(
      params.platform === 'native' ? 'native' : 'web'
    ).getDocsRouteHead(loaderData)
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
  loader: createPlatformDocsLoader()
})
