
declare const enum DYLD_BOOL {

	FALSE = 0,

	TRUE = 1
}

interface NSLinkEditErrorHandlers {
	undefined: interop.FunctionReference<(p1: string) => void>;
	multiple: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Pointer) => interop.Pointer>;
	linkEdit: interop.FunctionReference<(p1: NSLinkEditErrors, p2: number, p3: string, p4: string) => void>;
}
declare var NSLinkEditErrorHandlers: interop.StructType<NSLinkEditErrorHandlers>;

declare const enum NSLinkEditErrors {

	FileAccessError = 0,

	FileFormatError = 1,

	MachResourceError = 2,

	UnixResourceError = 3,

	OtherError = 4,

	WarningError = 5,

	MultiplyDefinedError = 6,

	UndefinedError = 7
}

declare const enum NSObjectFileImageReturnCode {

	Failure = 0,

	Success = 1,

	InappropriateFile = 2,

	Arch = 3,

	Format = 4,

	Access = 5
}

declare const enum NSOtherErrorNumbers {

	Relocation = 0,

	LazyBind = 1,

	IndrLoop = 2,

	LazyInit = 3,

	InvalidArgs = 4
}

declare function NSVersionOfLinkTimeLibrary(libraryName: string): number;

declare function NSVersionOfRunTimeLibrary(libraryName: string): number;

interface NXArchInfo {
	name: string;
	cputype: number;
	cpusubtype: number;
	byteorder: NXByteOrder;
	description: string;
}
declare var NXArchInfo: interop.StructType<NXArchInfo>;

declare function NXCombineCpuSubtypes(cputype: number, cpusubtype1: number, cpusubtype2: number): number;

declare function NXFindBestFatArch(cputype: number, cpusubtype: number, fat_archs: interop.Reference<fat_arch>, nfat_archs: number): interop.Reference<fat_arch>;

declare function NXGetAllArchInfos(): interop.Reference<NXArchInfo>;

declare function NXGetArchInfoFromCpuType(cputype: number, cpusubtype: number): interop.Reference<NXArchInfo>;

declare function NXGetArchInfoFromName(name: string): interop.Reference<NXArchInfo>;

declare function NXGetLocalArchInfo(): interop.Reference<NXArchInfo>;

declare function _NSGetExecutablePath(buf: string, bufsize: interop.Reference<number>): number;

declare function _dyld_get_image_header(image_index: number): interop.Reference<mach_header>;

declare function _dyld_get_image_name(image_index: number): string;

declare function _dyld_get_image_vmaddr_slide(image_index: number): number;

declare function _dyld_image_count(): number;

declare function _dyld_register_func_for_add_image(func: interop.FunctionReference<(p1: interop.Reference<mach_header>, p2: number) => void>): void;

declare function _dyld_register_func_for_remove_image(func: interop.FunctionReference<(p1: interop.Reference<mach_header>, p2: number) => void>): void;

declare var _mh_bundle_header: mach_header;

declare var _mh_dylib_header: mach_header;

declare var _mh_dylinker_header: mach_header;

declare var _mh_execute_header: mach_header;

interface data_in_code_entry {
	offset: number;
	length: number;
	kind: number;
}
declare var data_in_code_entry: interop.StructType<data_in_code_entry>;

interface dyld_all_image_infos {
	version: number;
	infoArrayCount: number;
	infoArray: interop.Reference<dyld_image_info>;
	notification: interop.FunctionReference<(p1: dyld_image_mode, p2: number, p3: interop.Reference<dyld_image_info>) => void>;
	processDetachedFromSharedRegion: boolean;
	libSystemInitialized: boolean;
	dyldImageLoadAddress: interop.Reference<mach_header>;
	jitInfo: interop.Pointer;
	dyldVersion: string;
	errorMessage: string;
	terminationFlags: number;
	coreSymbolicationShmPage: interop.Pointer;
	systemOrderFlag: number;
	uuidArrayCount: number;
	uuidArray: interop.Reference<dyld_uuid_info>;
	dyldAllImageInfosAddress: interop.Reference<dyld_all_image_infos>;
	initialImageCount: number;
	errorKind: number;
	errorClientOfDylibPath: string;
	errorTargetDylibPath: string;
	errorSymbol: string;
	sharedCacheSlide: number;
	sharedCacheUUID: interop.Reference<number>;
	reserved: interop.Reference<number>;
}
declare var dyld_all_image_infos: interop.StructType<dyld_all_image_infos>;

interface dyld_image_info {
	imageLoadAddress: interop.Reference<mach_header>;
	imageFilePath: string;
	imageFileModDate: number;
}
declare var dyld_image_info: interop.StructType<dyld_image_info>;

declare const enum dyld_image_mode {

	dyld_image_adding = 0,

	dyld_image_removing = 1,

	dyld_image_info_change = 2
}

interface dyld_info_command {
	cmd: number;
	cmdsize: number;
	rebase_off: number;
	rebase_size: number;
	bind_off: number;
	bind_size: number;
	weak_bind_off: number;
	weak_bind_size: number;
	lazy_bind_off: number;
	lazy_bind_size: number;
	export_off: number;
	export_size: number;
}
declare var dyld_info_command: interop.StructType<dyld_info_command>;

declare var dyld_shared_cache_ranges: dyld_shared_cache_rangesStruct;

interface dyld_shared_cache_rangesStruct {
	sharedRegionsCount: number;
	ranges: interop.Reference<{ start: number; length: number; }>;
}
declare var dyld_shared_cache_rangesStruct: interop.StructType<dyld_shared_cache_rangesStruct>;

interface dyld_uuid_info {
	imageLoadAddress: interop.Reference<mach_header>;
	imageUUID: interop.Reference<number>;
}
declare var dyld_uuid_info: interop.StructType<dyld_uuid_info>;

interface dylib_module {
	module_name: number;
	iextdefsym: number;
	nextdefsym: number;
	irefsym: number;
	nrefsym: number;
	ilocalsym: number;
	nlocalsym: number;
	iextrel: number;
	nextrel: number;
	iinit_iterm: number;
	ninit_nterm: number;
	objc_module_info_addr: number;
	objc_module_info_size: number;
}
declare var dylib_module: interop.StructType<dylib_module>;

interface dylib_module_64 {
	module_name: number;
	iextdefsym: number;
	nextdefsym: number;
	irefsym: number;
	nrefsym: number;
	ilocalsym: number;
	nlocalsym: number;
	iextrel: number;
	nextrel: number;
	iinit_iterm: number;
	ninit_nterm: number;
	objc_module_info_size: number;
	objc_module_info_addr: number;
}
declare var dylib_module_64: interop.StructType<dylib_module_64>;

interface dylib_reference {
	isym: number;
	flags: number;
}
declare var dylib_reference: interop.StructType<dylib_reference>;

interface dylib_table_of_contents {
	symbol_index: number;
	module_index: number;
}
declare var dylib_table_of_contents: interop.StructType<dylib_table_of_contents>;

interface dysymtab_command {
	cmd: number;
	cmdsize: number;
	ilocalsym: number;
	nlocalsym: number;
	iextdefsym: number;
	nextdefsym: number;
	iundefsym: number;
	nundefsym: number;
	tocoff: number;
	ntoc: number;
	modtaboff: number;
	nmodtab: number;
	extrefsymoff: number;
	nextrefsyms: number;
	indirectsymoff: number;
	nindirectsyms: number;
	extreloff: number;
	nextrel: number;
	locreloff: number;
	nlocrel: number;
}
declare var dysymtab_command: interop.StructType<dysymtab_command>;

interface encryption_info_command {
	cmd: number;
	cmdsize: number;
	cryptoff: number;
	cryptsize: number;
	cryptid: number;
}
declare var encryption_info_command: interop.StructType<encryption_info_command>;

interface encryption_info_command_64 {
	cmd: number;
	cmdsize: number;
	cryptoff: number;
	cryptsize: number;
	cryptid: number;
	pad: number;
}
declare var encryption_info_command_64: interop.StructType<encryption_info_command_64>;

interface entry_point_command {
	cmd: number;
	cmdsize: number;
	entryoff: number;
	stacksize: number;
}
declare var entry_point_command: interop.StructType<entry_point_command>;

interface fat_arch {
	cputype: number;
	cpusubtype: number;
	offset: number;
	size: number;
	align: number;
}
declare var fat_arch: interop.StructType<fat_arch>;

interface fat_header {
	magic: number;
	nfat_arch: number;
}
declare var fat_header: interop.StructType<fat_header>;

declare function get_edata(): number;

declare function get_end(): number;

declare function get_etext(): number;

declare function getsectbyname(segname: string, sectname: string): interop.Reference<section>;

declare function getsectbynamefromheader(mhp: interop.Reference<mach_header>, segname: string, sectname: string): interop.Reference<section>;

declare function getsectbynamefromheader_64(mhp: interop.Reference<mach_header_64>, segname: string, sectname: string): interop.Reference<section_64>;

declare function getsectbynamefromheaderwithswap(mhp: interop.Reference<mach_header>, segname: string, sectname: string, fSwap: number): interop.Reference<section>;

declare function getsectbynamefromheaderwithswap_64(mhp: interop.Reference<mach_header_64>, segname: string, sectname: string, fSwap: number): interop.Reference<section>;

declare function getsectdata(segname: string, sectname: string, size: interop.Reference<number>): string;

declare function getsectdatafromFramework(FrameworkName: string, segname: string, sectname: string, size: interop.Reference<number>): string;

declare function getsectdatafromheader(mhp: interop.Reference<mach_header>, segname: string, sectname: string, size: interop.Reference<number>): string;

declare function getsectdatafromheader_64(mhp: interop.Reference<mach_header_64>, segname: string, sectname: string, size: interop.Reference<number>): string;

declare function getsectiondata(mhp: interop.Reference<mach_header>, segname: string, sectname: string, size: interop.Reference<number>): string;

declare function getsegbyname(segname: string): interop.Reference<segment_command>;

declare function getsegmentdata(mhp: interop.Reference<mach_header>, segname: string, size: interop.Reference<number>): string;

interface ident_command {
	cmd: number;
	cmdsize: number;
}
declare var ident_command: interop.StructType<ident_command>;

interface linkedit_data_command {
	cmd: number;
	cmdsize: number;
	dataoff: number;
	datasize: number;
}
declare var linkedit_data_command: interop.StructType<linkedit_data_command>;

interface linker_option_command {
	cmd: number;
	cmdsize: number;
	count: number;
}
declare var linker_option_command: interop.StructType<linker_option_command>;

interface load_command {
	cmd: number;
	cmdsize: number;
}
declare var load_command: interop.StructType<load_command>;

interface mach_header {
	magic: number;
	cputype: number;
	cpusubtype: number;
	filetype: number;
	ncmds: number;
	sizeofcmds: number;
	flags: number;
}
declare var mach_header: interop.StructType<mach_header>;

interface mach_header_64 {
	magic: number;
	cputype: number;
	cpusubtype: number;
	filetype: number;
	ncmds: number;
	sizeofcmds: number;
	flags: number;
	reserved: number;
}
declare var mach_header_64: interop.StructType<mach_header_64>;

interface prebind_cksum_command {
	cmd: number;
	cmdsize: number;
	cksum: number;
}
declare var prebind_cksum_command: interop.StructType<prebind_cksum_command>;

declare const enum reloc_type_generic {

	GENERIC_RELOC_VANILLA = 0,

	GENERIC_RELOC_PAIR = 1,

	GENERIC_RELOC_SECTDIFF = 2,

	GENERIC_RELOC_PB_LA_PTR = 3,

	GENERIC_RELOC_LOCAL_SECTDIFF = 4,

	GENERIC_RELOC_TLV = 5
}

interface relocation_info {
	r_address: number;
	r_symbolnum: number;
	r_pcrel: number;
	r_length: number;
	r_extern: number;
	r_type: number;
}
declare var relocation_info: interop.StructType<relocation_info>;

interface routines_command {
	cmd: number;
	cmdsize: number;
	init_address: number;
	init_module: number;
	reserved1: number;
	reserved2: number;
	reserved3: number;
	reserved4: number;
	reserved5: number;
	reserved6: number;
}
declare var routines_command: interop.StructType<routines_command>;

interface routines_command_64 {
	cmd: number;
	cmdsize: number;
	init_address: number;
	init_module: number;
	reserved1: number;
	reserved2: number;
	reserved3: number;
	reserved4: number;
	reserved5: number;
	reserved6: number;
}
declare var routines_command_64: interop.StructType<routines_command_64>;

interface scattered_relocation_info {
	r_address: number;
	r_type: number;
	r_length: number;
	r_pcrel: number;
	r_scattered: number;
	r_value: number;
}
declare var scattered_relocation_info: interop.StructType<scattered_relocation_info>;

interface section {
	sectname: interop.Reference<number>;
	segname: interop.Reference<number>;
	addr: number;
	size: number;
	offset: number;
	align: number;
	reloff: number;
	nreloc: number;
	flags: number;
	reserved1: number;
	reserved2: number;
}
declare var section: interop.StructType<section>;

interface section_64 {
	sectname: interop.Reference<number>;
	segname: interop.Reference<number>;
	addr: number;
	size: number;
	offset: number;
	align: number;
	reloff: number;
	nreloc: number;
	flags: number;
	reserved1: number;
	reserved2: number;
	reserved3: number;
}
declare var section_64: interop.StructType<section_64>;

interface segment_command {
	cmd: number;
	cmdsize: number;
	segname: interop.Reference<number>;
	vmaddr: number;
	vmsize: number;
	fileoff: number;
	filesize: number;
	maxprot: number;
	initprot: number;
	nsects: number;
	flags: number;
}
declare var segment_command: interop.StructType<segment_command>;

interface segment_command_64 {
	cmd: number;
	cmdsize: number;
	segname: interop.Reference<number>;
	vmaddr: number;
	vmsize: number;
	fileoff: number;
	filesize: number;
	maxprot: number;
	initprot: number;
	nsects: number;
	flags: number;
}
declare var segment_command_64: interop.StructType<segment_command_64>;

interface source_version_command {
	cmd: number;
	cmdsize: number;
	version: number;
}
declare var source_version_command: interop.StructType<source_version_command>;

declare function swap_dyld_info_command(ed: interop.Reference<dyld_info_command>, target_byte_sex: NXByteOrder): void;

declare function swap_dylib_module(mods: interop.Reference<dylib_module>, nmods: number, target_byte_sex: NXByteOrder): void;

declare function swap_dylib_module_64(mods: interop.Reference<dylib_module_64>, nmods: number, target_byte_sex: NXByteOrder): void;

declare function swap_dylib_reference(refs: interop.Reference<dylib_reference>, nrefs: number, target_byte_sex: NXByteOrder): void;

declare function swap_dylib_table_of_contents(tocs: interop.Reference<dylib_table_of_contents>, ntocs: number, target_byte_sex: NXByteOrder): void;

declare function swap_dysymtab_command(dyst: interop.Reference<dysymtab_command>, target_byte_sex: NXByteOrder): void;

declare function swap_encryption_command(ec: interop.Reference<encryption_info_command>, target_byte_sex: NXByteOrder): void;

declare function swap_encryption_command_64(ec: interop.Reference<encryption_info_command_64>, target_byte_sex: NXByteOrder): void;

declare function swap_entry_point_command(ep: interop.Reference<entry_point_command>, target_byte_sex: NXByteOrder): void;

declare function swap_fat_arch(fat_archs: interop.Reference<fat_arch>, nfat_arch: number, target_byte_order: NXByteOrder): void;

declare function swap_fat_header(fat_header: interop.Reference<fat_header>, target_byte_order: NXByteOrder): void;

declare function swap_ident_command(ident: interop.Reference<ident_command>, target_byte_order: NXByteOrder): void;

declare function swap_indirect_symbols(indirect_symbols: interop.Reference<number>, nindirect_symbols: number, target_byte_sex: NXByteOrder): void;

declare function swap_linkedit_data_command(ld: interop.Reference<linkedit_data_command>, target_byte_sex: NXByteOrder): void;

declare function swap_linker_option_command(lo: interop.Reference<linker_option_command>, target_byte_sex: NXByteOrder): void;

declare function swap_load_command(lc: interop.Reference<load_command>, target_byte_order: NXByteOrder): void;

declare function swap_mach_header(mh: interop.Reference<mach_header>, target_byte_order: NXByteOrder): void;

declare function swap_mach_header_64(mh: interop.Reference<mach_header_64>, target_byte_order: NXByteOrder): void;

declare function swap_prebind_cksum_command(cksum_cmd: interop.Reference<prebind_cksum_command>, target_byte_sex: NXByteOrder): void;

declare function swap_prebind_cksum_commandFunction(cksum_cmd: interop.Reference<prebind_cksum_command>, target_byte_sex: NXByteOrder): void;

declare function swap_relocation_info(relocs: interop.Reference<relocation_info>, nrelocs: number, target_byte_order: NXByteOrder): void;

declare function swap_routines_command(r_cmd: interop.Reference<routines_command>, target_byte_sex: NXByteOrder): void;

declare function swap_routines_command_64(r_cmd: interop.Reference<routines_command_64>, target_byte_sex: NXByteOrder): void;

declare function swap_section(s: interop.Reference<section>, nsects: number, target_byte_order: NXByteOrder): void;

declare function swap_section_64(s: interop.Reference<section_64>, nsects: number, target_byte_order: NXByteOrder): void;

declare function swap_segment_command(sg: interop.Reference<segment_command>, target_byte_order: NXByteOrder): void;

declare function swap_segment_command_64(sg: interop.Reference<segment_command_64>, target_byte_order: NXByteOrder): void;

declare function swap_source_version_command(sv: interop.Reference<source_version_command>, target_byte_sex: NXByteOrder): void;

declare function swap_symseg_command(ss: interop.Reference<symseg_command>, target_byte_order: NXByteOrder): void;

declare function swap_symtab_command(st: interop.Reference<symtab_command>, target_byte_order: NXByteOrder): void;

declare function swap_thread_command(ut: interop.Reference<thread_command>, target_byte_order: NXByteOrder): void;

declare function swap_twolevel_hint(hints: interop.Reference<twolevel_hint>, nhints: number, target_byte_sex: NXByteOrder): void;

declare function swap_twolevel_hints_command(hints_cmd: interop.Reference<twolevel_hints_command>, target_byte_sex: NXByteOrder): void;

declare function swap_uuid_command(uuid_cmd: interop.Reference<uuid_command>, target_byte_sex: NXByteOrder): void;

declare function swap_uuid_commandFunction(uuid_cmd: interop.Reference<uuid_command>, target_byte_sex: NXByteOrder): void;

declare function swap_version_min_command(ver_cmd: interop.Reference<version_min_command>, target_byte_sex: NXByteOrder): void;

interface symseg_command {
	cmd: number;
	cmdsize: number;
	offset: number;
	size: number;
}
declare var symseg_command: interop.StructType<symseg_command>;

interface symtab_command {
	cmd: number;
	cmdsize: number;
	symoff: number;
	nsyms: number;
	stroff: number;
	strsize: number;
}
declare var symtab_command: interop.StructType<symtab_command>;

interface thread_command {
	cmd: number;
	cmdsize: number;
}
declare var thread_command: interop.StructType<thread_command>;

interface tlv_descriptor {
	thunk: interop.FunctionReference<(p1: interop.Reference<tlv_descriptor>) => interop.Pointer>;
	key: number;
	offset: number;
}
declare var tlv_descriptor: interop.StructType<tlv_descriptor>;

interface twolevel_hint {
	isub_image: number;
	itoc: number;
}
declare var twolevel_hint: interop.StructType<twolevel_hint>;

interface twolevel_hints_command {
	cmd: number;
	cmdsize: number;
	offset: number;
	nhints: number;
}
declare var twolevel_hints_command: interop.StructType<twolevel_hints_command>;

interface unwind_info_compressed_second_level_page_header {
	kind: number;
	entryPageOffset: number;
	entryCount: number;
	encodingsPageOffset: number;
	encodingsCount: number;
}
declare var unwind_info_compressed_second_level_page_header: interop.StructType<unwind_info_compressed_second_level_page_header>;

interface unwind_info_regular_second_level_entry {
	functionOffset: number;
	encoding: number;
}
declare var unwind_info_regular_second_level_entry: interop.StructType<unwind_info_regular_second_level_entry>;

interface unwind_info_regular_second_level_page_header {
	kind: number;
	entryPageOffset: number;
	entryCount: number;
}
declare var unwind_info_regular_second_level_page_header: interop.StructType<unwind_info_regular_second_level_page_header>;

interface unwind_info_section_header {
	version: number;
	commonEncodingsArraySectionOffset: number;
	commonEncodingsArrayCount: number;
	personalityArraySectionOffset: number;
	personalityArrayCount: number;
	indexSectionOffset: number;
	indexCount: number;
}
declare var unwind_info_section_header: interop.StructType<unwind_info_section_header>;

interface unwind_info_section_header_index_entry {
	functionOffset: number;
	secondLevelPagesSectionOffset: number;
	lsdaIndexArraySectionOffset: number;
}
declare var unwind_info_section_header_index_entry: interop.StructType<unwind_info_section_header_index_entry>;

interface unwind_info_section_header_lsda_index_entry {
	functionOffset: number;
	lsdaOffset: number;
}
declare var unwind_info_section_header_lsda_index_entry: interop.StructType<unwind_info_section_header_lsda_index_entry>;

interface uuid_command {
	cmd: number;
	cmdsize: number;
	uuid: interop.Reference<number>;
}
declare var uuid_command: interop.StructType<uuid_command>;

interface version_min_command {
	cmd: number;
	cmdsize: number;
	version: number;
	sdk: number;
}
declare var version_min_command: interop.StructType<version_min_command>;
