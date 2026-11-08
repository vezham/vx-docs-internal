import type { ComponentProps } from 'react'

import { ListBox, Select } from '@vezham/react-v3'

import { Brand } from '@components/brand'
import { ControlCenter } from '@components/docs/control-center'
import type { UiLibrary } from '@components/docs/library-selector'
import {
  type PlatformSection,
  getPlatformSections
} from '@components/docs/platform-sections'
import { PlatformTabs } from '@components/docs/platform-tabs'
import type { Locale } from '@generated/vx'

type Platform = 'web' | 'native'

type PlatformNavigationProps = {
  library?: UiLibrary
  getPlatformParams: (platform: Platform) => {
    _splat: string
    lang: string | undefined
    platform: Platform
  }
  platform: Platform
  platforms: readonly Platform[]
}

type SectionSelectProps = {
  library?: UiLibrary
  onSectionChange: (section: PlatformSection) => void
  selectedSection: PlatformSection
  platform: Platform
}

const PlatformSectionSelect = ({
  library = 'react-v3',
  onSectionChange,
  selectedSection,
  platform
}: SectionSelectProps) => (
  <Select
    aria-label="Documentation section"
    className="w-full"
    selectedKey={selectedSection}
    onSelectionChange={key => onSectionChange(key as PlatformSection)}>
    <Select.Trigger>
      <Select.Value />
      <Select.Indicator />
    </Select.Trigger>
    <Select.Popover>
      <ListBox>
        {getPlatformSections(platform, library).map(section => (
          <ListBox.Item
            key={section.id}
            id={section.id}
            textValue={section.title}>
            {section.title}
            <ListBox.ItemIndicator />
          </ListBox.Item>
        ))}
      </ListBox>
    </Select.Popover>
  </Select>
)

type HeaderProps = ComponentProps<'div'> &
  PlatformNavigationProps & {
    locale: Locale
  } & SectionSelectProps

export const PlatformDrawerHeader = ({
  library = 'react-v3',
  children,
  className,
  getPlatformParams,
  locale,
  onSectionChange,
  platform,
  platforms,
  selectedSection,
  ...props
}: HeaderProps) => {
  return (
    <>
      <div
        {...props}
        className={`flex flex-col gap-4 border-b px-4 pt-4 pb-3 md:hidden ${className ?? ''}`}>
        <div className="flex items-center justify-between gap-4 ps-1">
          <Brand.Link locale={locale} logoSize={22} />
        </div>
        <PlatformSectionSelect
          library={library}
          platform={platform}
          selectedSection={selectedSection}
          onSectionChange={onSectionChange}
        />
      </div>
      <div
        className={`hidden flex-col gap-3 border-b p-4 md:flex lg:hidden ${className ?? ''}`}>
        <PlatformTabs
          library={library}
          getPlatformParams={getPlatformParams}
          platform={platform}
          platforms={platforms}
        />
        <PlatformSectionSelect
          library={library}
          platform={platform}
          selectedSection={selectedSection}
          onSectionChange={onSectionChange}
        />
      </div>
      <div className={`hidden lg:block ${className ?? ''}`}>{children}</div>
    </>
  )
}

export const PlatformDrawerFooter = ({
  library = 'react-v3',
  className,
  getPlatformParams,
  locale,
  page,
  platform,
  platforms,
  ...props
}: ComponentProps<'div'> &
  PlatformNavigationProps & { locale: Locale; page: string }) => {
  return (
    <div
      {...props}
      className={`!hidden !w-full items-center !justify-between gap-2 !border-0 px-4 pt-2 pb-4 max-md:!flex ${className ?? ''}`}>
      <PlatformTabs
        library={library}
        getPlatformParams={getPlatformParams}
        platform={platform}
        platforms={platforms}
      />
      <ControlCenter
        library={library}
        locale={locale}
        page={page}
        platform={platform}
      />
    </div>
  )
}
