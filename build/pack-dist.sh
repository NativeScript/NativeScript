#!/bin/bash
set -x
set -e

DIST=dist;
ROOT_DIR=$(cd `dirname $0` && pwd)/..;
cd "$ROOT_DIR"

(
    cd "$DIST/tns-platform-declarations"
    TGZ="$(npm pack)"
    mv "$TGZ" "../$TGZ"
)

(
    cd "$DIST/tns-core-modules"
    TGZ="$(npm pack)"
    mv "$TGZ" "../$TGZ"
)