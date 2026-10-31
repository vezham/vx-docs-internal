# HeroUI documentation

Copied from `heroui-inc/heroui`, `apps/docs/content/docs`, revision `b2c65a5b5236550526f23d475b1ad0c6e5eab1a2`.
Copyright 2025 NextUI Inc. Licensed under Apache-2.0; see LICENSE-HeroUI.

Local adaptations: React → web routes under `/docs-ui`, English content (Chinese routes fall back to English),
portable MDX presentation, and component previews expanded into their source code.
Live interactive examples remain linked to HeroUI. Native videos use upstream media.
Package names inside upstream examples are intentionally preserved.

Refresh from a checkout:

```sh
python3 apps-docs/developers/scripts/import-heroui-docs.py /path/to/heroui/apps/docs
node apps-docs/developers/scripts/adapt-heroui-mdx.mjs
```
