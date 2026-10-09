export * from './text-common';

export namespace encoding {
	export const UTF_16LE = 1200; // UTF-16LE
	export const UTF_16BE = 1201; // UTF-16BE
	export const UTF_8 = 65001; // CP_UTF8

	export const US_ASCII = 20127; // US-ASCII
	export const ISO_8859_1 = 28591; // ISO-8859-1

	// UTF-16 on Windows is effectively UTF-16LE.
	export const UTF_16 = UTF_16LE;
}