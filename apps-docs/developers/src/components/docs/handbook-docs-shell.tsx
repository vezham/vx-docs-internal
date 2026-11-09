import { Link } from '@tanstack/react-router'
import type { ComponentPropsWithoutRef } from 'react'

import { useNotebookLayout } from '@vezham/docs-react/layouts/notebook'
import { Sidebar } from '@vezham/icons-react'
import type { DocsLayoutProps } from '@vezham/start/layouts/docs'
import { localizedUrl } from '@vezham/start/runtime/docs'

import { i18n } from '@app/docs'
import { Brand } from '@components/brand'
import { ControlCenter } from '@components/docs/control-center'
import { sectionTabVariants } from '@components/docs/navigation.variants'
import { UserControls } from '@components/docs/user-controls'
import { baseOptions } from '@config/layout'
import type { Locale } from '@generated/vx'

const handbookSections = [
  { id: 'getting-started', title: 'Getting Started', path: '' },
  { id: 'markdown', title: 'Markdown', path: 'markdown' }
] as const

type HandbookSection = (typeof handbookSections)[number]['id']

type Props = {
  locale: Locale
  selectedSection?: HandbookSection
}

const HandbookSectionTabs = ({ locale, selectedSection }: Props) => {
  const { slots } = useNotebookLayout()
  const SidebarCollapseTrigger = slots.sidebar.collapseTrigger

  return (
    <div
      data-header-tabs=""
      className="flex h-10 items-center border-b px-4 max-lg:hidden md:px-6">
      <SidebarCollapseTrigger className="text-muted hover:bg-default-hover hover:text-foreground -ms-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md">
        <Sidebar size={16} />
      </SidebarCollapseTrigger>
      <nav
        aria-label="Handbook sections"
        className="ms-3 flex h-full items-end gap-6">
        {handbookSections.map(section => (
          <Link
            key={section.id}
            to={localizedUrl(
              i18n,
              locale,
              `/handbook${section.path ? `/${section.path}` : ''}`
            )}
            className={sectionTabVariants({
              selected: section.id === selectedSection
            })}>
            {section.title}
          </Link>
        ))}
      </nav>
    </div>
  )
}

const HandbookNotebookHeader = ({
  locale,
  page,
  selectedSection,
  ...props
}: ComponentPropsWithoutRef<'header'> & Props & { page: string }) => {
  const { navItems, slots } = useNotebookLayout()
  const searchTrigger =
    slots.searchTrigger === false ? undefined : slots.searchTrigger
  const FullSearchTrigger = searchTrigger?.full
  const SmallSearchTrigger = searchTrigger?.sm
  const SidebarTrigger = slots.sidebar.trigger

  return (
    <header
      {...props}
      id="nd-subnav"
      className={`layout:[--fd-header-height:--spacing(14)] lg:layout:[--fd-header-height:--spacing(24)] sticky top-(--fd-docs-row-1) z-10 flex flex-col backdrop-blur-sm transition-colors [grid-area:header] ${props.className ?? ''}`}>
      <div data-header-body="" className="flex h-14 gap-2 px-4 md:px-6">
        <div className="flex flex-1 items-center gap-2">
          <Brand.Link locale={locale} />
        </div>
        {FullSearchTrigger && (
          <FullSearchTrigger
            hideIfDisabled
            className="my-auto w-full max-w-sm rounded-xl ps-2.5 max-md:hidden"
          />
        )}
        <div className="flex flex-1 items-center justify-end md:gap-2">
          <div className="flex items-center gap-6 max-lg:hidden">
            {navItems.map(item => {
              if (item.type === 'custom') return item.children
              if (item.type !== 'main' && item.type !== 'button') return null
              return (
                <a
                  key={item.url}
                  href={item.url}
                  className="text-muted hover:text-foreground text-sm transition-colors">
                  {item.text}
                </a>
              )
            })}
          </div>
          <div className="flex items-center md:hidden">
            {SmallSearchTrigger && (
              <SmallSearchTrigger hideIfDisabled className="p-2" />
            )}
            <SidebarTrigger className="text-muted hover:bg-default-hover -me-1.5 inline-flex size-8 items-center justify-center rounded-md p-2">
              <Sidebar size={16} />
            </SidebarTrigger>
          </div>
          <div className="flex items-center gap-2 max-md:hidden">
            <ControlCenter
              locale={locale}
              path={`/handbook${page ? `/${page}` : ''}`}
            />
            <UserControls />
          </div>
        </div>
      </div>
      {selectedSection && (
        <HandbookSectionTabs
          locale={locale}
          selectedSection={selectedSection}
        />
      )}
    </header>
  )
}

export const getHandbookLayoutOptions = ({
  locale,
  page,
  selectedSection
}: Props & { page: string }): Omit<
  DocsLayoutProps,
  'children' | 'shell' | 'tree'
> => ({
  ...baseOptions(locale),
  nav: {
    title: 'Developer Docs | Vezham',
    mode: 'top' as const
  },
  tabMode: 'navbar' as const,
  slots: {
    header: (props: ComponentPropsWithoutRef<'header'>) => (
      <HandbookNotebookHeader
        {...props}
        locale={locale}
        page={page}
        selectedSection={selectedSection}
      />
    )
  },
  tabs: selectedSection
    ? handbookSections.map(section => ({
        title: section.title,
        url: localizedUrl(
          i18n,
          locale,
          `/handbook${section.path ? `/${section.path}` : ''}`
        ),
        urls:
          section.id === selectedSection
            ? new Set([
                localizedUrl(i18n, locale, `/handbook${page ? `/${page}` : ''}`)
              ])
            : undefined
      }))
    : []
})
