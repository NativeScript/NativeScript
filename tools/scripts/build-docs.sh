#!/usr/bin/env bash
set -e

ENV="${ENV:-dev}"
DIST_DIR="bin/dist"
TARGET_DIR="$DIST_DIR/snippets"
PACKAGE_VERSION="${PACKAGE_VERSION:-0.0.0}"

archive_dist_dir() {
    DIR="$1"
    (cd "$DIST_DIR" && tar zcvf "nativescript-$DIR-$ENV-$PACKAGE_VERSION.tar.gz" $DIR)
}

npm_install() {
    # Don't install modules twice.

    MARKER_FILE="./node_modules/installed"
    if [ ! -f "$MARKER_FILE" ] ; then
				# Fixes perm issue while installing
				npm i -g npm@^6.13.6
        npm install
        npm install @types/handlebars@4.0.33
        touch "$MARKER_FILE"
    fi
}

extract_snippets() {
    BIN="./node_modules/markdown-snippet-injector/extract.js"

    npm install markdown-snippet-injector

    for SNIPPET_DIR in {apps/automated,apps/toolbox,apps/ui,packages/core} ; do
        echo "Extracting snippets from: $SNIPPET_DIR"
        node "$BIN" --root="$SNIPPET_DIR" --target="$TARGET_DIR" \
            --sourceext=".js|.ts|.xml|.html|.css"
    done

    archive_dist_dir "snippets"
}

extract_apiref() {
    APIREF_DIR="$DIST_DIR/api-reference"
    rm -rf "$APIREF_DIR"

    npm_install
    #npx api-extractor run --config tools/scripts/api-extractor.json --local --verbose && (cd packages/core && cat nativescript-core.header index.d.ts > tmp_file && mv tmp_file nativescript-core.d.ts)
    npx typedoc --tsconfig tools/scripts/tsconfig.typedoc.json

    mv "dist/apiref" "$APIREF_DIR"
    archive_dist_dir "api-reference"
}

rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

if [ "${BASH_SOURCE[0]}" == "$0" ] ; then
    extract_snippets
    extract_apiref
fi
