# Vezham Pro v3 documentation

Documentation and usage examples adapted from the authenticated HeroUI Pro MCP.
Every page links to its upstream source. Content uses the current internal
package aliases and shares the UI documentation layout and preview viewer.

The collection contains platform-independent `getting-started` and `components`
sections. Navigation order is defined by their `meta.json` files. The generated
`import-manifest.json` records the component pages and live demos.

The component gallery reuses the shared image tiles and the light/dark image
URLs from `https://heroui.pro/docs/react/components`. Its category labels,
image pairs, variant counts, and status badges are maintained in
`src/lib/docs/heroui-pro-presentation.json`. Refresh that data from the public
gallery when syncing upstream documentation; filenames are case-sensitive.

See `scripts/import-heroui-pro-docs.mjs` for snapshot import and
`src/demos/heroui-pro/README.md` for demo maintenance and license information.
