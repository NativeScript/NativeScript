#!/bin/bash

##
# Prepares and packs:
#  - tns-platform-declarations
#  - @nativescript/core packages 
# inside dist folder
##

set -x
set -e

DIST=dist;
ROOT_DIR=$(cd `dirname $0` && pwd)/..;
cd "$ROOT_DIR"

./build/prepare-core.sh
./build/pack-core.sh