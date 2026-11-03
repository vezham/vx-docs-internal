import { Link as RouterLink } from '@tanstack/react-router'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { HomeLayout } from '@vezham/docs-react/layouts/home'
import { Tabs } from '@vezham/react-v3'

import { i18n } from '@app/docs'
import { baseOptions } from '@config/layout'
import type { Locale } from '@generated/vx'

const navigation = [
  { id: 'icons', title: 'Icons', to: '/{-$lang}/icons' },
  { id: 'illustrations', title: 'Illustrations', to: '/{-$lang}/illustration' },
  { id: 'logos', title: 'Logos', to: '/{-$lang}/logos' },
  { id: 'docs', title: 'Docs', to: '/{-$lang}/docs' },
  { id: 'packages', title: 'Packages', to: '/{-$lang}/packages' },
  { id: 'faq', title: 'FAQ', to: '/{-$lang}/faq' }
] as const
type AssetSection = (typeof navigation)[number]['id']

export const AssetNavigation = ({
  active,
  locale
}: {
  active: AssetSection
  locale: Locale
}) => (
  <Tabs selectedKey={active} keyboardActivation="manual" className="min-w-0">
    <Tabs.ListContainer>
      <Tabs.List aria-label="Icon library sections">
        {navigation.map(item => (
          <Tabs.Tab
            key={item.id}
            id={item.id}
            href={`${locale === i18n.defaultLanguage ? '' : '/' + locale}${item.to.replace('/{-$lang}', '')}`}
            render={props => {
              const linkProps = { ...(props as ComponentPropsWithoutRef<'a'>) }
              delete linkProps.href
              return (
                <RouterLink
                  {...linkProps}
                  to={item.to}
                  params={{
                    lang: locale === i18n.defaultLanguage ? undefined : locale
                  }}
                />
              )
            }}>
            {item.title}
            <Tabs.Indicator />
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs.ListContainer>
  </Tabs>
)

export const AssetShell = ({
  active,
  locale,
  children
}: {
  active: AssetSection
  locale: Locale
  children: ReactNode
}) => (
  <HomeLayout {...baseOptions(locale)}>
    <main className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <AssetNavigation active={active} locale={locale} />
      {children}
    </main>
  </HomeLayout>
)
