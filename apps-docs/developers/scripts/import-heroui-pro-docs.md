# Vezham Pro v3 documentation

Documentation and usage examples adapted from the authenticated HeroUI Pro MCP.
Every page links to its upstream source. Content uses the current internal
package aliases and shares the UI documentation layout and preview viewer.

The collection contains separate `web` and `native` folders, each with independent
`getting-started` and `components` sections. Web retains its platformless URLs;
Native uses `/docs/ui/react-pro-v3/native/*`. Navigation order is defined by their `meta.json` files. The generated
`import-manifest.json` records the component pages and live demos.

The component gallery reuses the shared image tiles and the light/dark image
URLs from `https://heroui.pro/docs/react/components`. Its category labels,
image pairs, variant counts, and status badges are maintained in
`src/lib/docs/heroui-pro-presentation.json`. Refresh that data from the public
gallery when syncing upstream documentation; filenames are case-sensitive.

`import-heroui-native-pro-docs.mjs` imports the public Native markdown exports
from a snapshot containing `pages.json`, `gallery.json`, and the exported
`getting-started*.mdx` and `components/*.mdx` files. It preserves published
`heroui-native-pro` imports as reference code and uses the shared video player
for browser previews. Source-page links provide the upstream device preview and
licensed Figma downloads. Native media and page paths are stored in
`src/lib/docs/heroui-pro-native-presentation.json`.

See `scripts/import-heroui-pro-docs.mjs` for snapshot import and
`src/demos/heroui-pro/README.md` for demo maintenance and license information.
