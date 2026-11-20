---
name: vezham-icon-integration
description: Find Vezham icons and add them to React, React Native, Vue, Svelte, HTML, or SVG projects.
---

# Integrate Vezham Icons

Use `search_icons` to find an icon and check which weights it offers. Use `apply_icon` with the matching name, weight, and framework to get the import and markup. Call `view_icon` when the task needs the SVG source.

Use the local CLI if the MCP server is unavailable.

```sh
npx -y @vezham/icons-mcp search home
npx -y @vezham/icons-mcp apply home --framework react --weight outline
```

For JavaScript or framework components, use the package's direct icon import, such as `@vezham/icons/Home` or `@vezham/icons-react/Home`. For plain HTML, use the `<vx-icon>` CDN component or request an SVG snippet from `apply_icon`.

See the [icon gallery](https://oss.vezham.com/docs/assets/icons) and the [MCP guide](https://oss.vezham.com/docs/assets/guides/mcp).
