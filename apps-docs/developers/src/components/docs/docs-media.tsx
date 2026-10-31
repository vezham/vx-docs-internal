import { useParams } from '@tanstack/react-router'
import type { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

import { useTheme } from '@vezham/docs-react/provider/base'
import { Link } from '@vezham/react-v3'

type ImageProps = ComponentProps<'img'> & {
  darkSrc?: string
  href?: string
  wrapperClassName?: string
  priority?: boolean
}

export const DocsImage = ({
  darkSrc,
  href,
  wrapperClassName,
  priority,
  src,
  alt,
  className,
  ...props
}: ImageProps) => {
  const images = (
    <>
      <img
        {...props}
        src={src}
        alt={alt ?? ''}
        loading={priority ? 'eager' : 'lazy'}
        className={twMerge(
          'absolute inset-0 m-0 h-full w-full',
          darkSrc ? 'object-cover dark:hidden' : 'object-contain',
          className
        )}
      />
      {darkSrc && (
        <img
          {...props}
          src={darkSrc}
          alt={alt ?? ''}
          loading={priority ? 'eager' : 'lazy'}
          className={twMerge(
            'absolute inset-0 m-0 hidden h-full w-full object-cover dark:block',
            className
          )}
        />
      )}
    </>
  )
  const wrapper = twMerge(
    'not-prose relative my-6 block aspect-[2/1] w-full overflow-hidden rounded-xl border',
    wrapperClassName
  )
  return href ? (
    <Link href={href} className={wrapper}>
      {images}
    </Link>
  ) : (
    <div className={wrapper}>{images}</div>
  )
}

type VideoProps = Omit<ComponentProps<'video'>, 'height'> & {
  srcLight?: string
  srcDark?: string
  height?: number
  playMode?: 'manual' | 'auto'
}

export const VideoPlayer = ({
  src,
  srcLight,
  srcDark,
  height,
  muted = true,
  playMode = 'manual',
  className,
  ...props
}: VideoProps) => {
  const { resolvedTheme } = useTheme()
  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption -- Upstream UI demo recordings do not provide caption tracks.
    <video
      {...props}
      aria-label={props['aria-label'] ?? 'HeroUI component demonstration'}
      src={
        resolvedTheme === 'dark'
          ? (srcDark ?? src ?? srcLight)
          : (src ?? srcLight ?? srcDark)
      }
      style={{ maxHeight: height ?? 480, ...props.style }}
      className={`my-6 w-full rounded-xl ${className ?? ''}`}
      controls
      playsInline
      autoPlay={playMode === 'auto'}
      muted={muted}
      preload="none"
    />
  )
}

const nativeAppUrl = (slug = '') =>
  `https://heroui.com/docs/native-showcase/components/${slug}`

export const NativeVideoPlayerView = ({
  target,
  slug,
  ...props
}: VideoProps & { target?: 'home' | 'component' | 'auto'; slug?: string }) => {
  const { _splat } = useParams({ strict: false })
  const component =
    target === 'home'
      ? ''
      : (slug ??
        (_splat?.startsWith('components/')
          ? _splat.split('/').slice(-1)[0]
          : ''))
  return (
    <div className="not-prose my-6">
      <Link
        href={nativeAppUrl(component)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm">
        Open in HeroUI Native
      </Link>
      <VideoPlayer {...props} />
    </div>
  )
}

export const NativeImageHeroView = () => (
  <>
    <Link href={nativeAppUrl()} target="_blank" rel="noopener noreferrer">
      Open in HeroUI Native
    </Link>
    <DocsImage
      src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/heroui-native-og-light-1.webp"
      darkSrc="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/heroui-native-og-dark-1.webp"
      alt="HeroUI Native Introduction"
    />
  </>
)

export const NativeTryOnDevice = () => (
  <div className="not-prose my-6 flex flex-wrap gap-4 rounded-xl border p-6">
    <Link href={nativeAppUrl()} target="_blank" rel="noopener noreferrer">
      Open in HeroUI Native
    </Link>
    <Link
      href="https://apps.apple.com/app/id6757860059"
      target="_blank"
      rel="noopener noreferrer">
      Download on the App Store
    </Link>
    <Link
      href="https://play.google.com/store/apps/details?id=com.herouinative.android"
      target="_blank"
      rel="noopener noreferrer">
      Get it on Google Play
    </Link>
  </div>
)
