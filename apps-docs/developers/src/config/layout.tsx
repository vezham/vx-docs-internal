import type { BaseLayoutProps } from '@vezham/docs-react/layouts/shared'
import { VezhamLogo } from '@vezham/icons-react'
import { localizedUrl } from '@vezham/start/runtime/docs'

import { i18n } from '@app/docs'
import type { Locale } from '@generated/vx'

export const baseOptions = (
  locale: Locale = i18n.defaultLanguage
): BaseLayoutProps => {
  return {
    nav: {
      title: (
        <span className="inline-flex items-center gap-2 font-semibold">
          <VezhamLogo size={22} />
          Developer
        </span>
      )
    },
    links: [
      {
        text: 'UI',
        url: localizedUrl(
          i18n,
          locale,
          '/docs/ui/react-v3/web/getting-started'
        ),
        active: 'nested-url'
      },
      {
        text: 'Pro',
        url: localizedUrl(i18n, locale, '/docs/pro'),
        active: 'nested-url'
      },
      {
        text: 'Handbook',
        url: localizedUrl(i18n, locale, '/handbook/get-started'),
        active: 'nested-url'
      },
      {
        text: 'Icons',
        url: localizedUrl(i18n, locale, '/icons'),
        active: 'nested-url'
      }
    ]
  }
}
