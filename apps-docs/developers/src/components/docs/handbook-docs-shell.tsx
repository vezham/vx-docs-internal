import { Link } from '@tanstack/react-router'
import type { ComponentPropsWithoutRef } from 'react'

import { useNotebookLayout } from '@vezham/docs-react/layouts/notebook'
import { Sidebar } from '@vezham/icons-react'
import type { DocsLayoutProps } from '@vezham/start/layouts/docs'
import { localizedUrl } from '@vezham/start/runtime/docs'

import { i18n } from '@app/docs'
import { ControlCenter } from '@components/docs/control-center'
import { sectionTabVariants } from '@components/docs/navigation.variants'
import { NotebookHeader } from '@components/docs/notebook-header'
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
  return (
    <NotebookHeader
      {...props}
      locale={locale}
      controls={
        <ControlCenter
          locale={locale}
          path={`/handbook${page ? `/${page}` : ''}`}
        />
      }>
      {selectedSection && (
        <HandbookSectionTabs
          locale={locale}
          selectedSection={selectedSection}
        />
      )}
    </NotebookHeader>
  )
}

export const getHandbookLayoutOptions = ({
  locale,
  page,
  selectedSection
}: Props & { page: string }): Omit<
  DocsLayoutProps,
  'children' | 'shell' | 'tree'
> => {
  const options = baseOptions(locale)
  return {
    ...options,
    nav: {
      ...options.nav,
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
                  localizedUrl(
                    i18n,
                    locale,
                    `/handbook${page ? `/${page}` : ''}`
                  )
                ])
              : undefined
        }))
      : []
  }
}
