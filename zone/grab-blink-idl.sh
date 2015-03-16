#!/bin/bash

echo "this is gonna take a bit" &&\
svn co https://src.chromium.org/blink/trunk/Source/core/ blink-core &&\
mkdir blink-idl &&\
mv `find blink-core -name *.idl` blink-idl &&\
rm -rf bink-core &&\
rm blink-idl/InspectorInstrumentation.idl # <-- "The code below is not a correct IDL but a mix of IDL and C++." ಠ_ಠ
