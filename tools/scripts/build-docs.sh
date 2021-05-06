#!/usr/bin/env bash
set -e

ENV="${ENV:-dev}"
DIST_DIR="bin/dist"
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

extract_apiref() {
    APIREF_DIR="$DIST_DIR/api-reference"
    rm -rf "$APIREF_DIR"

#    npm_install
    npx typedoc --tsconfig tools/scripts/tsconfig.typedoc.json

    mv "dist/apiref" "$APIREF_DIR"
    archive_dist_dir "api-reference"
}

if [ "${BASH_SOURCE[0]}" == "$0" ] ; then
    extract_apiref
fi
