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
    cd "dist/tns-core-modules"
    
    echo 'Run tsc ...'
    npx tsc

    echo 'NPM packing ...'
    TGZ="$(npm pack)"
    mv "$TGZ" "../$TGZ"
)