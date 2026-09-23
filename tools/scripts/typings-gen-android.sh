#!/usr/bin/env bash
set -euo pipefail

SCRIPT_NAME=$(basename "$0")
REPO_ROOT=$(cd "$(dirname "$0")/../.." && pwd)
TYPES_DIR="$REPO_ROOT/packages/types-android/src/lib"
SDK_ROOT=${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}
TAB=$'\t'

RUNTIME_VERSION=latest
GENERATOR_JAR=
OUT_LEVEL=
ANDROIDX_REF=androidx-32
NAME=
SET_DEFAULT=false
NULLABLE_UNKNOWN_TYPES=false
API_VERSIONS=
API_VERSIONS_ON=false
MIN_SDK=21
MERGE_CLASS_VERSIONS=auto
KEEP_RAW=
USE_ALL=false
SPECS=()

usage() {
	cat <<USAGE
Generates @nativescript/types-android platform typings with the dts-generator
shipped inside @nativescript/android.

Usage:
  ./$SCRIPT_NAME [options] <platform>...

Each <platform> selects one android.jar to generate from, and may be:
  36              an API level; the highest installed platforms/android-36* wins
  android-37.1    an exact platform directory under \$ANDROID_HOME/platforms
  31..36          every installed platform whose API level falls in the range
  path/to/x.jar   an explicit jar

Passing more than one platform merges them into a single set of typings: the
newest jar describes each class, and older jars fill back in the members that
newer platforms dropped. Types are emitted for the highest level given.

Options:
  -r, --runtime <version>   @nativescript/android version to take the generator
                            from (default: $RUNTIME_VERSION). Use 'next' for the
                            latest generator.
  -g, --generator <jar>     Use this dts-generator.jar instead of downloading one.
  -n, --name <basename>     Name the emitted files android-<basename>.d.ts and
                            android-platform-<basename>.d.ts. Defaults to the
                            highest API level, or <lowest>-<highest>-merged when
                            several platforms are merged, so that a merged and an
                            unmerged set live side by side without colliding.
  -l, --level <n>           API level to assume for a jar whose path does not
                            reveal one, and the level an unmerged set is named
                            for (default: the highest level given).
      --set-default         Point lib/android.d.ts, which the package ships as
                            its entry, at what this run emitted.
      --all                 Generate from every platform installed in the SDK.
      --nullable-unknown-types
                            Treat reference types carrying neither @Nullable nor
                            @NonNull as nullable. The default is the conservative
                            pass, which only unions null onto types known to be
                            nullable and onto Kotlin declarations.
      --api-versions[=<file>]
                            Annotate the typings with @since and @deprecated read from an
                            Android platform's data/api-versions.xml. Without a path the
                            newest platform being generated from supplies the file. A
                            merged set needs this to say which members no current platform
                            has any more; a "@deprecated Removed in API N" is a member that
                            is gone, not merely discouraged. Needs a dts-generator that
                            understands --api-versions; pair it with --runtime next.
      --min-sdk <n>         Lowest API level worth an @since, since everything at or below
                            it is always present (default: $MIN_SDK). Only used together
                            with --api-versions.
      --no-merge            Do not merge class versions; the first jar alone
                            describes each class.
      --androidx <name>     androidx typings to reference (default: $ANDROIDX_REF).
      --sdk-root <dir>      Android SDK root (default: \$ANDROID_HOME, then
                            \$ANDROID_SDK_ROOT, then ~/Library/Android/sdk).
      --keep-raw <dir>      Also keep the generator's untouched output here.
  -h, --help                Print this message.

Examples:
  ./$SCRIPT_NAME 37
  ./$SCRIPT_NAME --runtime next android-37.1 36 35

  The two sets the package ships, the merged one being the default:
  ./$SCRIPT_NAME --runtime next --all --set-default   # android-21-37-merged.d.ts
  ./$SCRIPT_NAME --runtime next 37                    # android-37.d.ts
USAGE
}

die() {
	printf 'error: %s\n' "$1" >&2
	exit 1
}

assert_level() {
	case "$1" in
		'' | *[!0-9]*) die "$2 is not an API level" ;;
	esac
}

# "<level> <platform-dir>" for every numeric platform in the SDK that has a jar.
installed_platforms() {
	local jar dir version
	for jar in "$SDK_ROOT"/platforms/*/android.jar; do
		[ -f "$jar" ] || continue
		dir=$(dirname "$jar")
		version=$(basename "$dir")
		version=${version#android-}
		case "$version" in
			'' | *[!0-9.]*) continue ;;
		esac
		printf '%s %s\n' "${version%%.*}" "$dir"
	done
}

# "<level><TAB><sort-key><TAB><jar>" for one platform directory.
emit_platform() {
	local dir=$1 version
	version=$(basename "$dir")
	version=${version#android-}
	printf '%s\t%s\t%s\n' "${version%%.*}" "$version" "$dir/android.jar"
}

resolve_spec() {
	local spec=$1 from to level dir found=false

	case "$spec" in
		*.jar)
			[ -f "$spec" ] || die "\"$spec\" does not exist"
			level=$(basename "$(dirname "$spec")")
			level=${level#android-}
			level=${level%%.*}
			case "$level" in
				'' | *[!0-9]*)
					[ -n "$OUT_LEVEL" ] || die "cannot tell the API level of \"$spec\"; pass --level"
					level=$OUT_LEVEL
					;;
			esac
			printf '%s\t%s\t%s\n' "$level" "$level" "$spec"
			;;
		*..*)
			from=${spec%%..*}
			to=${spec##*..}
			assert_level "$from" "\"$from\" in \"$spec\""
			assert_level "$to" "\"$to\" in \"$spec\""
			[ "$from" -le "$to" ] || die "\"$spec\" is an empty range"
			while read -r level dir; do
				[ -n "$dir" ] || continue
				if [ "$level" -ge "$from" ] && [ "$level" -le "$to" ]; then
					emit_platform "$dir"
					found=true
				fi
			done < <(installed_platforms)
			$found || die "no platform in \"$spec\" is installed under $SDK_ROOT/platforms"
			;;
		android-*)
			dir="$SDK_ROOT/platforms/$spec"
			[ -f "$dir/android.jar" ] || die "\"$dir/android.jar\" does not exist. Install it with: sdkmanager \"platforms;$spec\""
			emit_platform "$dir"
			;;
		*[!0-9]* | '')
			die "\"$spec\" is neither an API level, a platform directory, a range, nor a jar"
			;;
		*)
			# A bare API level: the highest installed directory for it wins, so
			# that 37 finds android-37.1 without having to be told about it.
			dir=$(installed_platforms | awk -v level="$spec" '$1 == level { print $2 }' | sort -V | tail -1)
			[ -n "$dir" ] || die "no platform for API level $spec is installed. Install one with: sdkmanager \"platforms;android-$spec\""
			emit_platform "$dir"
			;;
	esac
}

while [ $# -gt 0 ]; do
	option=$1
	shift
	value=
	has_value=false
	case "$option" in
		--*=*)
			value=${option#*=}
			option=${option%%=*}
			has_value=true
			;;
	esac
	case "$option" in
		-r | --runtime | -g | --generator | -l | --level | -n | --name | --androidx | --sdk-root | --keep-raw | --min-sdk)
			if ! $has_value; then
				[ $# -gt 0 ] || die "$option requires a value"
				value=$1
				shift
			fi
			;;
	esac
	case "$option" in
		-h | --help)
			usage
			exit 0
			;;
		-r | --runtime) RUNTIME_VERSION=$value ;;
		-g | --generator) GENERATOR_JAR=$value ;;
		-l | --level)
			assert_level "$value" "--level $value"
			OUT_LEVEL=$value
			;;
		-n | --name)
			case "$value" in
				'' | *[!A-Za-z0-9.-]*) die "--name $value is not a name" ;;
			esac
			NAME=$value
			;;
		--set-default) SET_DEFAULT=true ;;
		--androidx) ANDROIDX_REF=$value ;;
		--sdk-root) SDK_ROOT=$value ;;
		--keep-raw) KEEP_RAW=$value ;;
		--all) USE_ALL=true ;;
		--api-versions)
			# The path is optional, so it is only ever given as --api-versions=<file>;
			# a bare --api-versions takes the file from the newest platform resolved.
			API_VERSIONS_ON=true
			if $has_value; then
				[ -f "$value" ] || die "\"$value\" does not exist"
				API_VERSIONS=$value
			fi
			;;
		--min-sdk)
			assert_level "$value" "--min-sdk $value"
			[ "$value" -ge 1 ] || die "--min-sdk $value is not an API level"
			MIN_SDK=$value
			;;
		--nullable-unknown-types) NULLABLE_UNKNOWN_TYPES=true ;;
		--no-merge) MERGE_CLASS_VERSIONS=false ;;
		-*) die "unknown option: $option" ;;
		*)
			case "$option" in
				*..*) ;;
				*.*.*) die "\"$option\" looks like an npm version; pass it as --runtime $option" ;;
			esac
			SPECS+=("$option")
			;;
	esac
done

if [ ${#SPECS[@]} -eq 0 ] && ! $USE_ALL; then
	usage >&2
	exit 1
fi

if [ -n "$GENERATOR_JAR" ] && [ ! -f "$GENERATOR_JAR" ]; then
	die "\"$GENERATOR_JAR\" does not exist"
fi

RESOLVED=
if $USE_ALL; then
	while read -r _ dir; do
		[ -n "$dir" ] || continue
		RESOLVED="$RESOLVED$(emit_platform "$dir")
"
	done < <(installed_platforms)
	[ -n "$RESOLVED" ] || die "no platforms are installed under $SDK_ROOT/platforms"
fi
for spec in ${SPECS[@]+"${SPECS[@]}"}; do
	RESOLVED="$RESOLVED$(resolve_spec "$spec")
"
done

# Newest first: with --merge-class-versions the leading jar is the one each
# class is described from, and the rest only fill in what it no longer has.
RESOLVED=$(printf '%s' "$RESOLVED" | grep . | sort -t"$TAB" -k2,2rV -u)
[ -n "$RESOLVED" ] || die "no platforms resolved"

JARS=()
MIN_LEVEL=
MAX_LEVEL=
while IFS="$TAB" read -r level _ jar; do
	JARS+=("$jar")
	if [ -z "$MAX_LEVEL" ] || [ "$level" -gt "$MAX_LEVEL" ]; then
		MAX_LEVEL=$level
	fi
	if [ -z "$MIN_LEVEL" ] || [ "$level" -lt "$MIN_LEVEL" ]; then
		MIN_LEVEL=$level
	fi
done <<< "$RESOLVED"
OUT_LEVEL=${OUT_LEVEL:-$MAX_LEVEL}

# The newest platform describes every level below it, so its file is the one to read.
if $API_VERSIONS_ON && [ -z "$API_VERSIONS" ]; then
	API_VERSIONS="$(dirname "${JARS[0]}")/data/api-versions.xml"
	if [ ! -f "$API_VERSIONS" ]; then
		die "\"$API_VERSIONS\" does not exist. It ships in a platform's data directory, which a
       trimmed-down SDK often does not keep. Reinstall that platform with
       sdkmanager \"platforms;$(basename "$(dirname "${JARS[0]}")")\", or point at another
       platform's copy with --api-versions=<file>."
	fi
fi

if [ "$MERGE_CLASS_VERSIONS" = auto ]; then
	if [ ${#JARS[@]} -gt 1 ]; then MERGE_CLASS_VERSIONS=true; else MERGE_CLASS_VERSIONS=false; fi
fi

# A merged set is named for the span it covers, so that it never collides with
# the unmerged set for the same level.
if [ -z "$NAME" ]; then
	if ! $MERGE_CLASS_VERSIONS; then
		NAME=$OUT_LEVEL
	elif [ "$MIN_LEVEL" = "$MAX_LEVEL" ]; then
		NAME="$MAX_LEVEL-merged"
	else
		NAME="$MIN_LEVEL-$MAX_LEVEL-merged"
	fi
fi

WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT

if [ -z "$GENERATOR_JAR" ]; then
	echo "Extracting dts-generator from @nativescript/android@$RUNTIME_VERSION..."
	(cd "$WORK_DIR" && npm pack "@nativescript/android@$RUNTIME_VERSION" --silent > /dev/null && tar -xzf ./*.tgz package/framework/build-tools/dts-generator.jar)
	GENERATOR_JAR="$WORK_DIR/package/framework/build-tools/dts-generator.jar"
fi

GENERATOR_ARGS=(--input "${JARS[@]}" --output "$WORK_DIR/out")
if $MERGE_CLASS_VERSIONS; then GENERATOR_ARGS+=(--merge-class-versions); fi
if $NULLABLE_UNKNOWN_TYPES; then GENERATOR_ARGS+=(--nullable-unknown-types); fi
if [ -n "$API_VERSIONS" ]; then GENERATOR_ARGS+=(--api-versions "$API_VERSIONS" --min-sdk "$MIN_SDK"); fi

echo "Generating typings for API level $OUT_LEVEL from:"
printf '  %s\n' "${JARS[@]}"
if [ -n "$API_VERSIONS" ]; then echo "Annotating from $API_VERSIONS (--min-sdk $MIN_SDK)"; fi
java -jar "$GENERATOR_JAR" "${GENERATOR_ARGS[@]}"

if [ -n "$KEEP_RAW" ]; then
	mkdir -p "$KEEP_RAW"
	cp -R "$WORK_DIR/out/." "$KEEP_RAW/"
	echo "Kept the generator's output in $KEEP_RAW"
fi

echo "Emitting (android/android-platform-$NAME.d.ts)..."
node "$REPO_ROOT/tools/scripts/typings-to-literal-types.mjs" "$WORK_DIR/out/android.d.ts" "$TYPES_DIR/android/android-platform-$NAME.d.ts"

echo "Emitting (android-$NAME.d.ts)..."
printf '/// <reference path="./android/android-platform-%s.d.ts" />\n/// <reference path="./android/%s.d.ts" />\n/// <reference path="./android/common.d.ts" />\n' "$NAME" "$ANDROIDX_REF" > "$TYPES_DIR/android-$NAME.d.ts"

if $SET_DEFAULT; then
	echo "Emitting (android.d.ts)..."
	printf '/// <reference path="./android-%s.d.ts" />\n' "$NAME" > "$TYPES_DIR/android.d.ts"
fi
