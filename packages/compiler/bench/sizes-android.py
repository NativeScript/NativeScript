#!/usr/bin/env python3
"""Release APK sizes and what they hold: code (dex), native libraries, the
app's JavaScript, the rest. Fails if a native APK carries a JavaScript engine.
  sizes-android.py <apk dir> <out.json>    (ns-<framework>.apk, native-<framework>.apk)"""
import json, os, sys, zipfile
from provenance import provenance

apks, out = sys.argv[1:3]
result = {}
for name in sorted(os.listdir(apks)):
    if not name.endswith('.apk'): continue
    path = os.path.join(apks, name)
    sizes = {'apk_kb': os.path.getsize(path) // 1024, 'dex_kb': 0, 'native_libs_kb': 0, 'javascript_kb': 0, 'other_kb': 0}
    libs = set()
    with zipfile.ZipFile(path) as z:
        for info in z.infolist():
            n, size = info.filename, info.compress_size
            if n.endswith('.dex'): sizes['dex_kb'] += size
            elif n.startswith('lib/') and n.endswith('.so'):
                sizes['native_libs_kb'] += size
                libs.add(os.path.basename(n))
            elif n.startswith('assets/app/') and n.endswith(('.js', '.mjs')): sizes['javascript_kb'] += size
            else: sizes['other_kb'] += size
    for k in ('dex_kb', 'native_libs_kb', 'javascript_kb', 'other_kb'): sizes[k] //= 1024
    sizes['native_libs'] = sorted(libs)
    if name.startswith('native-') and any('NativeScript' in lib or 'v8' in lib.lower() for lib in libs):
        sys.exit(f'{name} carries a JavaScript engine: {sorted(libs)}')
    result[name[:-4]] = sizes
json.dump({**result, '_provenance': provenance()}, open(out, 'w'), indent=2, sort_keys=True)
for k, v in result.items(): print(f"{k:16} {v['apk_kb']:>8} KB  dex {v['dex_kb']:>6}  libs {v['native_libs_kb']:>6}  js {v['javascript_kb']:>5}")
