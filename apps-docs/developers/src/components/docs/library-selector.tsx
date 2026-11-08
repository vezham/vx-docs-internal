import { useNavigate } from '@tanstack/react-router'
import { Fragment, useState } from 'react'

import { AltArrowDown, Box, Layers } from '@vezham/icons-react'
import {
  Chip,
  Description,
  Dropdown,
  Header,
  Label,
  Separator
} from '@vezham/react-v3'
import reactPackage from '@vezham/react/package.json'

import { i18n } from '@app/docs'
import { versionSelectorVariants } from '@components/docs/navigation.variants'
import type { Locale } from '@generated/vx'

const styles = versionSelectorVariants()

export type UiLibrary = 'react-v3' | 'react-pro-v3' | 'react'

type LibraryOption = {
  id: UiLibrary
  title: string
  description?: string
  icon?: typeof Layers
  badge?: string
  destination?: UiLibrary
  disabled?: boolean
}

const librarySections: {
  id: string
  title?: string
  items: LibraryOption[]
}[] = [
  {
    id: 'v3',
    title: 'v3',
    items: [
      {
        id: 'react-v3',
        title: 'Vezham v3',
        description: 'Open source components and patterns',
        icon: Layers,
        destination: 'react-v3'
      },
      {
        id: 'react-pro-v3',
        title: 'Vezham Pro v3',
        description: 'Components, themes and templates',
        icon: Box,
        destination: 'react-pro-v3'
      }
    ]
  },
  {
    id: 'upcoming',
    items: [
      {
        id: 'react',
        title: `Vezham ${reactPackage.version}`,
        //wjdlz/REF: badge: 'Coming soon',
        destination: 'react'
      }
    ]
  }
]

const libraryOptions = librarySections.flatMap(section => section.items)

export const LibrarySelector = ({
  library,
  locale
}: {
  library: UiLibrary
  locale: Locale
}) => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const language = locale === i18n.defaultLanguage ? undefined : locale
  const selectedOption = libraryOptions.find(option => option.id === library)

  return (
    <Dropdown isOpen={open} onOpenChange={setOpen}>
      <Dropdown.Trigger className={styles.trigger()}>
        <span className={styles.label({ className: 'max-w-none' })}>
          {selectedOption?.title}
        </span>
        <AltArrowDown size={12} className={styles.chevron({ open })} />
      </Dropdown.Trigger>
      <Dropdown.Popover
        className="w-max max-w-[calc(100vw-2rem)]"
        placement="bottom start">
        <Dropdown.Menu
          selectedKeys={[library]}
          selectionMode="single"
          onAction={key => {
            const option = libraryOptions.find(item => item.id === key)

            if (option?.destination === 'react-v3') {
              void navigate({
                to: '/{-$lang}/docs/ui/react-v3/$platform/$',
                params: {
                  lang: language,
                  platform: 'web',
                  _splat: 'getting-started'
                }
              })
            } else if (option?.destination === 'react-pro-v3') {
              void navigate({
                to: '/{-$lang}/docs/ui/react-pro-v3/$platform/$',
                params: {
                  lang: language,
                  platform: 'web',
                  _splat: 'getting-started'
                }
              })
            } else if (option?.destination === 'react') {
              void navigate({
                to: '/{-$lang}/docs/ui/react/$platform/$',
                params: {
                  lang: language,
                  platform: 'web',
                  _splat: 'getting-started'
                }
              })
            }
          }}>
          {librarySections.map((section, index) => (
            <Fragment key={section.id}>
              {index > 0 && <Separator />}
              <Dropdown.Section aria-label={section.title ?? section.id}>
                {section.title && <Header>{section.title}</Header>}
                {section.items.map(option => (
                  <Dropdown.Item
                    key={option.id}
                    className="group/library data-[selected=true]:bg-accent-soft py-2 ps-3 pe-10"
                    id={option.id}
                    isDisabled={option.disabled}
                    textValue={option.title}>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Label className="group-data-[selected=true]/library:text-accent-soft-foreground">
                          {option.title}
                        </Label>
                        {option.badge && (
                          <Chip size="sm" variant="soft">
                            {option.badge}
                          </Chip>
                        )}
                      </div>
                      {option.description && (
                        <Description>{option.description}</Description>
                      )}
                    </div>
                    {option.destination && (
                      <Dropdown.ItemIndicator className="group-data-[selected=true]/library:text-accent-soft-foreground start-auto end-3" />
                    )}
                  </Dropdown.Item>
                ))}
              </Dropdown.Section>
            </Fragment>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}
