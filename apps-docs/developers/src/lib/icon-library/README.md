# Icon library

The asset browser uses the pinned `@vezham/icons@1.0.7` web component, loaded
only when an icon catalog or detail page needs it. The CDN script is shared
across client navigation, with a retryable load failure. SVG and raster icon
exports are created locally from that runtime.

`public/icon-catalog` contains compact metadata and the original downloadable icon ZIP archive. Individual SVG files are rendered by the CDN runtime. The
illustration and logo previews use the original `cdn.reicon.dev` asset URLs.
Those two catalogs offer original SVG links and embed snippets; their CDN does
not currently provide browser CORS access for raw/raster exports.

The initial data and integration guides come from the existing Reicon app.
Regenerate them with:

```sh
node apps-docs/developers/scripts/import-icon-library.mjs /path/to/reicon
```

The importer reads the local Reicon metadata and markdown, and downloads the
pinned CDN runtime to obtain its exact icon names, categories and supported
weights. The framework guides are stored in `content/docs-icons`. Their routes,
search index and markdown exports share the existing documentation runtime.
