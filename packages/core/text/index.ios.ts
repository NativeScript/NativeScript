export * from './text-common';

export module encoding {
	export const ISO_8859_1 = 5; //NSISOLatin1StringEncoding
	export const US_ASCII = 1; //NSASCIIStringEncoding
	export const UTF_16 = 10; //NSUnicodeStringEncoding
	export const UTF_16BE = 0x90000100; //NSUTF16BigEndianStringEncoding
	export const UTF_16LE = 0x94000100; //NSUTF16LittleEndianStringEncoding
	export const UTF_8 = 4; //NSUTF8StringEncoding
}
