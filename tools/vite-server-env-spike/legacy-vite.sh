#!/usr/bin/env bash
# Export a ref's packages/vite (default origin/main: the pre-thin @nativescript/vite)
# into tools/vite-server-env-spike/legacy/ (gitignored) and build it there, so the
# fixture can switch between it and the working tree's thin-only package:
#
#   tools/vite-server-env-spike/legacy-vite.sh [ref]
#   tools/vite-server-env-spike/refresh-fixture-packages.sh vite-legacy   # use it
#   tools/vite-server-env-spike/refresh-fixture-packages.sh vite          # back to the working tree
set -euo pipefail

SPIKE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SPIKE/../.." && pwd)"
REF="${1:-origin/main}"
LEGACY="$SPIKE/legacy"

rm -rf "$LEGACY"
mkdir -p "$LEGACY"
git -C "$REPO" archive "$REF" packages/vite LICENSE | tar -x -C "$LEGACY"
git -C "$REPO" rev-parse "$REF" > "$LEGACY/REF"
# packages/vite/tsconfig.json extends ../../tsconfig.base.json; point its path
# mappings (@nativescript/core, ...) back at the repo.
node -e '
const fs = require("fs");
const [src, dest, repo] = process.argv.slice(1);
const base = JSON.parse(fs.readFileSync(src, "utf8"));
base.compilerOptions.baseUrl = repo;
fs.writeFileSync(dest, JSON.stringify(base, null, "\t"));
' "$REPO/tsconfig.base.json" "$LEGACY/tsconfig.base.json" "$REPO"

OUT="$LEGACY/dist"
(cd "$LEGACY/packages/vite" && npx --no-install tsc -p tsconfig.lib.json --outDir "$OUT" --rootDir .)
cp "$LEGACY/packages/vite/package.json" "$LEGACY/packages/vite/README.md" "$LEGACY/LICENSE" "$OUT/"
mkdir -p "$OUT/bin"
cp "$LEGACY/packages/vite/bin/cli.cjs" "$OUT/bin/"
echo "legacy @nativescript/vite from $REF ($(cut -c1-9 "$LEGACY/REF")) built at $OUT"
