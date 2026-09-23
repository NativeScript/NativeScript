#!/usr/bin/env node
// Native build state: a content-addressed link between the native SOURCES in
// this package and the committed native ARTIFACTS in packages/core/platforms.
//
// The native builds (Xcode xcframework, Gradle aar) are expensive and their
// outputs are not byte-reproducible across machines/toolchains, so we can't rely
// on rebuild-and-compare or on Nx's env-sensitive cache. Instead we hash the
// source inputs (per platform) and record them alongside a hash of the produced
// artifact in `native-build-state.json`. That gives a reliable, env-independent
// answer to two questions:
//   * are the committed artifacts still in sync with the sources?  (check)
//   * can we skip the native build for a platform?                 (is-current)
//
// Commands:
//   node tools/native-state.mjs write   [ios|android]   update the state file
//   node tools/native-state.mjs check   [ios|android]   verify sync (exit 1 on drift)
//   node tools/native-state.mjs is-current <ios|android> exit 0 if build can be skipped
//
// The state file is committed but never published: it lives at the package root,
// outside the dist/package tree that `npm pack` is built from.
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, readdirSync, readlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CORE_PLATFORMS = resolve(PKG, '../core/platforms');
const STATE_FILE = join(PKG, 'native-build-state.json');
const STATE_VERSION = 1;

// Path segments that never affect artifact content (build outputs, IDE/tooling
// scratch, OS cruft). Any file whose path contains one of these is ignored.
const IGNORED_SEGMENTS = new Set(['build', 'dist', '.gradle', '.kotlin', '.idea', 'xcuserdata', 'DerivedData', 'bin', '.settings', '.project', '.DS_Store']);

const PLATFORMS = {
	ios: {
		// Inputs that determine the xcframework. The outer build.ios.sh wrapper is
		// packaging/orchestration (and holds the skip logic itself), not a compile
		// input, so it is deliberately excluded.
		sources: ['ios/build.sh', 'ios/normalize-xcframework-plist.mjs', 'ios/TNSWidgets'],
		artifact: join(CORE_PLATFORMS, 'ios/TNSWidgets.xcframework'),
	},
	android: {
		// Inputs that determine the widgets aar (widgetdemo and the outer
		// build.android.sh wrapper are not part of it).
		sources: ['android/build.gradle', 'android/settings.gradle', 'android/gradle.properties', 'android/gradle', 'android/gradlew', 'android/widgets'],
		artifact: join(CORE_PLATFORMS, 'android/widgets-release.aar'),
	},
};

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

// Recursively collect [relPath, kind, hash] triples under `root`, skipping any
// ignored path segment. Symlinks are hashed by their target string (not
// followed), so framework version symlinks stay stable and loop-free.
function collect(root, base, out) {
	const rel = relative(base, root).split('\\').join('/');
	if (rel && rel.split('/').some((seg) => IGNORED_SEGMENTS.has(seg))) return;
	if (!existsSync(root) && !isSymlink(root)) return;

	const st = lstatSync(root);
	if (st.isSymbolicLink()) {
		out.push([rel, 'link', sha256(readlinkSync(root))]);
	} else if (st.isDirectory()) {
		for (const name of readdirSync(root).sort()) collect(join(root, name), base, out);
	} else if (st.isFile()) {
		out.push([rel, 'file', sha256(readFileSync(root))]);
	}
}

function isSymlink(p) {
	try {
		return lstatSync(p).isSymbolicLink();
	} catch {
		return false;
	}
}

// Hash a set of roots into a single digest over a sorted manifest, so the result
// is independent of filesystem enumeration order and of the machine.
function hashRoots(roots, base) {
	const entries = [];
	for (const r of roots) collect(r, base, entries);
	entries.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
	const manifest = entries.map(([rel, kind, hash]) => `${rel}\0${kind}\0${hash}`).join('\n');
	return { digest: 'sha256:' + sha256(manifest), count: entries.length };
}

function sourceHash(platform) {
	const roots = PLATFORMS[platform].sources.map((s) => join(PKG, s));
	return hashRoots(roots, PKG).digest;
}

function artifactHash(platform) {
	const artifact = PLATFORMS[platform].artifact;
	if (!existsSync(artifact) && !isSymlink(artifact)) return null;
	return hashRoots([artifact], dirname(artifact)).digest;
}

function readState() {
	if (!existsSync(STATE_FILE)) return { version: STATE_VERSION };
	return JSON.parse(readFileSync(STATE_FILE, 'utf8'));
}

// Stable, sorted-key JSON with a trailing newline so the committed file is diff-friendly.
function writeState(state) {
	const ordered = { version: STATE_VERSION };
	for (const platform of Object.keys(PLATFORMS)) {
		if (state[platform]) ordered[platform] = { sourceHash: state[platform].sourceHash, artifactHash: state[platform].artifactHash };
	}
	writeFileSync(STATE_FILE, JSON.stringify(ordered, null, '\t') + '\n');
}

function cmdWrite(platforms) {
	const state = readState();
	for (const platform of platforms) {
		const artifact = artifactHash(platform);
		if (!artifact) {
			console.error(`[native-state] cannot write ${platform}: artifact missing at ${PLATFORMS[platform].artifact}`);
			process.exit(1);
		}
		state[platform] = { sourceHash: sourceHash(platform), artifactHash: artifact };
		console.log(`[native-state] recorded ${platform}: source ${state[platform].sourceHash.slice(0, 19)}… artifact ${artifact.slice(0, 19)}…`);
	}
	writeState(state);
	console.log(`[native-state] wrote ${relative(process.cwd(), STATE_FILE)}`);
}

// Returns { ok, reason } describing whether a platform's committed artifact is
// in sync with its sources and intact.
function status(platform) {
	const state = readState();
	const recorded = state[platform];
	if (!recorded) return { ok: false, reason: 'no recorded state (never built via native-state)' };
	if (recorded.sourceHash !== sourceHash(platform)) return { ok: false, reason: 'native sources changed since last build' };
	const artifact = artifactHash(platform);
	if (!artifact) return { ok: false, reason: 'committed artifact is missing' };
	if (artifact !== recorded.artifactHash) return { ok: false, reason: 'committed artifact does not match recorded hash (corrupted or hand-edited)' };
	return { ok: true, reason: 'up to date' };
}

function cmdCheck(platforms) {
	let failed = false;
	for (const platform of platforms) {
		const { ok, reason } = status(platform);
		console.log(`[native-state] ${platform}: ${ok ? 'OK' : 'OUT OF SYNC'} — ${reason}`);
		if (!ok) failed = true;
	}
	if (failed) {
		console.error('\n[native-state] Native artifacts are out of sync with their sources.');
		console.error('Rebuild and commit the updated artifacts + native-build-state.json:');
		console.error('    npx nx build ui-mobile-base');
		process.exit(1);
	}
}

function cmdIsCurrent(platform) {
	// Silent: used by build scripts to decide whether to skip. Exit 0 = skip.
	process.exit(status(platform).ok ? 0 : 1);
}

const [cmd, arg] = process.argv.slice(2);
const targets = arg ? [arg] : Object.keys(PLATFORMS);
for (const t of targets) {
	if (!PLATFORMS[t]) {
		console.error(`[native-state] unknown platform: ${t} (expected ios or android)`);
		process.exit(2);
	}
}

switch (cmd) {
	case 'write':
		cmdWrite(targets);
		break;
	case 'check':
		cmdCheck(targets);
		break;
	case 'is-current':
		if (!arg) {
			console.error('[native-state] is-current requires a platform (ios|android)');
			process.exit(2);
		}
		cmdIsCurrent(arg);
		break;
	default:
		console.error('Usage: native-state.mjs <write|check|is-current> [ios|android]');
		process.exit(2);
}
