# Developers

Internal docs for libraries, guides, and handbooks.

UI library documentation uses the notebook layout:

- `/docs-ui/web/getting-started` — HeroUI React
- `/docs-ui/native/getting-started` — HeroUI Native
- `/cn/docs-ui/web/getting-started` and `/cn/docs-ui/native/getting-started`
  retain the locale routes and currently fall back to English.

The imported content lives in `content/platform-docs/{web,native}`. It includes
Getting Started, Components, Releases, and Web Migration. Web examples contain
the upstream example source and links to live HeroUI previews. Images and native
videos use upstream media URLs. Search, Markdown endpoints, and LLM exports
include these collections.

See [content provenance and refresh instructions](content/platform-docs/README.md).

Validation:

```sh
pnpm nx run developers:lint
pnpm nx run developers:typecheck
pnpm nx run developers:test --run
pnpm nx run developers:build
```

`developers-e2e` contains the Playwright suite.
