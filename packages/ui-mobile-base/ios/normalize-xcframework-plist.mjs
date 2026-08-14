#!/usr/bin/env node
// Re-sorts the AvailableLibraries entries in an XCFramework Info.plist by
// LibraryIdentifier so the file is stable across builds (xcodebuild emits them
// in a non-deterministic order).
//
// Parsing/serialization is handled by the `plist` package. Its serializer nests
// the root <dict> one level under <plist> and omits the trailing newline, so we
// apply a whitespace-only postprocess (drop one indent level, add the final
// newline) to reproduce Apple's canonical layout byte-for-byte.
//
// Usage: node normalize-xcframework-plist.mjs <path-to-Info.plist>
import { build, parse } from 'plist';
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
	console.error('Usage: normalize-xcframework-plist.mjs <path-to-Info.plist>');
	process.exit(1);
}

const data = parse(readFileSync(file, 'utf8'));
data.AvailableLibraries.sort((a, b) => a.LibraryIdentifier.localeCompare(b.LibraryIdentifier));

let xml = build(data, { indent: '\t', newline: '\n' });
// xmlbuilder indents the root <dict> one level under <plist>; Apple keeps it at
// column 0. Remove one leading tab from every line and ensure a trailing newline.
xml = xml.replace(/^\t/gm, '');
if (!xml.endsWith('\n')) xml += '\n';

writeFileSync(file, xml);
