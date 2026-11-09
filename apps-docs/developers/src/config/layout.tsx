import type { BaseLayoutProps } from '@vezham/docs-react/layouts/shared'
import { localizedUrl } from '@vezham/start/runtime/docs'

import { i18n } from '@app/docs'
import { Brand } from '@components/brand'
import type { Locale } from '@generated/vx'

export const baseOptions = (
  locale: Locale = i18n.defaultLanguage
): BaseLayoutProps => {
  return {
    nav: {
      title: <Brand logoSize={22} />
    },
    links: [
      {
        text: 'UI',
        url: localizedUrl(i18n, locale, '/docs/ui/react/web/getting-started'),
        active: 'nested-url'
      },
      {
        text: 'Assets',
        url: localizedUrl(i18n, locale, '/docs/assets/icons'),
        active: 'nested-url'
      },
      {
        text: 'Handbook',
        url: localizedUrl(i18n, locale, '/handbook'),
        active: 'nested-url'
      }
    ]
  }
}
