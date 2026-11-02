import { HomeLayout } from '@vezham/docs-react/layouts/home'

import { baseOptions } from '@config/layout'
import type { Locale } from '@generated/vx'

type TodoLink = { href: string; label: string }

type Props = {
  locale: Locale
  title: string
  links?: TodoLink[]
}

export const TodoPage = ({ links, locale, title }: Props) => (
  <HomeLayout {...baseOptions(locale)}>
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <p className="text-fd-muted-foreground mb-3 text-sm">TODO</p>
      <h1 className="mb-4 text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="text-fd-muted-foreground mb-8">
        TODO: Add documentation content for {title}.
      </p>
      {links?.length ? (
        <ul className="list-disc space-y-2 ps-6">
          {links.map(link => (
            <li key={link.href}>
              <a className="underline underline-offset-4" href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  </HomeLayout>
)
