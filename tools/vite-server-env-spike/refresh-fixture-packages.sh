#!/usr/bin/env bash
# Rebuild @nativescript/vite (without core) and reinstall it, core and (for the
# Angular fixture) @nativescript/angular into a fixture from packed tarballs, so
# the fixture resolves them like a real app does (real node_modules directories,
# not symlinks into dist/ — Vite's config loader bundles linked packages and
# then resolves their dependencies from the link target).
#
# Usage: tools/vite-server-env-spike/refresh-fixture-packages.sh [--app <fixture>] [--skip-build] [vite | vite-legacy] [core] [angular]
# `--app` names the fixture under apps/ (default ng). `vite-legacy` installs the
# pre-thin package built by legacy-vite.sh instead of the working tree's. With no
# package names, vite and core are refreshed, plus angular for ng. The lockfile is regenerated,
# which reinstalls core and invalidates the native project, so platforms/ is
# deleted too (the next `ns run` does a clean native build).
set -euo pipefail

SPIKE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SPIKE/../.." && pwd)"
NS_ANGULAR_DIST="${NS_ANGULAR_DIST:-$HOME/projects/angular/.claude/worktrees/bootstrap-after-launch/dist/packages/angular}"

APP_NAME=ng
SKIP_BUILD=0
PKGS=()
while [ "$#" -gt 0 ]; do
	case "$1" in
		--app) APP_NAME="${2:?--app needs a fixture name}"; shift ;;
		--skip-build) SKIP_BUILD=1 ;;
		vite | vite-legacy | core | angular) PKGS+=("$1") ;;
		*) echo "unknown argument: $1" >&2; exit 1 ;;
	esac
	shift
done
APP="$SPIKE/apps/$APP_NAME"
[ -f "$APP/package.json" ] || { echo "no fixture at $APP" >&2; exit 1; }
LOCAL="$APP/.local"
mkdir -p "$LOCAL"
if [ "${#PKGS[@]}" -eq 0 ]; then
	PKGS=(vite core)
	[ "$APP_NAME" = ng ] && PKGS+=(angular)
fi
want() { local p; for p in "${PKGS[@]}"; do [ "$p" = "$1" ] && return 0; done; return 1; }

if [ "$SKIP_BUILD" = 0 ] && want vite; then
	(cd "$REPO" && NX_DAEMON=false NX_NO_CLOUD=true ../../../node_modules/.bin/nx run vite:build --skip-nx-cache --exclude-task-dependencies >/dev/null)
fi

pack() {
	local src="$1" dest="$2" tmp
	tmp="$(mktemp -d)"
	(cd "$tmp" && npm pack "$src" --silent >/dev/null)
	local tgz
	tgz="$(find "$tmp" -maxdepth 1 -name '*.tgz' | head -1)"
	[ -n "$tgz" ] || { echo "pack failed for $src" >&2; exit 1; }
	mv "$tgz" "$LOCAL/$dest"
	rm -rf "$tmp"
}

cd "$APP"
# Local packages (apps/<fixture>/local/<name>/) install from tarballs too: a file:
# directory dependency is a symlink, which the dev server keeps out of pre-bundling.
for dir in "$APP"/local/*/; do
	if [ -f "$dir/package.json" ]; then pack "$dir" "$(basename "$dir").tgz"; fi
done
for p in "${PKGS[@]}"; do
	case "$p" in
		vite) pack "$REPO/dist/packages/vite" nativescript-vite.tgz ;;
		vite-legacy)
			[ -f "$SPIKE/legacy/dist/package.json" ] || { echo "run legacy-vite.sh first" >&2; exit 1; }
			pack "$SPIKE/legacy/dist" nativescript-vite.tgz
			p=vite
			;;
		core) pack "$REPO/dist/packages/core" nativescript-core.tgz ;;
		angular) pack "$NS_ANGULAR_DIST" nativescript-angular.tgz ;;
	esac
	rm -rf "node_modules/@nativescript/$p"
done
# The lockfile pins each file: tarball's integrity, so npm would reinstall the
# previous contents from its cache; regenerate it.
rm -f package-lock.json
npm install --no-audit --no-fund >/dev/null
rm -rf platforms .ns-vite-build
node -p "['@nativescript/vite','@nativescript/core','@nativescript/angular'].filter(p => require('fs').existsSync('./node_modules/' + p + '/package.json')).map(p => p + '@' + require('./node_modules/' + p + '/package.json').version).join('  ')"
