#!/bin/bash

##
# Prepares and packs:
#  - tns-core-modules
# inside dist folder
##

set -x
set -e

DIST=dist;
ROOT_DIR=$(cd `dirname $0` && pwd)/..;
cd "$ROOT_DIR"

DEFAULT_NATIVESCRIPT_CORE_ARGS="../nativescript-core*.tgz --no-save"
NATIVESCRIPT_CORE_ARGS=${NATIVESCRIPT_CORE_ARGS:-$DEFAULT_NATIVESCRIPT_CORE_ARGS}

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

        npm install ${NATIVESCRIPT_CORE_ARGS}
    )
)