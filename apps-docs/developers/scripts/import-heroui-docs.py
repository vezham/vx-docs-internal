"""Import the Apache-2.0 HeroUI docs, adapting Next.js-only presentation."""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

upstream = Path(sys.argv[1]).resolve()
app = Path(__file__).resolve().parents[1]
output = app / 'content/platform-docs'
registries = {}
for locale in ('en',):
    registry = (upstream / f'src/demos/{locale}/index.ts').read_text()
    registries[locale] = dict(re.findall(r'"([\w-]+)":\s*\{.*?file: "([^"]+)"', registry, re.S))


def rewrite_links(text, locale):
    prefix = '/cn' if locale == 'cn' else ''
    text = re.sub(r'/(?:cn/)?docs/(react|native)(?=[/\s)"#]|$)',
                  lambda m: f'{prefix}/docs-ui/{"web" if m[1] == "react" else "native"}', text)
    # vx-bot/NOTE: These pages belong to the upstream marketing site.
    text = re.sub(r'(?<=[("\'])/(showcase|blog|themes|figma|docs)(?=[/\s)"#])',
                  r'https://heroui.com/\1', text)
    text = text.replace('/docs-ui/native/components/radio)', '/docs-ui/native/components/radio-group#radio)')
    text = text.replace('/docs-ui/native/releases/create-heroui-native-app', '/docs-ui/native/releases/cli-v1-0-0')
    text = text.replace('/docs-ui/native/hooks/use-theme-color', '/docs-ui/native/getting-started/theming')
    text = text.replace('/docs-ui/native/components/typography', '/docs-ui/native/components/text')
    text = re.sub(r'(?<=[("\'])/(react|native)/(DESIGN\.md|llms[\w-]*\.txt)', r'https://heroui.com/\1/\2', text)
    text = re.sub(r'(?<=[("\'])/(llms-(?:components|patterns)\.txt)', r'https://heroui.com/\1', text)
    for component in ('label', 'description', 'field-error'):
        text = text.replace(f'../{component}/{component}.md', f'/docs-ui/native/components/{component}')
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
            if source.suffix == '.mdx':
                # vx-bot/NOTE: Preserve prose/code; replace previews with their actual source.
                def preview(match):
                    name = re.search(r'name="([^"]+)"', match[0])[1]
                    file = registries[locale].get(name) or registries['en'].get(name)
                    slug = '/'.join(p for p in source.relative_to(root).with_suffix('').parts if not p.startswith('('))
                    if slug.endswith('/index'):
                        slug = slug[:-6]
                    live = f'https://heroui.com/docs/{source_platform}/{slug}'
                    if file:
                        code = (upstream / 'src/demos' / file).read_text().strip()
                        return f'\n[Live example: {name}]({live})\n\n```tsx\n{code}\n```\n'
                    missing.add(name)
                    return f'\n[Live example: {name}]({live})\n'
                # vx-bot/NOTE: Only transform prose segments, never fenced examples.
                parts = re.split(r'(^[ \t]*`{3,}[^\n]*\n.*?^[ \t]*`{3,}[ \t]*$)', text, flags=re.M | re.S)
                for index in range(0, len(parts), 2):
                    part = parts[index]
                    part = re.sub(r'<ComponentPreview\b.*?/>', preview, part, flags=re.S)
                    part = re.sub(r'^import .*?;\s*$', '', part, flags=re.M)
                    parts[index] = part
                text = ''.join(parts)
                count += 1
            target.write_text(text)
        # vx-bot/NOTE: The collection root is already selected by the platform switcher.
        meta = output / platform / ('meta.json' if locale == 'en' else f'meta.{locale}.json')
        data = json.loads(meta.read_text())
        data['pages'] = [p for p in data['pages'] if not p.startswith('[')]
        meta.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

shutil.copyfile(upstream.parents[1] / 'LICENSE', output / 'LICENSE-HeroUI')
revision = subprocess.check_output(['git', '-C', str(upstream), 'rev-parse', 'HEAD'], text=True).strip()
(output / 'README.md').write_text(f'''# HeroUI documentation\n\nCopied from `heroui-inc/heroui`, `apps/docs/content/docs`, revision `{revision}`.\nCopyright 2025 NextUI Inc. Licensed under Apache-2.0; see LICENSE-HeroUI.\n\nLocal adaptations: React → web routes under `/docs-ui`, English content (Chinese routes fall back to English),\nportable MDX presentation, and component previews expanded into their source code.\nLive interactive examples remain linked to HeroUI. Native videos use upstream media.\nPackage names inside upstream examples are intentionally preserved.\n\nRefresh from a checkout:\n\n```sh\npython3 apps-docs/developers/scripts/import-heroui-docs.py /path/to/heroui/apps/docs\nnode apps-docs/developers/scripts/adapt-heroui-mdx.mjs\n```\n''')
print(f'Imported {count} pages; examples without source: {sorted(missing)}')

catalog = []
for platform in ('web', 'native'):
    for page in sorted((output / platform / 'components').rglob('*.mdx')):
        relative = page.relative_to(output / platform)
        if page.stem == 'index':
            continue
        text = page.read_text().split('---', 2)[1]
        fields = dict(re.findall(r'^(title|description): (.*)$', text, re.M))
        catalog.append({
            'platform': platform,
            'category': next((part[1:-1] for part in relative.parts if part.startswith('(')), ''),
            'title': fields.get('title', page.stem).strip('"\''),
            'description': fields.get('description', '').strip('"\''),
            'url': '/docs-ui/' + platform + '/' + '/'.join(part for part in relative.with_suffix('').parts if not part.startswith('('))
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
