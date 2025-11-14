#!/bin/sh

echo "Set exit on simple errors"
set -e

echo "Use dumb gradle terminal"
export TERM=dumb

# Prefer running with JDK 21 for Gradle 8.4+/AGP 8.3+
if [ "$(uname)" = "Darwin" ]; then
  # On macOS, prefer JDK 21, fall back to JDK 17
  if /usr/libexec/java_home -v 21 >/dev/null 2>&1; then
    export JAVA_HOME=$(/usr/libexec/java_home -v 21)
    export PATH="$JAVA_HOME/bin:$PATH"
    echo "Using Java (21) at $JAVA_HOME"
    java -version 2>&1 | head -n 1
  elif /usr/libexec/java_home -v 17 >/dev/null 2>&1; then
    export JAVA_HOME=$(/usr/libexec/java_home -v 17)
    export PATH="$JAVA_HOME/bin:$PATH"
    echo "Using Java (17) at $JAVA_HOME"
    java -version 2>&1 | head -n 1
  else
    echo "Warning: JDK 21 or 17 not found via /usr/libexec/java_home. Using current JAVA_HOME: ${JAVA_HOME:-unset}"
    java -version 2>&1 || true
    echo "Install JDK 21 (preferred) or JDK 17."
  fi
else
  # Non-macOS: print Java version for visibility
  if command -v java >/dev/null 2>&1; then
    echo "Detected Java runtime: $(java -version 2>&1 | head -n 1)"
  else
    echo "Warning: 'java' not found on PATH. Build will likely fail."
  fi
fi

rm -rf dist/package/platforms/android || true
mkdir -p dist/package/platforms/android

echo "Build android"
cd android
./gradlew --quiet assembleRelease
cd ..
cp android/widgets/build/outputs/aar/widgets-release.aar dist/package/platforms/android/widgets-release.aar

if [ "$1" ]
then
  echo "Suffix package.json's version with tag: $1"
  sed -i.bak 's/\(\"version\"\:[[:space:]]*\"[^\"]*\)\"/\1-'$1'"/g' ./dist/package/package.json
fi

if [ "$SKIP_PACK" ]
then
  echo "SKIP pack" 
else
  echo "Copy NPM artefacts"
  cp .npmignore README.md package.json dist/package
  echo "NPM pack"
  cd dist/package
  PACKAGE="$(npm pack)"
  cd ../..
  mv dist/package/$PACKAGE dist/$PACKAGE
  echo "Output: dist/$PACKAGE"
fi