import { useRouter } from '@tanstack/react-router'

import { useTheme } from '@vezham/docs-react/provider/base'
import { ConfiguredControlCenter as SharedControlCenter } from '@vezham/react/control-center'
import { localizedUrl } from '@vezham/start/runtime/docs'
import { getLanguageDisplayName } from '@vezham/start/tanstack-docs'

import { i18n } from '@app/docs'
import { getUiLibraryRoute } from '@components/docs/library-routes'
import type { UiLibrary } from '@config/ui-libraries'
import { controlCenter } from '@generated/navigation'
import type { Locale } from '@generated/vx'

type Props = { locale: Locale } & (
  | {
      library?: UiLibrary
      page: string
      platform: 'web' | 'native'
      path?: never
    }
  | {
      path: string
      library?: never
      page?: never
      platform?: never
    }
)

export const ControlCenter = ({
  library = 'react',
  locale,
  page,
  platform,
  path
}: Props) => {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const languageLocation = (language: Locale) =>
    path !== undefined
      ? { to: localizedUrl(i18n, language, path) }
      : {
          to: getUiLibraryRoute(library),
          params: {
            lang: language === i18n.defaultLanguage ? undefined : language,
            platform,
            _splat: page
          }
        }
  return (
    <SharedControlCenter
      appearance={{
        isDark: resolvedTheme === 'dark',
        setDark: dark => setTheme(dark ? 'dark' : 'light')
      }}
      context={{
        language: {
          value: locale,
          options: i18n.languages.map(language => ({
            value: language,
            label: getLanguageDisplayName(language),
            href: router.buildLocation(languageLocation(language)).href
          })),
          onChange: (value: string) => {
            const language = i18n.languages.find(language => language === value)
            if (language) void router.navigate(languageLocation(language))
          }
        }
      }}
      config={controlCenter}
    />
  )
}
