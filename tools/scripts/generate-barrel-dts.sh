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

# Aways execute npx tsc from repo root to use the local typescript
npx tsc -v
npx tsc -p nativescript-core/tsconfig.barrels.json

FROM="temp/dts-out"
TO="nativescript-core"

mv $FROM/index.d.ts $TO/index.d.ts
mv $FROM/ui/index.d.ts $TO/ui/index.d.ts
mv $FROM/ui/layouts/index.d.ts $TO/ui/layouts/index.d.ts