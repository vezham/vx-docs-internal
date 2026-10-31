import { Link, buttonVariants } from '@vezham/react-v3'

import {
  type ComponentLinks as Links,
  getComponentResources
} from '@src/lib/docs/component-resources'

import {
  FigmaIcon,
  GithubIcon,
  RadixUIIcon,
  ReactAriaIcon,
  StorybookIcon,
  TailwindIcon
} from './icons'

const icons = {
  figma: FigmaIcon,
  github: GithubIcon,
  radix: RadixUIIcon,
  rac: ReactAriaIcon,
  storybook: StorybookIcon,
  tailwind: TailwindIcon
}

export const ComponentLinks = ({ links }: { links?: Links }) => {
  const resources = getComponentResources(links)
  if (!resources.length) return null
  return (
    <nav
      aria-label="Component resources"
      className="not-prose mb-4 flex flex-wrap gap-2">
      {resources.map(resource => {
        const Icon = icons[resource.icon]
        return (
          <Link
            key={resource.href}
            href={resource.href}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: 'tertiary',
              size: 'sm',
              className:
                'text-foreground h-8 gap-1.5 rounded-full px-3 text-sm font-normal no-underline'
            })}>
            <Icon
              aria-hidden="true"
              focusable="false"
              className={`size-4 shrink-0 ${resource.icon === 'storybook' ? 'text-[#ff4785]' : resource.icon === 'rac' ? 'text-[#6733ff]' : resource.icon === 'tailwind' ? 'text-[#38bdf8]' : ''}`}
            />
            {resource.label}
          </Link>
        )
      })}
    </nav>
  )
}
