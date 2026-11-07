import { createFileRoute } from '@tanstack/react-router'

import { normalizeLocale } from '@vezham/start/runtime/docs'

import { i18n } from '@app/docs'
import { AssetGallery } from '@components/icon-library/gallery'
import { validateCatalogSearch } from '@src/lib/icon-library/catalog'

const RouteComponent = () => {
  const { lang } = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <AssetGallery
      kind="illustrations"
      locale={normalizeLocale(i18n, lang)}
      search={search}
      onSearchChange={value => {
        void navigate({ search: value, replace: true })
      }}
    />
  )
}
export const Route = createFileRoute('/{-$lang}/illustrations/')({
  component: RouteComponent,
  validateSearch: input => validateCatalogSearch(input, 'illustrations'),
  head: () => ({ meta: [{ title: 'Illustrations | Vezham Developers' }] })
})
