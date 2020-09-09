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
    
    # Aways execute npx tsc from repo root to use the local typescript
    echo 'TypeScript transpile...'
    npx tsc -v
    npx tsc -p "dist/tns-core-modules" 


    echo 'NPM packing ...'
    cd "dist/tns-core-modules"
    TGZ="$(npm pack)"
    mv "$TGZ" "../$TGZ"
)