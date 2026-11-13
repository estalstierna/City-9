#!/usr/bin/env python3
"""Set the service worker's cache VERSION to a hash of the files it caches.

    python3 tools/bump-sw.py          # update sw.js
    python3 tools/bump-sw.py --check  # exit 1 if sw.js is stale (used by the test suite)

When VERSION changes, installed copies of the game fetch the new code and reload once."""
import hashlib
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SW = os.path.join(ROOT, 'sw.js')
src = open(SW, encoding='utf8').read()
shell = re.search(r'const SHELL = \[(.*?)\];', src, re.S).group(1)
files = [f[2:] for f in re.findall(r"'(\./[^']+)'", shell) if f not in ('./',)]
h = hashlib.sha256()
for f in sorted(files):
    p = os.path.join(ROOT, f)
    h.update(f.encode())
    h.update(open(p, 'rb').read())
want = 'c9-' + h.hexdigest()[:10]
have = re.search(r"const VERSION = '([^']+)'", src).group(1)
if '--check' in sys.argv:
    if have != want:
        print(f'sw.js VERSION is {have}, content hash is {want}: run python3 tools/bump-sw.py')
        sys.exit(1)
    sys.exit(0)
if have != want:
    open(SW, 'w', encoding='utf8').write(src.replace(f"const VERSION = '{have}'", f"const VERSION = '{want}'"))
    print(f'VERSION {have} -> {want}')
else:
    print(f'VERSION {have} is current')
