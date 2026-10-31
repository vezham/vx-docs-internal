import { useParams } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { useTheme } from '@vezham/docs-react/provider/base'
import { Chip, Link } from '@vezham/react-v3'

import { herouiCatalog } from '@src/lib/docs/heroui-catalog'
import {
  componentGalleryGroups,
  componentGalleryMedia
} from '@src/lib/docs/heroui-presentation'

type GalleryPage = (typeof herouiCatalog)[number]

const NativeGalleryVideo = ({ page }: { page: GalleryPage }) => {
  const { resolvedTheme } = useTheme()
  const video = useRef<HTMLVideoElement>(null)
  const name = page.url.split('/').slice(-1)[0]
  const videoName = componentGalleryMedia.nativeVideoNames[name] ?? name
  // vx-bot/NOTE: Both upstream dark ScrollShadow URLs return 403; its light recording remains available.
  const theme =
    resolvedTheme === 'dark' && name !== 'scroll-shadow' ? 'dark' : 'light'
  const src = `${componentGalleryMedia.nativeVideoBaseUrl}/${videoName}-docs-${theme}.mp4`

  useEffect(() => {
    const element = video.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry?.isIntersecting &&
          !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        )
          void element.play().catch(() => element.pause())
        else element.pause()
      },
      { threshold: 0.5 }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [src])

  return (
    <video
      ref={video}
      aria-label={`${page.title} preview`}
      src={src}
      className="aspect-video max-h-75 w-full rounded-xl border object-cover"
      controls
      loop
      muted
      playsInline
      preload="none"
    />
  )
}

export const ComponentTile = ({
  page,
  href
}: {
  page: GalleryPage
  href: string
}) => {
  const imageName = page.title.toLowerCase().split(' ')[0]
  const status = page.status
  const label = (
    <span className="flex items-center gap-2 text-sm">
      {page.title}
      {status && status !== 'new-dot' && (
        <Chip
          size="sm"
          variant={status === 'preview' ? 'tertiary' : 'soft'}
          className={`h-5 rounded-full px-1.5 text-[10px] ${status === 'new' ? 'bg-pink-400/8 font-semibold text-pink-400/90' : 'text-muted'}`}>
          <Chip.Label>
            {status === 'new'
              ? 'New'
              : status === 'preview'
                ? 'Preview'
                : 'Updated'}
          </Chip.Label>
        </Chip>
      )}
    </span>
  )
  const layout =
    'flex w-full min-w-0 flex-col items-stretch gap-[9px] text-foreground no-underline'

  if (page.platform === 'native')
    return (
      <div className={layout}>
        <Link
          href={href}
          className="text-foreground order-1 no-underline sm:order-2">
          {label}
        </Link>
        <div className="order-2 overflow-hidden rounded-xl sm:order-1">
          <NativeGalleryVideo page={page} />
        </div>
      </div>
    )

  return (
    <Link href={href} className={layout}>
      <span className="order-1 sm:order-2">{label}</span>
      <span className="relative order-2 block h-[198px] overflow-hidden rounded-xl border sm:order-1">
        <img
          src={`${componentGalleryMedia.imageBaseUrl}/light-${imageName}.png`}
          alt=""
          width={874}
          height={594}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover dark:hidden"
        />
        <img
          src={`${componentGalleryMedia.imageBaseUrl}/dark-${imageName}.png`}
          alt=""
          width={874}
          height={594}
          loading="lazy"
          className="absolute inset-0 hidden h-full w-full object-cover dark:block"
        />
      </span>
    </Link>
  )
}

const ComponentCategory = ({
  category,
  platform
}: {
  category: string
  platform: 'web' | 'native'
}) => {
  const { lang } = useParams({ strict: false })
  const group = componentGalleryGroups[platform].find(
    item => item.category === category
  )
  if (!group) return null
  const pages = group.components.flatMap(path => {
    const name = path.split('/').slice(-1)[0]
    return herouiCatalog.filter(
      page => page.url === `/docs-ui/${platform}/components/${name}`
    )
  })
  if (!pages.length) return null

  return (
    <ul
      aria-label={`${platform === 'web' ? 'Web' : 'Native'} ${category} components`}
      className={`not-prose my-6 grid list-none grid-cols-1 gap-x-4 gap-y-10 p-0 sm:grid-cols-2 ${platform === 'web' ? 'lg:grid-cols-3' : ''}`}>
      {pages.map(page => (
        <li key={page.url} className="min-w-0">
          <ComponentTile
            page={page}
            href={`${lang === 'cn' ? '/cn' : ''}${page.url}`}
          />
        </li>
      ))}
    </ul>
  )
}

export const ComponentsCategory = ({ category }: { category: string }) => (
  <ComponentCategory category={category} platform="web" />
)

export const NativeComponentsCategory = ({
  category
}: {
  category: string
}) => <ComponentCategory category={category} platform="native" />
