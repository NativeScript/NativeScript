#!/bin/bash

##
# Packs:
#  - tns-core-modules
# inside dist folder
##

set -x
set -e

## Pack tns-core-modules
(
    echo 'Run tsc ...'
    npx tsc

    echo 'NPM packing ...'
    cd "dist/tns-core-modules"

    TGZ="$(npm pack)"
    mv "$TGZ" "../$TGZ"
)