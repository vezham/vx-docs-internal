# UI documentation layout

Use `/docs/ui/react-v3/web/getting-started` as the layout baseline for all UI
libraries, including Pro and the in-house Vezham library. Reuse
`getPlatformLayoutOptions`, `PlatformNotebookHeader`, section tabs, and the
sidebar drawer components. Use `getting-started` for the introductory page.
Change this layout only when the user explicitly requests it.

Each library has its own sub-navigation and MDX content collection. Configure
its sections independently in `platform-sections.ts`; share layout components,
not section lists. Store placeholder content as TODO text in the library's
`getting-started/index.mdx`, rather than a dedicated TODO React page/component.
Show platform tabs only for registered MDX collections that contain pages.

Content collections:

- Vezham v3: `content/docs-ui/{web,native}`
- Vezham Pro v3: `content/docs-ui-pro-v3/{web,native}`
- In-house Vezham: `content/docs-ui-react`

Platforms are optional. Collections without platform folders use direct library
routes and no platform selector. Do not introduce a mandatory `web` folder.

Pro now has both platforms. Its existing platformless routes remain the canonical
Web URLs; `/docs/ui/react-pro-v3/web/*` redirects there. Native uses
`/docs/ui/react-pro-v3/native/*`. Keep platform switching and section links on the
selected library and fall back to its section index when a page is unavailable.
