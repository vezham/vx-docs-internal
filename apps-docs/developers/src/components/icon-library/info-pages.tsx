import { useState } from 'react'

import { Markdown } from '@vezham/react-pro-v3/markdown'
import { Accordion, Card, Link, SearchField } from '@vezham/react-v3'

import { i18n } from '@app/docs'
import type { Locale } from '@generated/vx'
import { assetUrl } from '@src/lib/icon-library/catalog'
import content from '@src/lib/icon-library/content.json'

import { AssetShell } from './shell'

export const IconPackages = ({ locale }: { locale: Locale }) => {
  const prefix = locale === i18n.defaultLanguage ? '' : '/' + locale
  return (
    <AssetShell active="packages" locale={locale}>
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Packages and tools
        </h1>
        <p className="text-muted">
          Use the same library in your app, editor, and design workflow.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {content.packages.map(item => (
          <Card key={item.id} className="min-w-0">
            <Card.Header className="flex-row items-center gap-3">
              <img
                src={assetUrl('logos', { slug: item.logo, variants: {} })}
                alt=""
                width={24}
                height={24}
                loading="lazy"
                className={`size-6 shrink-0 rounded-none object-contain ${item.id === 'mcp' ? 'dark:invert' : ''}`}
              />
              <Card.Title className="min-w-0 break-words">
                {item.name}
              </Card.Title>
            </Card.Header>
            <Card.Content className="gap-4">
              <Card.Description>{item.description}</Card.Description>
              {item.id !== 'figma' && item.id !== 'vscode' && (
                <code className="mt-auto text-sm break-all">
                  {item.id === 'flutter'
                    ? 'flutter pub add vezham_icons'
                    : `pnpm add ${item.name}`}
                </code>
              )}
            </Card.Content>
            <Card.Footer className="flex-wrap gap-4">
              <Link href={`${prefix}${item.guideUrl}`}>Guide</Link>
              <Link
                href={item.npmUrl}
                target="_blank"
                rel="noopener noreferrer">
                {item.id === 'figma'
                  ? 'Figma'
                  : item.id === 'vscode'
                    ? 'Marketplace'
                    : item.id === 'flutter'
                      ? 'pub.dev'
                      : 'npm'}
                <Link.Icon />
              </Link>
              <Link
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer">
                Source
                <Link.Icon />
              </Link>
            </Card.Footer>
          </Card>
        ))}
        <Card className="min-w-0">
          <Card.Header className="flex-row items-center gap-3">
            <img
              src={assetUrl('logos', { slug: 'svg', variants: {} })}
              alt=""
              width={24}
              height={24}
              loading="lazy"
              className="size-6 shrink-0 rounded-none object-contain"
            />
            <Card.Title className="min-w-0 break-words">
              Raw SVG assets
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <Card.Description>
              Use vector files directly without a JavaScript framework or build
              step.
            </Card.Description>
          </Card.Content>
          <Card.Footer className="flex-wrap gap-4">
            <Link href={`${prefix}/docs/svg`}>SVG guide</Link>
            <Link
              href="/icon-catalog/vezham-icons.zip"
              target="_blank"
              rel="noopener noreferrer">
              Icon archive
              <Link.Icon />
            </Link>
          </Card.Footer>
        </Card>
      </div>
    </AssetShell>
  )
}

export const IconFaq = ({ locale }: { locale: Locale }) => {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const groups = content.faq
    .map(group => ({
      ...group,
      items: group.items.filter(item =>
        `${item.question} ${item.answer}`.toLowerCase().includes(q)
      )
    }))
    .filter(group => group.items.length)
  return (
    <AssetShell active="faq" locale={locale}>
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Frequently asked questions
        </h1>
        <p className="text-muted">
          A few useful answers before you get started.
        </p>
      </header>
      <SearchField
        aria-label="Search questions"
        value={query}
        onChange={setQuery}
        className="max-w-xl">
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Search a question…" />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>
      <div className="max-w-3xl space-y-10">
        {groups.map(group => (
          <section key={group.id} className="space-y-3">
            <h2 className="text-xl font-semibold">{group.title}</h2>
            <Accordion allowsMultipleExpanded>
              {group.items.map(item => (
                <Accordion.Item key={item.id} id={item.id}>
                  <Accordion.Heading>
                    <Accordion.Trigger>
                      {item.question}
                      <Accordion.Indicator />
                    </Accordion.Trigger>
                  </Accordion.Heading>
                  <Accordion.Panel>
                    <Accordion.Body>
                      <Markdown>{item.answer}</Markdown>
                    </Accordion.Body>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </section>
        ))}
        {!groups.length && (
          <p className="text-muted py-12">
            No questions match your search. Try a different word.
          </p>
        )}
      </div>
    </AssetShell>
  )
}
