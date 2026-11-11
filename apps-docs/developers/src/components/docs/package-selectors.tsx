import { useNavigate } from '@tanstack/react-router'

import { Chip, Label, ListBox, Select } from '@vezham/react-v3'
import { localizedUrl } from '@vezham/start/runtime/docs'

import { i18n } from '@app/docs'
import {
  getAvailableDocsPackages,
  packagesDocsRuntime
} from '@components/docs/packages-docs'
import {
  type DocsPackage,
  docsPackages,
  getDocsPackage,
  getPackageDocsPath
} from '@config/packages'
import type { Locale } from '@generated/vx'
import { getContentPage } from '@src/lib/docs/content-navigation'

export const PackageSelector = ({
  packageId,
  locale,
  page
}: {
  packageId: DocsPackage
  locale: Locale
  page: string
}) => {
  const navigate = useNavigate()
  return (
    <Select
      aria-label="Choose package"
      value={packageId}
      onChange={key => {
        const id = getDocsPackage(String(key))
        const target =
          id &&
          getContentPage(packagesDocsRuntime.source, page, {
            locale,
            prefix: id
          })
        if (id && target !== undefined)
          void navigate({
            to: localizedUrl(i18n, locale, getPackageDocsPath(id, target))
          })
      }}>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover placement="bottom end">
        <ListBox aria-label="Packages">
          {getAvailableDocsPackages(locale).map(id => (
            <ListBox.Item key={id} id={id} textValue={docsPackages[id].name}>
              {docsPackages[id].name}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  )
}

export const PackageVersionSelector = ({
  packageId
}: {
  packageId: DocsPackage
}) => {
  const { version } = docsPackages[packageId]
  return (
    <Select aria-label="Package version" value={version}>
      <Select.Trigger>
        <Select.Value>v{version}</Select.Value>
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover placement="bottom start">
        <ListBox aria-label="Documented package versions">
          <ListBox.Item id={version} textValue={`v${version}`}>
            <Label>v{version}</Label>
            <Chip size="sm" variant="soft" color="accent">
              <Chip.Label>Latest</Chip.Label>
            </Chip>
            <ListBox.ItemIndicator />
          </ListBox.Item>
        </ListBox>
      </Select.Popover>
    </Select>
  )
}
