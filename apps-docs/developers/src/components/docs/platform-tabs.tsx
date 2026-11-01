import { Link, useRouter } from '@tanstack/react-router'
import type { ComponentPropsWithoutRef } from 'react'

import { Globe, Smartphone } from '@vezham/icons-react'
import { Tabs } from '@vezham/react-v3'

import { platformIconVariants } from '@components/docs/navigation.variants'

type Platform = 'web' | 'native'

type Props = {
  getPlatformParams: (platform: Platform) => {
    _splat: string
    lang: string | undefined
    platform: Platform
  }
  platform: Platform
}

export const PlatformTabs = ({ getPlatformParams, platform }: Props) => {
  const router = useRouter()
  const getHref = (value: Platform) =>
    router.buildLocation({
      to: '/{-$lang}/docs/ui/$platform/$',
      params: getPlatformParams(value)
    }).href
  return (
    <Tabs selectedKey={platform} keyboardActivation="manual">
      <Tabs.ListContainer>
        <Tabs.List aria-label="Documentation platform">
          <Tabs.Tab
            id="web"
            href={getHref('web')}
            render={props => {
              const linkProps = {
                ...(props as ComponentPropsWithoutRef<'a'>)
              }
              delete linkProps.href
              return (
                <Link
                  {...linkProps}
                  to="/{-$lang}/docs/ui/$platform/$"
                  params={getPlatformParams('web')}
                />
              )
            }}>
            <Globe
              size={16}
              className={platformIconVariants({
                platform: 'web',
                selected: platform === 'web'
              })}
            />
            Web
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab
            id="native"
            href={getHref('native')}
            render={props => {
              const linkProps = {
                ...(props as ComponentPropsWithoutRef<'a'>)
              }
              delete linkProps.href
              return (
                <Link
                  {...linkProps}
                  to="/{-$lang}/docs/ui/$platform/$"
                  params={getPlatformParams('native')}
                />
              )
            }}>
            <Smartphone
              size={16}
              className={platformIconVariants({
                platform: 'native',
                selected: platform === 'native'
              })}
            />
            Native
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  )
}
