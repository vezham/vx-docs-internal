import { useNavigate } from '@tanstack/react-router'

import { HomeLayout } from '@vezham/docs-react/layouts/home'
import { Link } from '@vezham/react-v3'
import { localizedRouteParam } from '@vezham/start/runtime/docs'

import { i18n } from '@app/docs'
import { baseOptions } from '@config/layout'
import type { Locale } from '@generated/vx'

type Props = {
  locale?: Locale
}

export default ({ locale }: Props) => {
  const navigate = useNavigate()
  const lang = localizedRouteParam(i18n, locale)

  return (
    <HomeLayout {...baseOptions(locale)}>
      Hello World
      <Link
        onPress={() => navigate({ to: '/{-$lang}/docs/ui', params: { lang } })}>
        <Link.Icon />
        Open Vezham UI
        <Link.Icon />
      </Link>
    </HomeLayout>
  )
}
