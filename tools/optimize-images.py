#!/usr/bin/env python3
"""Make the web copies of the game's images. Run from the repository root after adding art:

    python3 tools/optimize-images.py

- Every .jpg under assets/img (except assets/img/ref, which is only used as prompt
  attachments) gets a .webp beside it at quality 80. The game loads the .webp; the .jpg
  stays as the source and as the file to attach to image prompts.
- PNG emblems and icons are reduced to a 256-colour palette (alpha kept) unless they already are.
Only files whose source is newer than the output are touched. Needs Pillow.
"""
import os
import sys
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
made = skipped = 0
for base, dirs, files in os.walk(os.path.join(ROOT, 'assets', 'img')):
    if os.path.relpath(base, ROOT).replace('\\', '/').startswith('assets/img/ref'):
        continue
    for f in files:
        src = os.path.join(base, f)
        if f.lower().endswith('.jpg'):
            out = src[:-4] + '.webp'
            if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(src):
                skipped += 1
                continue
            Image.open(src).save(out, quality=80, method=6)
            made += 1
            print('webp ', os.path.relpath(out, ROOT), f'{os.path.getsize(src)//1024} -> {os.path.getsize(out)//1024} KB')
for d in ('assets/img/emblems', 'assets/icons'):
    for f in sorted(os.listdir(os.path.join(ROOT, d))):
        p = os.path.join(ROOT, d, f)
        if not f.endswith('.png'):
            continue
        im = Image.open(p)
        if im.mode == 'P':
            skipped += 1
            continue
        before = os.path.getsize(p)
        q = im.convert('RGBA').quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG)
        q.save(p, optimize=True)
        made += 1
        print('png  ', os.path.relpath(p, ROOT), f'{before//1024} -> {os.path.getsize(p)//1024} KB')
print(f'{made} written, {skipped} already up to date')
sys.exit(0)
