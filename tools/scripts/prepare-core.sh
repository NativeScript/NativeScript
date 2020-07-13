#!/bin/bash

##
# Prepares the tns-platform-declarations and @nativescript/core packages inside dist folder
##

set -x
set -e

DIST=dist;
ROOT_DIR=$(cd `dirname $0` && pwd)/..;
cd "$ROOT_DIR"

mkdir -p "$DIST"

## NPM INSTALL 
(
    echo "NPM install in root of the repo"
    cd "$ROOT_DIR"
    npm install
)

## Prepare Platfrom Declarations
(
    PACKAGE=tns-platform-declarations;

    echo "Clearing $DIST/$PACKAGE"
    npx rimraf "$DIST/$PACKAGE"
    npx rimraf "$DIST/$PACKAGE*.tgz"

    echo "Copying $PACKAGE $DIST/$PACKAGE..."
    npx ncp "$PACKAGE" "$DIST/$PACKAGE"

    echo "Copying README and LICENSE to $DIST/$PACKAGE"
    npx ncp LICENSE "$DIST/$PACKAGE"/LICENSE

    cd "$DIST/$PACKAGE"

    echo 'Running npm install...'
    npm install

    echo 'Running npm test...'
    npm test
)

## Prepare Core Modules
(
    PACKAGE=nativescript-core;

    echo "Clearing $DIST/$PACKAGE"
    npx rimraf "$DIST/$PACKAGE"
    npx rimraf "$DIST/$PACKAGE*.tgz"

    # TODO: restore extractor (need typings to be auto generated)
    # npm run api-extractor-ci

    echo "Copying $PACKAGE $DIST/$PACKAGE..."
    npx ncp "$PACKAGE" "$DIST/$PACKAGE"

    echo "Cleaning inner readme.md-s ..."
    npx rimraf "$DIST/$PACKAGE/**/README.md"
    npx rimraf "$DIST/$PACKAGE/**/Readme.md"

    echo "Copying README and LICENSE to $DIST/$PACKAGE"
    npx ncp LICENSE "$DIST"/"$PACKAGE"/LICENSE
    npx ncp README.md "$DIST"/"$PACKAGE"/README.md

    (
        cd "$DIST/$PACKAGE"
        npm install
    )
    
    # Aways execute npx tsc from repo root to use the local typescript
    echo 'TypeScript transpile...'
    npx tsc -v
    npx tsc -p "$DIST/$PACKAGE"

    echo "Clearing typescript definitions from private APIs..."
    npx ts-node --project ./build/tsconfig.json build/clear-private-definitions "$DIST/$PACKAGE"
)
