// Wire format for `/__ns_dev__/boot-archive` — owned here in the shared
// runtime layer because both sides speak it: the server route serializes
// lines, the device bootstrap parses them.
//
// NDJSON: one JSON object per line. The first line is a `meta` header;
// every following line is a `mod` body. The parser tolerates junk lines, so
// a truncated stream still yields every complete entry.

export const BOOT_ARCHIVE_PATH = '/__ns_dev__/boot-archive';

export type BootArchiveModuleEntry = { url: string; body: string };

export type BootArchiveLine = { kind: 'meta'; version: number; source: string; urls: number } | ({ kind: 'mod' } & BootArchiveModuleEntry);

export function serializeBootArchiveLine(line: BootArchiveLine): string {
	return `${JSON.stringify(line)}\n`;
}

/** Parse NDJSON archive text into `{url, body}` entries for `seedModuleBodies`. */
export function parseBootArchiveText(text: string): BootArchiveModuleEntry[] {
	const entries: BootArchiveModuleEntry[] = [];
	if (typeof text !== 'string' || !text) return entries;
	for (const line of text.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		try {
			const parsed = JSON.parse(trimmed);
			if (parsed && parsed.kind === 'mod' && typeof parsed.url === 'string' && parsed.url && typeof parsed.body === 'string' && parsed.body) {
				entries.push({ url: parsed.url, body: parsed.body });
			}
		} catch {}
	}
	return entries;
}
