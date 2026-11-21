#!/usr/bin/env python3
"""
Kanri Website CI Quality Guardrails & Link Checker
Runs automatically during GitHub Actions deployment and local testing.
Exits 0 on success, 1 on any violation.
"""

import os
import sys
import glob
import re
from html.parser import HTMLParser

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

BANNED_WORDS = [
    r'\bseamless\b',
    r'\brevolutionary\b',
    r'\bnext-generation\b',
    r'\bcutting-edge\b',
    r'\bsupercharge\b',
    r'\bgame-changing\b',
    r'\bsovereignty\b',
    r'\bairgap\b',
    r'Optimal Sovereignty',
    r'Absolute Airgap',
    r'Hardware TEE Sealed',
    r'Zero Manual Friction',
    r'Tactile Glanceability',
    r'Objective Evaluation',
    r'60 FPS vector simulation',
    r'real-time settlement engine',
    r'Dynamic Analytics HUD',
    r'GPU-accelerated canvas routines',
    r'Split Bill Motion Loop',
    r'Dual Fusion',
    r'On-Device Phase'
]

# Files exempt from banned word checks (historical logs, migration notes, tests)
BANNED_EXEMPT_FILES = {
    'CLEANUP_LOG.md',
    'CHANGES.md',
    'SUGGESTIONS.md',
    'NEEDS_CONFIRMATION.md',
    'REFERENCE_MAP.md',
    'PLAN.md',
    'plan.md',
    'hero-showcase.html',
    'validate_site.py'
}

class LinkAltH1Parser(HTMLParser):
    def __init__(self, file_path):
        super().__init__()
        self.file_path = file_path
        self.h1_count = 0
        self.links = []
        self.missing_alts = []
        self.external_resources = []
        self.in_script = False

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        if tag == 'h1':
            self.h1_count += 1
        elif tag == 'img':
            if 'alt' not in attr_dict:
                self.missing_alts.append(attr_dict.get('src', '<no src>'))
        elif tag == 'a':
            href = attr_dict.get('href')
            if href:
                self.links.append(href)
        elif tag == 'link':
            rel = attr_dict.get('rel', '')
            href = attr_dict.get('href', '')
            if 'stylesheet' in rel or 'preload' in rel or 'icon' in rel:
                if href.startswith('http://') or href.startswith('https://'):
                    self.external_resources.append(f"<link href='{href}'>")
        elif tag == 'script':
            src = attr_dict.get('src', '')
            if src.startswith('http://') or src.startswith('https://'):
                self.external_resources.append(f"<script src='{src}'>")

def check_file_exists(base_file, target_link):
    # Strip query parameters or hash
    clean_target = target_link.split('?')[0].split('#')[0]
    if not clean_target:
        return True # anchor-only link on same page

    # Handle github.io or getkanri base prefix if present in link
    if clean_target.startswith('https://omkarnub.github.io/kanri-web/'):
        rel_path = clean_target.replace('https://omkarnub.github.io/kanri-web/', '')
        abs_target = os.path.join(ROOT_DIR, rel_path)
    elif clean_target.startswith('https://getkanri.vercel.app/'):
        rel_path = clean_target.replace('https://getkanri.vercel.app/', '')
        abs_target = os.path.join(ROOT_DIR, rel_path)
    elif clean_target.startswith('/kanri-web/'):
        rel_path = clean_target.replace('/kanri-web/', '')
        abs_target = os.path.join(ROOT_DIR, rel_path)
    elif clean_target.startswith('/'):
        abs_target = os.path.join(ROOT_DIR, clean_target.lstrip('/'))
    else:
        abs_target = os.path.normpath(os.path.join(os.path.dirname(base_file), clean_target))

    if os.path.isfile(abs_target):
        return True
    if os.path.isdir(abs_target):
        if os.path.isfile(os.path.join(abs_target, 'index.html')):
            return True
    # Try appending index.html if trailing slash
    if clean_target.endswith('/') and os.path.isfile(os.path.join(abs_target, 'index.html')):
        return True
    return False

def main():
    errors = []
    print("=== Kanri CI Site Quality & Integrity Guardrails ===")
    
    html_files = [
        f for f in glob.glob(os.path.join(ROOT_DIR, '**', '*.html'), recursive=True)
        if 'screenshots' not in f and 'backdrops' not in f and 'scratch' not in f
    ]

    # 1. HTML Validation: Single H1, Image Alt attributes, Internal Link resolution, Zero external CDNs
    print(f"\n[1/5] Auditing {len(html_files)} HTML pages...")
    for f in html_files:
        rel_f = os.path.relpath(f, ROOT_DIR).replace('\\', '/')
        if rel_f == 'hero-showcase.html':
            continue

        with open(f, 'r', encoding='utf-8') as fp:
            content = fp.read()

        parser = LinkAltH1Parser(f)
        try:
            parser.feed(content)
        except Exception as e:
            errors.append(f"{rel_f}: HTML parse error: {e}")
            continue

        # Check H1 count
        if parser.h1_count != 1:
            errors.append(f"{rel_f}: Expected exactly 1 <h1>, found {parser.h1_count}")

        # Check missing alts
        if parser.missing_alts:
            errors.append(f"{rel_f}: Found {len(parser.missing_alts)} <img> tags without alt attribute: {parser.missing_alts}")

        # Check external CDNs
        if parser.external_resources:
            errors.append(f"{rel_f}: External third-party resources detected: {parser.external_resources}")

        # Check internal links
        for link in parser.links:
            if link.startswith(('http://', 'https://', 'mailto:', 'tel:', 'javascript:')):
                if not link.startswith(('https://omkarnub.github.io/kanri-web/', 'https://getkanri.vercel.app/')):
                    continue
            if link.startswith('#'):
                continue
            if not check_file_exists(f, link):
                errors.append(f"{rel_f}: Broken internal link -> '{link}'")

    # 2. Image Size Budgets
    print("\n[2/5] Checking asset size budgets (<300 KB for web assets)...")
    image_files = glob.glob(os.path.join(ROOT_DIR, 'assets', 'images', '**', '*.*'), recursive=True)
    for img in image_files:
        rel_img = os.path.relpath(img, ROOT_DIR).replace('\\', '/')
        # Raw press archive PNGs are retained for media download
        if 'screenshots' in rel_img and rel_img.endswith('.png'):
            continue
        size_kb = os.path.getsize(img) / 1024
        if size_kb > 300:
            errors.append(f"Image budget exceeded: {rel_img} is {size_kb:.1f} KB (max: 300 KB)")

    # 3. AI Slop & Banned Buzzwords
    print("\n[3/5] Scanning for AI slop and banned buzzwords...")
    text_files = [
        f for f in glob.glob(os.path.join(ROOT_DIR, '**', '*.*'), recursive=True)
        if any(f.endswith(ext) for ext in ['.html', '.md', '.txt'])
        and 'screenshots' not in f
        and 'scratch' not in f
        and 'node_modules' not in f
        and '.git' not in f
    ]

    for f in text_files:
        fname = os.path.basename(f)
        if fname in BANNED_EXEMPT_FILES:
            continue
        rel_f = os.path.relpath(f, ROOT_DIR).replace('\\', '/')
        with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
            c = fp.read()
        for pat in BANNED_WORDS:
            matches = re.findall(pat, c, re.IGNORECASE)
            if matches:
                errors.append(f"Banned buzzword '{matches[0]}' found in {rel_f}")

    # 4. JSON-LD Schema Validation
    print("\n[4/5] Validating JSON-LD schemas...")
    import json
    for f in html_files:
        rel_f = os.path.relpath(f, ROOT_DIR).replace('\\', '/')
        with open(f, 'r', encoding='utf-8') as fp:
            c = fp.read()
        schemas = re.findall(r'<script\s+type=["\']application/ld\+json["\']>(.*?)</script>', c, re.DOTALL)
        for s in schemas:
            try:
                json.loads(s.strip())
            except Exception as e:
                errors.append(f"{rel_f}: Invalid JSON-LD schema: {e}")

    # 5. Summary & Exit
    print("\n[5/5] Verification Results:")
    if errors:
        print(f"FAILED: Found {len(errors)} quality guardrail violations:\n")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print("PASSED: All CI quality guardrails passed with zero errors!")
        sys.exit(0)

if __name__ == '__main__':
    main()
