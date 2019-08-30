#!/bin/bash
set -x
set -e

DIST=dist;
ROOT_DIR=$(cd `dirname $0` && pwd)/..;
cd "$ROOT_DIR"

## Prepare tns-core-modules
(
    PACKAGE_SOURCE=tns-core-modules-package;
    PACKAGE=tns-core-modules;

    echo "Clearing $DIST/$PACKAGE"
    npx rimraf "$DIST/$PACKAGE"
    npx rimraf "$DIST/$PACKAGE*.tgz"

    echo "Generating compat package"
    npx ts-node --project ./build/tsconfig.json ./build/generate-tns-compat 

    echo "Copying $PACKAGE_SOURCE $DIST/$PACKAGE..."
    npx ncp "$PACKAGE_SOURCE" "$DIST/$PACKAGE"

    echo "Copying README and LICENSE to $DIST/$PACKAGE"
    npx ncp LICENSE "$DIST"/"$PACKAGE"/LICENSE
      
    (
        echo 'TypeScript transpile...'
        cd "$DIST/$PACKAGE"

        npm install ../nativescript-core*.tgz -s
        npm install ../tns-platform-declarations*.tgz -s
        npx tsc
    )

    (
        echo 'NPM packing ...'
        cd "$DIST/$PACKAGE"

        TGZ="$(npm pack)"
        mv "$TGZ" "../$TGZ"
    )
)