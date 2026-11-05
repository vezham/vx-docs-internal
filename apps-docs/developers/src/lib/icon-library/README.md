# Icon library

Icons use the pinned `@vezham/icons@1.0.7` npm/jsDelivr runtime. Their metadata
and downloadable ZIP archive remain in `public/icon-catalog`.

All icon-library routes use the UI documentation notebook shell, sharing its
header, section bar, and search. Catalogs, asset details, Packages, and FAQ use
the full-width notebook page without a desktop sidebar; their section links
remain available in the mobile drawer. Framework guides retain their MDX
sidebar and table of contents.

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
```

Vite reads these public URLs at build time. Restart the dev server or rebuild
the static app after changing them. Catalog requests, previews, SVG source,
downloads, and embed links all use the selected origin, including when a logo
catalog contains absolute URLs for a different environment. Trailing slashes
are accepted. Nx also includes both environment overrides in the build cache key.

## Importing the original collection

```sh
node apps-docs/developers/scripts/import-icon-library.mjs /path/to/reicon /path/to/vx-fe-apps-cdns
```

This imports icon metadata and framework guides into this app, and writes
illustration/logo catalogs and manifests into the matching CDN apps. Icon
names and supported weights are extracted from the pinned npm runtime.
The import script reads the same app environment files using Vite's loader;
`NODE_ENV` selects the mode (default: `development`). Shell overrides take
precedence. Generated logo variant URLs use `V_LOGOS_CDN_URL`.

Run asset sync and validation in the CDN repository:

```sh
node vx/tools/cdn/sync-assets.mjs illustrations
node vx/tools/cdn/sync-assets.mjs logos
pnpm nx run-many -p illustrations-cdn logos-cdn -t catalog:validate
```

Framework guides remain in `content/docs-icons`. Their routes, search index
and markdown exports share the existing documentation runtime. Raster exports
preserve aspect ratio inside the chosen square; embed snippets use absolute
URLs. CDN origins come from the app environment.

Detail pages provide HeroUI color pickers for primary and duotone colors,
export sizes from 16px, integration tabs with framework logos, and prop
references. Icon examples include JavaScript, CDN, SVG URLs, React, React
Native, Vue, Svelte, Flutter, direct imports, and generated SVG source.
Logo and illustration examples use HTML, React, CSS, and original SVG source.
