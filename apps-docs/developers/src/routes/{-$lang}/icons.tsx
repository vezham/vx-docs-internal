import { createFileRoute } from '@tanstack/react-router'

import { normalizeLocale } from '@vezham/start/runtime/docs'

import { i18n } from '@app/docs'
import { TodoPage } from '@components/docs/todo-page'

const RouteComponent = () => {
  const { lang } = Route.useParams()
  return <TodoPage locale={normalizeLocale(i18n, lang)} title="Icons" />
}

export const Route = createFileRoute('/{-$lang}/icons')({
  component: RouteComponent,
  head: () => ({ meta: [{ title: 'Icons | Developer' }] })
})
