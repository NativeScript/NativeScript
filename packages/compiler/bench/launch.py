#!/usr/bin/env python3
"""Cold launch and memory of installed apps, measured from outside the process.

For each run: terminate, record the screen, launch, and find in the recording
the first frame where the app's window replaces the home screen and the first
frame from which the screen matches its settled state and stays matched.
Then the process's physical footprint and resident size after a settle.
The simulator's accessibility is turned off first: `idb ui describe-all` turns
it on, and then every app loads the accessibility bundles at launch, up to
2 s of CPU and 30 MB of footprint.
  launch.py <udid> <bundle> [<bundle> ...] [--runs 5] [--json out.json]"""
import json, os, re, shutil, subprocess, sys, tempfile, time
from provenance import provenance
from PIL import Image, ImageChops

args = sys.argv[1:]
runs = int(args[args.index('--runs') + 1]) if '--runs' in args else 5
out = args[args.index('--json') + 1] if '--json' in args else None
positional = [a for i, a in enumerate(args) if not a.startswith('--') and (i == 0 or not args[i - 1].startswith('--'))]
udid, bundles = positional[0], positional[1:]
STATUS = 180  # the status bar is the simulator's: its clock changes during a run

def frames(video, fps=60):
    d = tempfile.mkdtemp()
    subprocess.run(['ffmpeg', '-v', 'error', '-i', video, '-vf', f'fps={fps},scale=402:-1', f'{d}/%05d.png'], check=True)
    return [os.path.join(d, f) for f in sorted(os.listdir(d))], fps

def body(path):
    # The content area only: the status bar's clock and the home indicator change on their own.
    im = Image.open(path).convert('L')
    w, h = im.size
    return im.crop((0, int(h * 0.08), w, int(h * 0.94)))

def same(a, b, tolerance=0.003):
    d = ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v > 24 else 0)
    return sum(1 for v in d.getdata() if v) / (a.size[0] * a.size[1]) <= tolerance

def pid_of(bundle):
    listing = subprocess.run(['xcrun', 'simctl', 'spawn', udid, 'launchctl', 'list'], capture_output=True, text=True).stdout
    for line in listing.splitlines():
        # The whole identifier: one bundle's can prefix another's (org.nativescript.nsoctane, org.nativescript.nsoctane.native).
        fields = line.split()
        if len(fields) == 3 and fields[0].isdigit() and fields[2].startswith(f'UIKitApplication:{bundle}['): return int(fields[0])
    return None

def memory(pid):
    text = subprocess.run(['footprint', str(pid)], capture_output=True, text=True).stdout
    m = re.search(r'Footprint:\s*([\d.]+)\s*(KB|MB|GB)', text)
    fp = float(m.group(1)) * {'KB': 1 / 1024, 'MB': 1, 'GB': 1024}[m.group(2)] if m else None
    rss = subprocess.run(['ps', '-o', 'rss=', '-p', str(pid)], capture_output=True, text=True).stdout.strip()
    cpu = subprocess.run(['ps', '-o', 'time=', '-p', str(pid)], capture_output=True, text=True).stdout.strip()
    seconds = None
    if cpu:
        parts = [float(p) for p in cpu.replace('-', ':').split(':')]
        seconds = sum(v * 60 ** i for i, v in enumerate(reversed(parts)))
    return fp, (int(rss) / 1024 if rss else None), seconds

def run(bundle):
    subprocess.run(['xcrun', 'simctl', 'terminate', udid, bundle], capture_output=True)
    time.sleep(1.0)
    video = tempfile.mktemp(suffix='.mp4')
    rec = subprocess.Popen(['xcrun', 'simctl', 'io', udid, 'recordVideo', '--codec', 'h264', '--force', video], stderr=subprocess.PIPE, text=True)
    time.sleep(1.2)
    subprocess.run(['xcrun', 'simctl', 'launch', udid, bundle], capture_output=True, check=True)
    time.sleep(5)
    pid = pid_of(bundle)
    rec.send_signal(2)
    rec.wait()
    time.sleep(1)
    fp, rss, cpu = memory(pid) if pid else (None, None, None)
    paths, fps = frames(video)
    shots = [body(p) for p in paths]
    shutil.rmtree(os.path.dirname(paths[0]))
    os.remove(video)
    final = shots[-1]
    first = shots[0]
    # The first frame that is no longer the home screen, and the first from which the screen stays settled.
    window = next((i for i, s in enumerate(shots) if not same(s, first, 0.02)), None)
    settled = next((i for i in range(len(shots)) if all(same(s, final) for s in shots[i:])), None)
    if window is None or settled is None: return None
    return {'content_after_window_ms': round((settled - window) * 1000 / fps), 'footprint_mb': fp, 'rss_mb': rss, 'cpu_s': cpu}

for key in ('AccessibilityEnabled', 'ApplicationAccessibilityEnabled'):
    subprocess.run(['xcrun', 'simctl', 'spawn', udid, 'defaults', 'write', 'com.apple.Accessibility', key, '-bool', 'false'], check=True)

results = {}
for b in bundles:
    results[b] = []
for i in range(runs):
    for b in bundles:  # interleaved, so drift affects both alike
        r = run(b)
        results[b].append(r)
        print(b, i, r, flush=True)

def median(xs):
    xs = sorted(x for x in xs if x is not None)
    return xs[len(xs) // 2] if xs else None

summary = {b: {k: median([r[k] for r in rs if r]) for k in ('content_after_window_ms', 'footprint_mb', 'rss_mb', 'cpu_s')} for b, rs in results.items()}
print(json.dumps(summary, indent=2))
if out: json.dump({'runs': results, 'median': summary, '_provenance': provenance()}, open(out, 'w'), indent=2)
