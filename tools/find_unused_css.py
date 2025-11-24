import re
import os
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS_BUNDLE = ROOT / 'CSS' / 'style.bundle.css'

css_class_re = re.compile(r"\.([a-zA-Z0-9_-]+)\b")
css_id_re = re.compile(r"#([a-zA-Z0-9_-]+)\b")
sel_block_re = re.compile(r'([^{}]+)\{')
html_class_attr_re = re.compile(r'class\s*=\s*[\"\']([^\"\']+)[\"\']')
html_id_attr_re = re.compile(r'id\s*=\s*[\"\']([^\"\']+)[\"\']')
js_query_selector_re = re.compile(r"querySelector(All)?\s*\(\s*['\"]([#.])([a-zA-Z0-9_-]+)['\"]\s*\)")
js_classlist_re = re.compile(r"classList\.(?:add|remove|toggle)\s*\(\s*['\"]([a-zA-Z0-9_-]+)['\"]\s*\)")
js_get_by_id_re = re.compile(r"getElementById\s*\(\s*['\"]([a-zA-Z0-9_-]+)['\"]\s*\)")
js_get_by_class_re = re.compile(r"getElementsByClassName\s*\(\s*['\"]([a-zA-Z0-9_-]+)['\"]\s*\)")


def read_file_safe(path):
    try:
        return path.read_text(encoding='utf-8')
    except Exception:
        try:
            return path.read_text(encoding='latin-1')
        except Exception:
            return ''


def collect_css_selectors(css_path):
    text = read_file_safe(css_path)
    classes = set()
    ids = set()
    # find selector blocks (the part before '{') to avoid matching values in properties
    for sel in sel_block_re.findall(text):
        # sel may contain multiple selectors separated by commas
        for part in sel.split(','):
            part = part.strip()
            # collect only class/id names that appear in the selector (not in property values)
            classes.update(css_class_re.findall(part))
            ids.update(css_id_re.findall(part))
    return classes, ids


def collect_usage_from_html(root):
    used_classes = set()
    used_ids = set()
    for path in root.rglob('*.html'):
        text = read_file_safe(path)
        for m in html_class_attr_re.findall(text):
            for cls in m.split():
                used_classes.add(cls.strip())
        for m in html_id_attr_re.findall(text):
            used_ids.add(m.strip())
    return used_classes, used_ids


def collect_usage_from_js(root):
    used_classes = set()
    used_ids = set()
    for path in root.rglob('*.js'):
        text = read_file_safe(path)
        for m in js_classlist_re.findall(text):
            used_classes.add(m)
        for m in js_query_selector_re.findall(text):
            # m is tuple like ('All' or '', '.' or '#', 'name')
            prefix = m[1]
            name = m[2]
            if prefix == '.':
                used_classes.add(name)
            elif prefix == '#':
                used_ids.add(name)
        for m in js_get_by_id_re.findall(text):
            used_ids.add(m)
        for m in js_get_by_class_re.findall(text):
            used_classes.add(m)
    return used_classes, used_ids


def main():
    if not CSS_BUNDLE.exists():
        print(f"CSS bundle not found at {CSS_BUNDLE}")
        return

    css_classes, css_ids = collect_css_selectors(CSS_BUNDLE)
    html_classes, html_ids = collect_usage_from_html(ROOT)
    js_classes, js_ids = collect_usage_from_js(ROOT)

    used_classes = html_classes.union(js_classes)
    used_ids = html_ids.union(js_ids)

    unused_classes = sorted([c for c in css_classes if c not in used_classes])
    unused_ids = sorted([i for i in css_ids if i not in used_ids])

    report = {
        'css_bundle': str(CSS_BUNDLE),
        'total_css_classes': len(css_classes),
        'total_css_ids': len(css_ids),
        'used_classes_count': len(used_classes.intersection(css_classes)),
        'used_ids_count': len(used_ids.intersection(css_ids)),
        'unused_classes': unused_classes,
        'unused_ids': unused_ids
    }

    out_path = ROOT / 'CSS' / 'unused_selectors_report.json'
    out_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"Report written to {out_path}")
    print(f"{len(unused_classes)} unused classes, {len(unused_ids)} unused ids")


if __name__ == '__main__':
    main()
