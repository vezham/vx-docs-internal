# Icon library

Icons use the pinned `@vezham/icons@27.0.2` npm/jsDelivr runtime. Their metadata
and downloadable ZIP archive remain in `public/icon-catalog`.

Asset library pages live under `/docs/assets`: `icons`, `illustrations`,
`logos`, `packages`, `faq`, and framework `guides`. `/docs/assets` opens the icon
gallery; `/docs/assets/guides` opens the guide overview. All use the UI
documentation notebook shell, sharing its
header, section bar, and search. Catalogs, asset details, Packages, and FAQ use
the full-width notebook page without a desktop sidebar; their section links
remain available in the mobile drawer. Framework guides retain their MDX
sidebar and table of contents.

The shared docs styles in `packages/vx/styles/docs/index.css` center page content
by default, retaining the layout's width limits and responsive padding. Page
utilities can override this default: `mx-0` on a direct content block or
`[&>*]:mx-0` on the docs page restores start alignment. There is no
icon-library-specific alignment setting.

Galleries append 60 results at a time with **Load more**. The `page` search
parameter records the number of loaded batches, so returning from a detail page
or reopening a gallery URL restores that range. Filter changes reset the batch
count; preview size changes retain it. Gallery search updates replace the current
history entry without resetting scroll. The app router handles back-navigation
scroll restoration.

The CDN repository owns illustration and logo SVGs, catalogs and manifests:

| Collection    | Catalog                                   | SVGs                            |
| ------------- | ----------------------------------------- | ------------------------------- |
| Illustrations | `${V_ILLUSTRATIONS_CDN_URL}/catalog.json` | `/assets/{name}.svg`            |
| Logos         | `${V_LOGOS_CDN_URL}/catalog.json`         | `/assets/{brand}/{variant}.svg` |

Each CDN app stores `public/catalog.json`, `public/catalog-manifest.json`, and
`public/assets/` together. Its build validates every referenced file before
publishing. The docs app has no duplicate catalogs or SVG collection for them.
Search, previews, copy actions, downloads and embeds resolve through these CDNs.
Cross-origin GET access is required for catalog loading and SVG/raster exports.

## Environment configuration

The app's `.env` defines `V_ILLUSTRATIONS_CDN_URL` and `V_LOGOS_CDN_URL`.
Override them in `.env.local`, a mode-specific `.env` file, or the build
environment to select different CDN hosts. For example:

```dotenv
V_ILLUSTRATIONS_CDN_URL=http://localhost:4101
V_LOGOS_CDN_URL=http://localhost:4102
V_APP_VER=26.0.3
```

Vite reads these public URLs at build time. Restart the dev server or rebuild
the static app after changing them. Catalog requests, previews, SVG source,
downloads, and embed links all use the selected origin, including when a logo
catalog contains absolute URLs for a different environment. Trailing slashes
are accepted. `APP_VER` from `@vezham/env/vite` reads the existing `V_APP_VER`
and adds it as `?vx=26.0.3` to both CDN catalog and SVG URLs, including logos in
docs, preview images, downloads, Open SVG, and embed snippets. The app version
controls cache busting; there are no separate CDN version settings. Icon npm URLs
keep their pinned package version. Nx includes both CDN origins and `V_APP_VER`
in the build cache key.

## Refreshing the icon catalog

Build the core package from the root of the [Vezham assets workspace](https://github.com/vezham/vx-fe-assets-pkgs):

```sh
pnpm nx build icons
```

Then run the catalog refresh from the docs workspace:

```sh
node apps-docs/developers/scripts/import-icon-library.mjs /path/to/vx-fe-assets-pkgs
```

The refresh reads SVG metadata from `packages/icons-data/` and icon names from
the built package. It updates
`public/icon-catalog/icons.json` and the manifest's icon count, preserving local
search keywords. The source package version must match the icon catalog
manifest and the pinned browser runtime. Update the runtime and examples
together when switching the docs to a new published version. The guides, FAQ,
and downloadable SVG archive are maintained in this repository.

Run asset sync and validation in the CDN repository:

```sh
node vx/tools/cdn/sync-assets.mjs illustrations
node vx/tools/cdn/sync-assets.mjs logos
pnpm nx run-many -p illustrations-cdn logos-cdn -t catalog:validate
```

Framework guides remain in `content/docs-assets`. Their routes, search index
and markdown exports share the existing documentation runtime. Raster exports
preserve aspect ratio inside the chosen square; embed snippets use absolute
URLs. CDN origins come from the app environment.

Set `logo: javascript` (or another logo catalog slug) in a guide's frontmatter
to display a plain 24px logo beside its page title.

Use `<InstallTabs packages="@vezham/icons" />` for package installation commands.
The shared `components/docs/install-tabs.tsx` component provides npm, pnpm, Yarn,
and Bun tabs with CDN logos and clipboard support. Pass several packages as a
space-separated string or array, and add `dev` for development dependencies.
Icon guides receive it through their MDX component map; other guides can import
it from `@components/docs/install-tabs`.

Detail pages provide HeroUI color pickers for primary and duotone colors,
export sizes from 16px, integration tabs with framework logos, and prop
references. Icon examples include JavaScript, CDN, SVG URLs, React, React
Native, Vue, Svelte, Flutter, direct imports, and generated SVG source.
Logo and illustration examples use HTML, React, Vue, CSS, and original SVG source.

The optional Grid switch adds a faint preview background for alignment checks.
It starts off, resets with Reset preview, and never appears in SVG source or
downloaded files.

Illustration detail pages extract editable palette colors from SVG fills,
strokes, gradient stops, and paint styles. Edits apply to the preview, SVG
source, clipboard, and SVG/PNG/WebP downloads while preserving geometry and
opacity. Reset colors restores the original file. Customized embed examples
reference the downloaded SVG; Open SVG continues to open the original CDN file.
