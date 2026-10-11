#!/usr/bin/env python3
"""A NativeScript app's native release against its NativeScript Release build,
both signed for and run on a physical iPhone: cold launch, memory, CPU,
screenshots against each other, and sizes.

  device.py [--device UDID] [--team TEAM] [--runs 5] [--json out.json]
            [--work dir] [--skip-build] [--rebuild-ns] [--skip-launch]
            [--skip-shots] [--taps-by-hand] <app> [<app> ...]

An <app> is a NativeScript project folder. `ns` writes platforms/ inside it,
so pass a copy, never a checkout another session builds in.

Needs a Python with pymobiledevice3 and Pillow (python3.13 -m venv v &&
v/bin/pip install pymobiledevice3 pillow; v/bin/python bench/device.py ...),
plus ns, node, xcodegen and Xcode. The phone must stay unlocked, with
Auto-Lock set to Never, for the whole run. Signing is Xcode's automatic
signing for --team (default $DEVELOPMENT_TEAM), development distribution.

Builds (into --work, default <tmp>/ns-compiled-bench/device):
  NativeScript  `ns build ios --release --for-device --team-id TEAM`, reused
                when its .ipa exists unless --rebuild-ns
  native        the compiler's src/cli.ts ($NS_COMPILER, else this package), xcodegen, `xcodebuild archive` with
                the project's Release settings (those bench/sizes.py
                measures) plus signing, `-exportArchive` to an .ipa
Both are installed with `devicectl device install app`. --skip-build reuses
the .ipas and does not install.

Launch: N runs per app, interleaved (NativeScript, native, NativeScript, ...),
each over one DVT connection (pymobiledevice3 riding Apple's own CoreDevice
tunnel; devicectl cannot record this device's screen, and xctrace does not
list it over Wi-Fi):
  1. Kill the app; wait 2 s on the home screen; launch it (DVT process
     control, as Xcode launches).
  2. From SpringBoard's own log, on the device's clock, counted from
     "Bootstrapping app<bundle>":
       first_frame_ms  the app's scene "content state changed: ready", which
                       FrontBoard logs when the app commits its first frame
       active_ms       the scene's deactivation reasons cleared: the app is
                       active and takes touches
     and the end of the launch transition (its SBAppToAppWorkspaceTransaction
     completes; iOS's zoom takes about 0.7 s whatever the app does).
  3. settled_ms: screenshots from the transition's end until 5.5 s after
     launch, about 4 a second. If the first already matches the last
     (content area), the screen was settled when the zoom ended, and that
     is settled_ms; otherwise it is the request time of the first one from
     which all match, mapped to the device clock, a few hundred ms coarse.
  4. About 7 s after launch, the process's sysmontap sample: physFootprint as
     footprint_mb, cpuTotalUser + cpuTotalSystem as cpu_s, all the CPU the
     process used to reach its settled first screen (an idle app adds next to
     nothing after it settles).
  Medians per app. A cold launch here is a new process; the files it maps
  are in the page cache from the previous run, as on the simulator.

Screens: each app's screens are screenshotted once settled (two consecutive
captures equal below the status bar), on both builds, and compared below the
status bar with a per-pixel threshold of 16. Nothing outside an app taps a
physical iPhone without an XCUITest runner, which is an app ID of its own to
provision (devicectl has no touch input, and the accessibility inspector's
Activate did nothing on these apps' rows), so a screen behind taps is taken
only with --taps-by-hand: the tool says what to tap and waits for Enter.

Sizes: the .ipa, the .app it holds (uncompressed), and the installed app as
the phone reports it (installation_proxy StaticDiskUsage)."""
from provenance import provenance
import argparse, asyncio, glob, io, json, os, plistlib, re, shutil, statistics, subprocess, sys, tempfile, time, zipfile
from PIL import Image, ImageChops, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
CLI = os.path.join(os.environ.get('NS_COMPILER') or os.path.join(HERE, '..'), 'src', 'cli.ts')
# 62 pt at 3x: the status bar's clock, battery and back-to-app breadcrumb are the phone's.
STATUS = 186
THRESHOLD = 16
# Each screen: its name and what to tap, by hand, after a fresh launch.
SCREENS = {
    'recipes': [('home', None), ('detail', 'the Pad Thai row')],
    'ns-octane': [('home', None), ('chat', 'the menu button (top left), then the first chat under Recents')],
}

p = argparse.ArgumentParser(usage=__doc__)
p.add_argument('apps', nargs='+')
p.add_argument('--device')
p.add_argument('--team', default=os.environ.get('DEVELOPMENT_TEAM'))
p.add_argument('--runs', type=int, default=5)
p.add_argument('--json')
p.add_argument('--work', default=os.path.join(tempfile.gettempdir(), 'ns-compiled-bench', 'device'))
p.add_argument('--skip-build', action='store_true')
p.add_argument('--rebuild-ns', action='store_true')
p.add_argument('--skip-launch', action='store_true')
p.add_argument('--skip-shots', action='store_true')
p.add_argument('--taps-by-hand', action='store_true')
args = p.parse_args()
work = os.path.abspath(args.work)
os.makedirs(work, exist_ok=True)

def run(cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)

def devicectl(*a, check=True, timeout=120):
    fd, out = tempfile.mkstemp(suffix='.json')
    os.close(fd)
    r = subprocess.run(['xcrun', 'devicectl', *a, '--json-output', out, '-q'], capture_output=True, text=True, timeout=timeout)
    try: result = json.load(open(out)).get('result', {})
    except ValueError: result = {}
    os.remove(out)
    if check and r.returncode: sys.exit(f'devicectl {" ".join(a)}: {r.stderr.strip() or r.stdout.strip()}')
    return result

def default_device():
    phones = [d for d in devicectl('list', 'devices')['devices']
              if d['hardwareProperties'].get('reality') == 'physical' and d['hardwareProperties'].get('deviceType') == 'iPhone'
              and d['connectionProperties'].get('pairingState') == 'paired' and d['connectionProperties'].get('tunnelState') != 'unavailable']
    if len(phones) != 1: sys.exit(f'pass --device: {len(phones)} paired iPhones')
    return phones[0]['hardwareProperties']['udid']

udid = args.device or default_device()

# ---- builds

def pascal(folder):
    return re.sub(r'(^|[-_])(\w)', lambda m: m.group(2).upper(), os.path.basename(folder))

def ipa_info(ipa):
    with zipfile.ZipFile(ipa) as z:
        plist = next(n for n in z.namelist() if re.fullmatch(r'Payload/[^/]+\.app/Info\.plist', n))
        info = plistlib.loads(z.read(plist))
        app = plist.rsplit('/', 1)[0] + '/'
        app_kb = sum(i.file_size for i in z.infolist() if i.filename.startswith(app)) / 1024
    return info['CFBundleIdentifier'], round(app_kb)

def need_team():
    if not args.team: sys.exit('--team (or DEVELOPMENT_TEAM) is needed to sign')

def ns_build(app):
    ipas = lambda: glob.glob(os.path.join(app, 'platforms', 'ios', 'build', 'Release-iphoneos', '*.ipa'))
    if ipas() and not args.rebuild_ns: return ipas()[0]
    need_team()
    log = os.path.join(work, f'{os.path.basename(app)}-ns.log')
    with open(log, 'w') as f:
        if subprocess.run(['ns', 'build', 'ios', '--release', '--for-device', '--team-id', args.team], cwd=app, stdout=f, stderr=subprocess.STDOUT).returncode:
            sys.exit(f'ns build failed: {log}')
    return ipas()[0]

def native_build(app):
    name = pascal(app)
    project = os.path.join(work, name)
    ipa = os.path.join(project, 'export', f'{name}.ipa')
    if args.skip_build and os.path.exists(ipa): return ipa
    need_team()
    shutil.rmtree(project, ignore_errors=True)
    run(['node', CLI, app, '--out', project, '--name', name])
    run(['xcodegen', 'generate', '--quiet'], cwd=project)
    signing = ['-allowProvisioningUpdates', 'CODE_SIGNING_ALLOWED=YES', 'CODE_SIGN_STYLE=Automatic', f'DEVELOPMENT_TEAM={args.team}']
    log = os.path.join(project, 'archive.log')
    with open(log, 'w') as f:
        if subprocess.run(['xcodebuild', 'archive', '-project', f'{name}.xcodeproj', '-scheme', name, '-configuration', 'Release',
                           '-destination', 'generic/platform=iOS', '-derivedDataPath', 'build', '-archivePath', f'{name}.xcarchive', *signing],
                          cwd=project, stdout=f, stderr=subprocess.STDOUT).returncode:
            sys.exit(f'{name}: xcodebuild archive failed ({log})')
    options = os.path.join(project, 'export.plist')
    with open(options, 'wb') as f:
        plistlib.dump({'method': 'debugging', 'teamID': args.team, 'signingStyle': 'automatic', 'thinning': '<none>'}, f)
    with open(os.path.join(project, 'export.log'), 'w') as f:
        run(['xcodebuild', '-exportArchive', '-archivePath', f'{name}.xcarchive', '-exportPath', 'export',
             '-exportOptionsPlist', options, '-allowProvisioningUpdates'], cwd=project, stdout=f, stderr=subprocess.STDOUT)
    shutil.rmtree(os.path.join(project, 'build'), ignore_errors=True)
    return ipa

KINDS = ('nativescript', 'native')
apps = []
for folder in args.apps:
    folder = os.path.abspath(folder).rstrip('/')
    base = os.path.basename(folder)
    entry = {'name': base, 'screens': next((v for k, v in SCREENS.items() if base.startswith(k)), [('home', None)])}
    for kind, build in zip(KINDS, (ns_build, native_build)):
        ipa = build(folder)
        bundle, app_kb = ipa_info(ipa)
        entry[kind] = {'ipa': ipa, 'bundle': bundle, 'size_kb': {'ipa': round(os.path.getsize(ipa) / 1024), 'app': app_kb}}
        print(f'{base} {kind}: {bundle} ({ipa})', flush=True)
        if not args.skip_build: devicectl('device', 'install', 'app', '--device', udid, ipa, timeout=600)
    apps.append(entry)

if devicectl('device', 'info', 'lockState', '--device', udid).get('passcodeRequired'):
    sys.exit('The phone is locked: unlock it, and set Settings > Display & Brightness > Auto-Lock to Never for the run.')

# ---- the phone

async def with_rsd(job, attempts=6):
    """Apple's tunnel serves one RSD connection at a time and remoted takes it back now and
    then, so a job whose connection drops is run again on a fresh one."""
    from pymobiledevice3.remote.native_tunnel import NativeRemotedTunnel
    last = None
    for _ in range(attempts):
        try:
            async with NativeRemotedTunnel(serial=udid) as rsd:
                return await asyncio.wait_for(job(rsd), 90)
        except Exception as e:  # the tunnel's failures surface as many unrelated types
            last = e
            await asyncio.sleep(3)
    raise RuntimeError(f'RSD: {last!r}')

def content(png):
    image = Image.open(io.BytesIO(png)).convert('L')
    w, h = image.size
    return image.resize((w // 3, h // 3)).crop((0, int(h / 3 * 0.08), w // 3, int(h / 3 * 0.94)))

def same(a, b, tolerance=0.003):
    d = ImageChops.difference(a, b).point(lambda v: 255 if v > 24 else 0)
    return sum(1 for v in d.getdata() if v) / (a.size[0] * a.size[1]) <= tolerance

async def sysmon_sample(dvt, pid):
    from pymobiledevice3.services.dvt.instruments.sysmontap import Sysmontap
    async with await Sysmontap.create(dvt) as sysmon:
        seen = 0
        async for snapshot in sysmon.iter_processes():
            seen += 1
            row = next((r for r in snapshot if r.get('pid') == pid), None)
            # The first snapshot can carry totals from before the sample interval.
            if row and seen > 1:
                return {'footprint_mb': round(row['physFootprint'] / 2 ** 20, 1),
                        'cpu_s': round((row['cpuTotalUser'] + row['cpuTotalSystem']) / 1e9, 3)}

async def cold_launch(rsd, bundle):
    from pymobiledevice3.services.dvt.instruments.device_info import DeviceInfo
    from pymobiledevice3.services.dvt.instruments.dvt_provider import DvtProvider
    from pymobiledevice3.services.dvt.instruments.process_control import ProcessControl
    from pymobiledevice3.services.dvt.instruments.screenshot import Screenshot
    from pymobiledevice3.services.os_trace import OsTraceService
    async with DvtProvider(rsd) as dvt, ProcessControl(dvt) as control, Screenshot(dvt) as screen, DeviceInfo(dvt) as info:
        springboard = next(p['pid'] for p in await info.proclist() if p.get('name') == 'SpringBoard')
        running = await control.process_identifier_for_bundle_identifier(bundle)
        if running and running > 0: await control.kill(running)
        await asyncio.sleep(2)
        marks, offsets, done = {}, [], asyncio.Event()
        scene = f'sceneID:{bundle}-default'

        async def watch():
            transaction = None
            async for e in OsTraceService(lockdown=rsd).syslog(pid=springboard):
                t, m = e.timestamp.timestamp(), e.message
                offsets.append(time.time() - t)
                if 'SBAppToAppWorkspaceTransaction' in m and "from 'Initial' to 'Working'" in m:
                    transaction = m.split('>')[0]
                elif f'Bootstrapping app<{bundle}>' in m:
                    marks['bootstrap'] = t
                elif 'bootstrap' not in marks:
                    continue
                elif scene in m and 'content state changed: ready' in m:
                    marks['first_frame'] = t
                elif scene in m and "deactivation reasons to: '(none)'" in m:
                    marks['active'] = t
                elif transaction and m.startswith(transaction) and "to 'Completed'" in m:
                    marks['animated'] = t
                    done.set()
                    return

        watcher = asyncio.create_task(watch())
        await asyncio.sleep(1)
        launched = time.time()
        pid = await control.launch(bundle, kill_existing=True)
        try:
            await asyncio.wait_for(done.wait(), 20)
        finally:
            watcher.cancel()
        # Host clock minus device clock, give or take the shortest log delivery delay.
        offset = min(offsets)
        shots = []
        while time.time() < launched + 5.5:
            before = time.time() - offset
            shots.append((before, content(await screen.get_screenshot())))
        final = shots[-1][1]
        first = next(i for i in range(len(shots)) if all(same(s, final) for _, s in shots[i:]))
        settled = marks['animated'] if first == 0 else shots[first][0]
        await asyncio.sleep(max(0, launched + 7 - time.time()))
        stats = await sysmon_sample(dvt, pid)
        await control.kill(pid)
        since = lambda t: round((t - marks['bootstrap']) * 1000)
        return {'first_frame_ms': since(marks['first_frame']), 'active_ms': since(marks['active']),
                'settled_ms': since(max(settled, marks['animated'])), **stats}

async def installed_sizes(rsd, bundles):
    from pymobiledevice3.services.installation_proxy import InstallationProxyService
    async with InstallationProxyService(lockdown=rsd) as proxy:
        found = await proxy.get_apps(calculate_sizes=True, bundle_identifiers=bundles)
    return {b: round(found[b]['StaticDiskUsage'] / 1024) for b in bundles if b in found}

def pid_of(bundle):
    apps_ = devicectl('device', 'info', 'apps', '--device', udid, '--bundle-id', bundle)['apps']
    path = apps_[0]['url'].replace('file://', '').rstrip('/') + '/'
    procs = devicectl('device', 'info', 'processes', '--device', udid)['runningProcesses']
    return next((p['processIdentifier'] for p in procs if p.get('executable', '').replace('file://', '').startswith(path)), None)

def screenshot(path):
    devicectl('device', 'capture', 'screenshot', '--device', udid, '--destination', path)
    image = Image.open(path).convert('RGB')
    return image.crop((0, STATUS, image.size[0], image.size[1]))

def settled_shot(path, timeout=20):
    """Captures until two consecutive frames match below the status bar."""
    previous, deadline = None, time.time() + timeout
    while True:
        frame = screenshot(path)
        if previous is not None and ImageChops.difference(frame, previous).getbbox() is None or time.time() > deadline: return path
        previous = frame
        time.sleep(0.5)

def fresh_launch(bundle):
    pid = pid_of(bundle)
    if pid: devicectl('device', 'process', 'terminate', '--device', udid, '--pid', str(pid), check=False)
    time.sleep(1.5)
    devicectl('device', 'process', 'launch', '--device', udid, bundle)
    time.sleep(3)

def diff(a, b, out):
    x, y = Image.open(a).convert('RGB'), Image.open(b).convert('RGB')
    d = ImageChops.difference(x, y).convert('L').point(lambda v: 255 if v > THRESHOLD else 0)
    ImageDraw.Draw(d).rectangle((0, 0, d.size[0], STATUS), fill=0)
    d.save(out)
    return sum(1 for v in d.getdata() if v)

def median(xs):
    xs = [x for x in xs if x is not None]
    return statistics.median(xs) if xs else None

report = {}
for entry in apps:
    bundles = [entry[k]['bundle'] for k in KINDS]
    installed = asyncio.run(with_rsd(lambda rsd: installed_sizes(rsd, bundles)))
    report[entry['name']] = {'bundles': dict(zip(KINDS, bundles)),
                             'sizes_kb': {k: {**entry[k]['size_kb'], 'installed': installed.get(entry[k]['bundle'])} for k in KINDS}}

if not args.skip_shots:
    for entry in apps:
        shots_dir = os.path.join(work, 'shots', entry['name'])
        os.makedirs(shots_dir, exist_ok=True)
        screens = [(n, taps) for n, taps in entry['screens'] if not taps or args.taps_by_hand]
        taken = {}
        for kind in KINDS:
            bundle = entry[kind]['bundle']
            for name, taps in screens:
                fresh_launch(bundle)
                if taps: input(f"{entry['name']} {kind}: on the phone, tap {taps}, then press Enter here. ")
                taken[(kind, name)] = settled_shot(os.path.join(shots_dir, f'{kind}-{name}.png'))
        pixels = {}
        for name, _ in screens:
            pixels[name] = diff(taken[('nativescript', name)], taken[('native', name)], os.path.join(shots_dir, f'diff-{name}.png'))
            print(f"{entry['name']} {name}: {pixels[name]} pixels differ below the status bar", flush=True)
        report[entry['name']]['pixels'] = pixels

if not args.skip_launch:
    runs = {(e['name'], k): [] for e in apps for k in KINDS}
    for i in range(args.runs):
        for entry in apps:
            for kind in KINDS:
                r = asyncio.run(with_rsd(lambda rsd: cold_launch(rsd, entry[kind]['bundle'])))
                runs[(entry['name'], kind)].append(r)
                print(entry['name'], kind, i, r, flush=True)
    for entry in apps:
        report[entry['name']]['launch'] = {k: {'median': {m: median([r[m] for r in runs[(entry['name'], k)]]) for m in runs[(entry['name'], k)][0]},
                                               'runs': runs[(entry['name'], k)]} for k in KINDS}

print(json.dumps({n: {**a, 'launch': {k: v['median'] for k, v in a.get('launch', {}).items()}} for n, a in report.items()}, indent=2))
if args.json:
    merged = json.load(open(args.json)) if os.path.exists(args.json) else {}
    details = devicectl('device', 'info', 'details', '--device', udid)
    merged['device'] = {'model': details['hardwareProperties'].get('marketingName'),
                        'ios': f"{details['deviceProperties'].get('osVersionNumber')} ({details['deviceProperties'].get('osBuildUpdate')})"}
    merged['method'] = 'bench/device.py; its header describes each measure'
    merged['_provenance'] = provenance()
    merged.setdefault('apps', {})
    for name, value in report.items(): merged['apps'].setdefault(name, {}).update(value)
    with open(args.json, 'w') as f: json.dump(merged, f, indent=2)
