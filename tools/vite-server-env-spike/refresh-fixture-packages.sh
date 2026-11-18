#!/usr/bin/env bash
# Rebuild @nativescript/vite (without core) and reinstall it, core and
# @nativescript/angular into the Angular fixture from packed tarballs, so the
# fixture resolves them like a real app does (real node_modules directories,
# not symlinks into dist/ — Vite's config loader bundles linked packages and
# then resolves their dependencies from the link target).
#
# Usage: tools/vite-server-env-spike/refresh-fixture-packages.sh [--skip-build] [vite] [core] [angular]
# With no package names, all three are refreshed. The lockfile is regenerated,
# which reinstalls core and invalidates the native project, so platforms/ is
# deleted too (the next `ns run` does a clean native build).
set -euo pipefail

SPIKE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SPIKE/../.." && pwd)"
APP="$SPIKE/apps/ng"
NS_ANGULAR_DIST="${NS_ANGULAR_DIST:-$HOME/projects/angular/.claude/worktrees/bootstrap-after-launch/dist/packages/angular}"
LOCAL="$APP/.local"
mkdir -p "$LOCAL"

SKIP_BUILD=0
PKGS=()
for arg in "$@"; do
	case "$arg" in
		--skip-build) SKIP_BUILD=1 ;;
		vite | core | angular) PKGS+=("$arg") ;;
		*) echo "unknown argument: $arg" >&2; exit 1 ;;
	esac
done
[ "${#PKGS[@]}" -gt 0 ] || PKGS=(vite core angular)
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
for p in "${PKGS[@]}"; do
	case "$p" in
		vite) pack "$REPO/dist/packages/vite" nativescript-vite.tgz ;;
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
node -p "['@nativescript/vite','@nativescript/core','@nativescript/angular'].map(p => p + '@' + require('./node_modules/' + p + '/package.json').version).join('  ')"
