#!/usr/bin/env python3
"""Sizes of iOS release apps as an unsigned arm64 device archive holds them.
  sizes.py [--json out.json] [--work dir] [--keep] <input> [<input> ...]
An input is an app folder (compiled with the compiler's src/cli.ts, its project
generated with xcodegen and archived with `xcodebuild archive -configuration
Release -destination generic/platform=iOS CODE_SIGNING_ALLOWED=NO`), an
.xcarchive or an .app; `label=input` names its entry, which is otherwise
native-<Framework> for a recipes-<framework> folder and the basename for the rest.
Each size is `du -sk` of a path in Products/Applications/<App>.app:
  bundle_kb      the .app
  executable_kb  its CFBundleExecutable
  frameworks_kb  Frameworks/ (0 if absent)
  javascript_kb  app/, a NativeScript build's bundled JavaScript and what it copies beside it (0 if absent)
Builds go to --work (default <tmp>/ns-compiled-bench/sizes), one folder per app,
deleted after measuring unless --keep. --json merges the entries into that file."""
import glob, json, os, plistlib, shutil, subprocess, sys, tempfile, time
from provenance import provenance

here = os.path.dirname(os.path.abspath(__file__))
cli = os.path.join(os.environ.get('NS_COMPILER') or os.path.join(here, '..'), 'src', 'cli.ts')
args = sys.argv[1:]
def option(name, fallback=None):
    if name not in args: return fallback
    i = args.index(name)
    value = args[i + 1]
    del args[i:i + 2]
    return value
out = option('--json')
work = os.path.abspath(option('--work', os.path.join(tempfile.gettempdir(), 'ns-compiled-bench', 'sizes')))
keep = '--keep' in args
inputs = [a for a in args if a != '--keep']
if not inputs: sys.exit(__doc__)

def kb(path): return int(subprocess.check_output(['du', '-sk', path]).split()[0]) if os.path.exists(path) else 0

def archive(app_dir):
    """Compiles an app folder and archives it; returns the .xcarchive and the folder to delete."""
    name = ''.join(p[:1].upper() + p[1:] for p in os.path.basename(os.path.abspath(app_dir)).replace('_', '-').split('-'))
    project = os.path.join(work, name)
    shutil.rmtree(project, ignore_errors=True)
    subprocess.run(['node', cli, app_dir, '--out', project, '--name', name], check=True)
    subprocess.run(['xcodegen', 'generate', '--quiet'], cwd=project, check=True)
    started = time.time()
    result = os.path.join(project, f'{name}.xcarchive')
    log = os.path.join(project, 'archive.log')
    with open(log, 'w') as f:
        status = subprocess.run(['xcodebuild', 'archive', '-project', f'{name}.xcodeproj', '-scheme', name, '-configuration', 'Release',
                                 '-destination', 'generic/platform=iOS', '-derivedDataPath', 'build', '-archivePath', result,
                                 'CODE_SIGNING_ALLOWED=NO'], cwd=project, stdout=f, stderr=subprocess.STDOUT).returncode
    if status:
        errors = [l for l in open(log) if 'error:' in l or l.startswith('Undefined symbols')]
        sys.exit(f'{name}: xcodebuild archive failed ({log})\n' + ''.join(errors[:20]))
    print(f'{name}: archived in {time.time() - started:.0f} s')
    return result, project

def measure(app):
    info = plistlib.load(open(os.path.join(app, 'Info.plist'), 'rb'))
    return {'bundle_kb': kb(app), 'executable_kb': kb(os.path.join(app, info['CFBundleExecutable'])),
            'frameworks_kb': kb(os.path.join(app, 'Frameworks')), 'javascript_kb': kb(os.path.join(app, 'app'))}

result = {}
for entry in inputs:
    label, _, path = entry.rpartition('=')
    path = os.path.abspath(path)
    base = os.path.basename(path.rstrip('/'))
    if not label:
        label = 'native-' + base[8:].capitalize() if base.startswith('recipes-') else os.path.splitext(base)[0]
    built = None
    if os.path.isdir(path) and not path.endswith(('.app', '.xcarchive')):
        path, built = archive(path)
    apps = [path] if path.endswith('.app') else glob.glob(os.path.join(path, 'Products', 'Applications', '*.app'))
    if len(apps) != 1: sys.exit(f'{entry}: expected one .app, found {apps}')
    result[label] = measure(apps[0])
    if built and not keep: shutil.rmtree(built)
    v = result[label]
    print(f"{label:16} {v['bundle_kb']:>8} KB  executable {v['executable_kb']:>7}  frameworks {v['frameworks_kb']:>6}  js {v['javascript_kb']:>5}")

if out:
    merged = json.load(open(out)) if os.path.exists(out) else {}
    merged.update(result)
    merged['_provenance'] = provenance()
    with open(out, 'w') as f: json.dump(merged, f, indent=2, sort_keys=True)
