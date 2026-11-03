import { createFileRoute } from '@tanstack/react-router'

import { normalizeLocale } from '@vezham/start/runtime/docs'

import { i18n } from '@app/docs'
import { AssetDetail, parseDetailSearch } from '@components/icon-library/detail'

const RouteComponent = () => {
  const { lang, name } = Route.useParams()
  const { weight } = Route.useSearch()
  return (
    <AssetDetail
      kind="icons"
      name={name}
      locale={normalizeLocale(i18n, lang)}
      initialWeight={weight}
    />
  )
}
export const Route = createFileRoute('/{-$lang}/icon/$name')({
  component: RouteComponent,
  validateSearch: parseDetailSearch,
  head: ({ params }) => ({ meta: [{ title: `${params.name} | Vezham Icons` }] })
})
