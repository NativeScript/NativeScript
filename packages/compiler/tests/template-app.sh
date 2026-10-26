#!/bin/zsh
# Compiles an `ns create` template app's stock source (tests/template-ng: `ns create --ng`) as a user's first
# `--compiled` build does: translated with this tree's compiler and core for both platforms, the iOS app built (Release,
# simulator) and the Kotlin compiled (no dex or R8).
#   tests/template-app.sh <fixture> <out> [gradle args…]
# Prints "<fixture> ios: built" and "<fixture> android: compiled", or FAILED with the first errors, and exits 1 on a
# failure. Needs the kits generated and dist/packages/core built (nx run compiler:kit, compiler:kit-android).
# The fixture's node_modules are installed once per package-lock.json into ~/Library/Caches/ns-regress.
F=${1:A}; OUT=$2; shift 2
C=$(cd ${0:A:h}/.. && pwd); ROOT=$(cd $C/../.. && pwd); N=${F:t}
[[ -f $F/package-lock.json && -n $OUT ]] || { echo "usage: template-app.sh <fixture> <out> [gradle args…]"; exit 2; }
[[ -d $ROOT/dist/packages/core ]] || { echo "$N: dist/packages/core not built"; exit 1; }
K=~/Library/Caches/ns-regress/$N-$(cat $F/package-lock.json | shasum | cut -c1-12)
if [[ ! -d $K ]]; then
  rm -rf ~/Library/Caches/ns-regress/$N-*(N); mkdir -p $K.tmp && cp $F/package.json $F/package-lock.json $K.tmp/ &&
    (cd $K.tmp && npm ci --ignore-scripts --no-audit --no-fund > npm.log 2>&1) || { echo "$N: npm ci FAILED"; tail -5 $K.tmp/npm.log; exit 1; }
  mv $K.tmp $K
fi
# Keep $OUT unresolved: under $TMPDIR (/var links to /private/var) the Android project's kit path is checked against a
# symlinked output folder.
W=$OUT/$N/app; rm -rf $OUT/$N; mkdir -p $W && (cd $F && for f in *(N) .*(N); do [[ $f == (node_modules|platforms|hooks) ]] || cp -c -R $f $W/; done)
cp -c -R $K/node_modules $W/ && ln -sfn $C $W/node_modules/@nativescript/compiler
rsync -a --delete $ROOT/dist/packages/core/ $W/node_modules/@nativescript/core/
id=$(grep -oE "id: '[^']+'" $F/nativescript.config.ts | cut -d"'" -f2)
failed=
for p in ios android; do
  log=$OUT/$N-$p.log; build=(); [[ $p == ios ]] && build=(--build)
  if (cd $W && node node_modules/@nativescript/compiler/src/cli.ts $W --platform $p --out $OUT/$N/$p --name ${N//-/} --bundle $id $build > $log 2>&1) &&
    { [[ $p == ios ]] || $C/kit-android/gradlew -p $OUT/$N/android :compileReleaseKotlin --console=plain --quiet "$@" > $OUT/$N-android-compile.log 2>&1 }; then
    echo "$N $p: $([[ $p == ios ]] && echo built || echo compiled)"
  else
    echo "$N $p: FAILED"; failed=1
    e=$(grep -hE "^[^ ]+:[0-9]+:[0-9]+: error:|^e: |SIL verification failed|^Undefined|^ld:|What went wrong" $log $OUT/$N-android-compile.log(N) |
      sed 's|.*/Sources/||;s|.*/src/main/kotlin/||' | awk '!s[$0]++' | cut -c1-250 | head -8)
    [[ -n $e ]] || e=$(grep -hE "^Error: " $log | sed 's|.*/app/src/|src/|' | cut -c1-250 | head -4)
    [[ -n $e ]] || e=$(grep -E "not supported|[Ee]rror" $log | grep -v "the following command failed" | awk '!s[$0]++' | cut -c1-250 | head -8)
    echo "${e:-$(tail -5 $log)}"
  fi
done
[[ -n $KEEP_BUILDS ]] || rm -rf $OUT/$N
[[ -z $failed ]]
