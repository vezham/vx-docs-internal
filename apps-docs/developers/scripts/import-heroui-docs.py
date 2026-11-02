"""Import the Apache-2.0 HeroUI docs, adapting Next.js-only presentation."""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

upstream = Path(sys.argv[1]).resolve()
app = Path(__file__).resolve().parents[1]
output = app / 'content/docs-ui'
registries = {}
for locale in ('en',):
    registry = (upstream / f'src/demos/{locale}/index.ts').read_text()
    registries[locale] = dict(re.findall(r'"([\w-]+)":\s*\{.*?file: "([^"]+)"', registry, re.S))


# vx-bot/NOTE: Keep executable demos local; the registry only imports a demo when displayed.
demo_output = app / 'src/demos/heroui'
demo_output.mkdir(parents=True, exist_ok=True)
for file in sorted(set(registries['en'].values())):
    source = upstream / 'src/demos' / file
    target = demo_output / Path(file).relative_to('en')
    target.parent.mkdir(parents=True, exist_ok=True)
    code = source.read_text().replace('@heroui/react', '@vezham/react-v3')
    code = code.replace('/docs/react/', '/docs/ui/react-v3/web/')
    if not re.search(r'\bReact[.<]', code):
        code = re.sub(r'^import React from "react";\n', '', code, flags=re.M)
        code = code.replace('import React, {', 'import {')
    code = code.replace('import Image from "next/image";', 'import type {ComponentProps} from "react";\n\nconst Image = (props: ComponentProps<"img">) => <img {...props} />;')
    code = code.replace('import Link from "next/link";', 'import type {ComponentProps} from "react";\n\nconst Link = (props: ComponentProps<"a">) => <a {...props} />;')
    code = '\n'.join(line.rstrip() for line in code.splitlines()).rstrip() + '\n'
    target.write_text('// vx-bot/INFO: Adapted HeroUI demo (Apache-2.0); see README.md and LICENSE.\n' + code)
registry = (upstream / 'src/demos/en/index.ts').read_text()
registry = registry.replace('import type {DemoItem} from "@/demos";', 'import type {ComponentType} from "react";\ntype DemoItem = {loader: () => Promise<ComponentType>; file: string};')
registry = registry.replace('file: "en/', 'file: "').replace('/format-options-no-ssr', '/format-options')
(demo_output / 'index.ts').write_text('// vx-bot/INFO: Generated from the HeroUI demo registry by scripts/import-heroui-docs.py.\n' + registry)
shutil.copyfile(upstream.parents[1] / 'LICENSE', demo_output / 'LICENSE')
(demo_output / 'README.md').write_text('# HeroUI demo sources\n\nAdapted from `heroui-inc/heroui`, `apps/docs/src/demos/en`. Copyright 2025 NextUI Inc.\nApache-2.0; see LICENSE. Regenerate with `scripts/import-heroui-docs.py`.\n\nLocal changes: Vezham package imports, local docs URLs, and native React replacements\nfor the two Next.js rendering examples. The sources retain upstream formatting and\nare excluded from application lint rules; TypeScript and the production build check them.\nImported sources preserve upstream formatting; app lint excludes this generated directory. Only English demos are imported. Chinese documentation routes reuse them.\n')

def css_block(text, marker):
    start = text.index(marker)
    opening = text.index('{', start)
    depth = 1
    end = opening + 1
    while depth:
        depth += (text[end] == '{') - (text[end] == '}')
        end += 1
    return text[start:end]

css = (upstream / 'src/app/global.css').read_text()
markers = ['@keyframes shine', '@keyframes custom-fade-in', '@keyframes custom-fade-out', '@utility animate-shine', '@utility gradient-border']
blocks = [css_block(css, marker) for marker in markers]
calendar = css.rfind('@layer components', 0, css.index('.range-calendar--custom-demo'))
blocks.append(css_block(css[calendar:], '@layer components'))
(demo_output / 'utilities.css').write_text('/* vx-bot/INFO: Imported HeroUI demo utilities; see README.md and LICENSE. */\n' + '\n\n'.join(blocks) + '\n')


def rewrite_links(text, locale):
    prefix = '/cn' if locale == 'cn' else ''
    text = re.sub(r'(?<=[("\'\s])/(?:cn/)?docs/(react|native)(?=[/\s)"#]|$)',
                  lambda m: f'{prefix}/docs/ui/react-v3/{"web" if m[1] == "react" else "native"}', text)
    # vx-bot/NOTE: These pages belong to the upstream marketing site.
    text = re.sub(r'(?<=[("\'])/(showcase|blog|themes|figma|docs)(?=[/\s)"#])',
                  r'https://heroui.com/\1', text)
    text = text.replace('/docs/ui/react-v3/native/components/radio)', '/docs/ui/react-v3/native/components/radio-group#radio)')
    text = text.replace('/docs/ui/react-v3/native/releases/create-heroui-native-app', '/docs/ui/react-v3/native/releases/cli-v1-0-0')
    text = text.replace('/docs/ui/react-v3/native/hooks/use-theme-color', '/docs/ui/react-v3/native/getting-started/theming')
    text = text.replace('/docs/ui/react-v3/native/components/typography', '/docs/ui/react-v3/native/components/text')
    text = re.sub(r'(?<=[("\'])/(react|native)/(DESIGN\.md|llms[\w-]*\.txt)', r'https://heroui.com/\1/\2', text)
    text = re.sub(r'(?<=[("\'])/(llms-(?:components|patterns)\.txt)', r'https://heroui.com/\1', text)
    for component in ('label', 'description', 'field-error'):
        text = text.replace(f'../{component}/{component}.md', f'/docs/ui/react-v3/native/components/{component}')
    return text


count = 0
missing = set()
for locale in ('en',):
    for source_platform, platform in (('react', 'web'), ('native', 'native')):
        root = upstream / f'content/docs/{locale}/{source_platform}'
        for source in root.rglob('*'):
            if source.suffix not in ('.json', '.mdx'):
                continue
            relative = source.relative_to(root)
            if locale != 'en':
                relative = relative.with_name(f'{relative.stem}.{locale}{relative.suffix}')
            target = output / platform / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            text = rewrite_links(source.read_text(), locale)
            text = re.sub(r'^icon: (new|updated|preview|new-dot)[ \t]*$', r'status: \1', text, flags=re.M)
            if source.suffix == '.mdx':
                # vx-bot/NOTE: Preserve each preview and include the exact source of its local executable demo.
                def preview(match):
                    name = re.search(r'name="([^"]+)"', match[0])[1]
                    file = registries[locale].get(name) or registries['en'].get(name)
                    if file:
                        code = (demo_output / Path(file).relative_to('en')).read_text().split('\n', 1)[1].strip()
                        opening = re.sub(r'\s*/>$', '>', match[0])
                        return f'\n{opening}\n\n````tsx\n{code}\n````\n\n</ComponentPreview>\n'
                    raise ValueError(f'Missing local demo source: {name}')
                # vx-bot/NOTE: Only transform prose segments, never fenced examples.
                parts = re.split(r'(^[ \t]*`{3,}[^\n]*\n.*?^[ \t]*`{3,}[ \t]*$)', text, flags=re.M | re.S)
                for index in range(0, len(parts), 2):
                    part = parts[index]
                    part = re.sub(r'^import .*?;\s*$', '', part, flags=re.M)
                    part = re.sub(r'<ComponentPreview\b.*?/>', preview, part, flags=re.S)
                    parts[index] = part
                text = ''.join(parts)
                count += 1
            target.write_text('\n'.join(line.rstrip() for line in text.splitlines()).rstrip() + '\n')
        # vx-bot/NOTE: The collection root is already selected by the platform switcher.
        meta = output / platform / ('meta.json' if locale == 'en' else f'meta.{locale}.json')
        data = json.loads(meta.read_text())
        data['pages'] = [p for p in data['pages'] if not p.startswith('[')]
        meta.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

shutil.copyfile(upstream.parents[1] / 'LICENSE', output / 'LICENSE-HeroUI')
revision = subprocess.check_output(['git', '-C', str(upstream), 'rev-parse', 'HEAD'], text=True).strip()
(output / 'README.md').write_text(f'''# HeroUI documentation\n\nCopied from `heroui-inc/heroui`, `apps/docs/content/docs`, revision `{revision}`.\nCopyright 2025 NextUI Inc. Licensed under Apache-2.0; see LICENSE-HeroUI.\n\nLocal adaptations: React → web routes under `/docs/ui/react-v3`, English content (Chinese routes fall back to English),\nportable MDX presentation, and lazy-loaded local component previews with their source code.\nWeb examples run locally using src/demos/heroui; Next.js-only helpers are adapted to React. Native videos use upstream media.\nGuide prose retains upstream package names; executable demos use the Vezham package aliases.\n\nRefresh from a checkout:\n\n```sh\npython3 apps-docs/developers/scripts/import-heroui-docs.py /path/to/heroui/apps/docs\nnode apps-docs/developers/scripts/adapt-heroui-mdx.mjs\n```\n''')
print(f'Imported {count} pages; examples without source: {sorted(missing)}')

catalog = []
for platform in ('web', 'native'):
    for page in sorted((output / platform / 'components').rglob('*.mdx')):
        relative = page.relative_to(output / platform)
        if page.stem == 'index':
            continue
        text = page.read_text().split('---', 2)[1]
        fields = dict(re.findall(r'^(title|description|status): (.*)$', text, re.M))
        catalog.append({
            'platform': platform,
            'category': next((part[1:-1] for part in relative.parts if part.startswith('(')), ''),
            'title': fields.get('title', page.stem).strip('"\''),
            'description': fields.get('description', '').strip('"\''),
            'status': fields.get('status'),
            'url': '/docs/ui/react-v3/' + platform + '/' + '/'.join(part for part in relative.with_suffix('').parts if not part.startswith('('))
        })
(app / 'src/lib/docs/heroui-catalog.ts').write_text('// vx-bot/INFO: Generated by scripts/import-heroui-docs.py.\nexport const herouiCatalog = ' + json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')

platform_paths = {}
for platform in ('web', 'native'):
    paths = []
    for page in sorted((output / platform).rglob('*.mdx')):
        parts = [part for part in page.relative_to(output / platform).with_suffix('').parts if not part.startswith('(')]
        if parts[-1] == 'index':
            parts.pop()
        paths.append('/'.join(parts))
    platform_paths[platform] = paths
with (app / 'src/lib/docs/heroui-catalog.ts').open('a') as file:
    file.write('\nexport const platformPagePaths = ' + json.dumps(platform_paths, indent=2) + '\n')

subprocess.run(['node', str(app / 'scripts/import-heroui-presentation.mjs'), str(upstream)], check=True)
