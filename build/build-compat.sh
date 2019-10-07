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

## Prepare tns-core-modules

./build/prepare-compat.sh

./build/pack-compat.sh
