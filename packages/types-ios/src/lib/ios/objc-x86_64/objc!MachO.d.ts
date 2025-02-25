
declare const enum DYLD_BOOL {

	FALSE = 0,

	TRUE = 1
}

declare const DYLD_CHAINED_IMPORT: number;

declare const DYLD_CHAINED_IMPORT_ADDEND: number;

declare const DYLD_CHAINED_IMPORT_ADDEND64: number;

declare const DYLD_CHAINED_PTR_32: number;

declare const DYLD_CHAINED_PTR_32_CACHE: number;

declare const DYLD_CHAINED_PTR_32_FIRMWARE: number;

declare const DYLD_CHAINED_PTR_64: number;

declare const DYLD_CHAINED_PTR_64_KERNEL_CACHE: number;

declare const DYLD_CHAINED_PTR_64_OFFSET: number;

declare const DYLD_CHAINED_PTR_ARM64E: number;

declare const DYLD_CHAINED_PTR_ARM64E_FIRMWARE: number;

declare const DYLD_CHAINED_PTR_ARM64E_KERNEL: number;

declare const DYLD_CHAINED_PTR_ARM64E_OFFSET: number;

declare const DYLD_CHAINED_PTR_ARM64E_SHARED_CACHE: number;

declare const DYLD_CHAINED_PTR_ARM64E_USERLAND: number;

declare const DYLD_CHAINED_PTR_ARM64E_USERLAND24: number;

declare const DYLD_CHAINED_PTR_START_LAST: number;

declare const DYLD_CHAINED_PTR_START_MULTI: number;

declare const DYLD_CHAINED_PTR_START_NONE: number;

declare const DYLD_CHAINED_PTR_X86_64_KERNEL_CACHE: number;

interface NSLinkEditErrorHandlers {
	undefined: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	multiple: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	linkEdit: interop.FunctionReference<(p1: NSLinkEditErrors, p2: number, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<any>) => void>;
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

/**
 * @since 2.0
 */
declare function NSVersionOfLinkTimeLibrary(libraryName: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function NSVersionOfRunTimeLibrary(libraryName: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 1.0
 * @deprecated 16.0
 */
interface NXArchInfo {
	name: interop.Pointer | interop.Reference<any>;
	cputype: number;
	cpusubtype: number;
	byteorder: NXByteOrder;
	description: interop.Pointer | interop.Reference<any>;
}
declare var NXArchInfo: interop.StructType<NXArchInfo>;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function NXCombineCpuSubtypes(cputype: number, cpusubtype1: number, cpusubtype2: number): number;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function NXFindBestFatArch(cputype: number, cpusubtype: number, fat_archs: interop.Pointer | interop.Reference<fat_arch>, nfat_archs: number): interop.Pointer | interop.Reference<fat_arch>;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function NXFindBestFatArch_64(cputype: number, cpusubtype: number, fat_archs64: interop.Pointer | interop.Reference<fat_arch_64>, nfat_archs: number): interop.Pointer | interop.Reference<fat_arch_64>;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function NXFreeArchInfo(x: interop.Pointer | interop.Reference<NXArchInfo>): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function NXGetAllArchInfos(): interop.Pointer | interop.Reference<NXArchInfo>;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function NXGetArchInfoFromCpuType(cputype: number, cpusubtype: number): interop.Pointer | interop.Reference<NXArchInfo>;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function NXGetArchInfoFromName(name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<NXArchInfo>;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function NXGetLocalArchInfo(): interop.Pointer | interop.Reference<NXArchInfo>;

declare const UNWIND_ARM64_DWARF_SECTION_OFFSET: number;

declare const UNWIND_ARM64_FRAMELESS_STACK_SIZE_MASK: number;

declare const UNWIND_ARM64_FRAME_D10_D11_PAIR: number;

declare const UNWIND_ARM64_FRAME_D12_D13_PAIR: number;

declare const UNWIND_ARM64_FRAME_D14_D15_PAIR: number;

declare const UNWIND_ARM64_FRAME_D8_D9_PAIR: number;

declare const UNWIND_ARM64_FRAME_X19_X20_PAIR: number;

declare const UNWIND_ARM64_FRAME_X21_X22_PAIR: number;

declare const UNWIND_ARM64_FRAME_X23_X24_PAIR: number;

declare const UNWIND_ARM64_FRAME_X25_X26_PAIR: number;

declare const UNWIND_ARM64_FRAME_X27_X28_PAIR: number;

declare const UNWIND_ARM64_MODE_DWARF: number;

declare const UNWIND_ARM64_MODE_FRAME: number;

declare const UNWIND_ARM64_MODE_FRAMELESS: number;

declare const UNWIND_ARM64_MODE_MASK: number;

declare const UNWIND_ARM_DWARF_SECTION_OFFSET: number;

declare const UNWIND_ARM_FRAME_D_REG_COUNT_MASK: number;

declare const UNWIND_ARM_FRAME_FIRST_PUSH_R4: number;

declare const UNWIND_ARM_FRAME_FIRST_PUSH_R5: number;

declare const UNWIND_ARM_FRAME_FIRST_PUSH_R6: number;

declare const UNWIND_ARM_FRAME_SECOND_PUSH_R10: number;

declare const UNWIND_ARM_FRAME_SECOND_PUSH_R11: number;

declare const UNWIND_ARM_FRAME_SECOND_PUSH_R12: number;

declare const UNWIND_ARM_FRAME_SECOND_PUSH_R8: number;

declare const UNWIND_ARM_FRAME_SECOND_PUSH_R9: number;

declare const UNWIND_ARM_FRAME_STACK_ADJUST_MASK: number;

declare const UNWIND_ARM_MODE_DWARF: number;

declare const UNWIND_ARM_MODE_FRAME: number;

declare const UNWIND_ARM_MODE_FRAME_D: number;

declare const UNWIND_ARM_MODE_MASK: number;

declare const UNWIND_HAS_LSDA: number;

declare const UNWIND_IS_NOT_FUNCTION_START: number;

declare const UNWIND_PERSONALITY_MASK: number;

declare const UNWIND_X86_64_DWARF_SECTION_OFFSET: number;

declare const UNWIND_X86_64_FRAMELESS_STACK_ADJUST: number;

declare const UNWIND_X86_64_FRAMELESS_STACK_REG_COUNT: number;

declare const UNWIND_X86_64_FRAMELESS_STACK_REG_PERMUTATION: number;

declare const UNWIND_X86_64_FRAMELESS_STACK_SIZE: number;

declare const UNWIND_X86_64_MODE_DWARF: number;

declare const UNWIND_X86_64_MODE_MASK: number;

declare const UNWIND_X86_64_MODE_RBP_FRAME: number;

declare const UNWIND_X86_64_MODE_STACK_IMMD: number;

declare const UNWIND_X86_64_MODE_STACK_IND: number;

declare const UNWIND_X86_64_RBP_FRAME_OFFSET: number;

declare const UNWIND_X86_64_RBP_FRAME_REGISTERS: number;

declare const UNWIND_X86_64_REG_NONE: number;

declare const UNWIND_X86_64_REG_R12: number;

declare const UNWIND_X86_64_REG_R13: number;

declare const UNWIND_X86_64_REG_R14: number;

declare const UNWIND_X86_64_REG_R15: number;

declare const UNWIND_X86_64_REG_RBP: number;

declare const UNWIND_X86_64_REG_RBX: number;

declare const UNWIND_X86_DWARF_SECTION_OFFSET: number;

declare const UNWIND_X86_EBP_FRAME_OFFSET: number;

declare const UNWIND_X86_EBP_FRAME_REGISTERS: number;

declare const UNWIND_X86_FRAMELESS_STACK_ADJUST: number;

declare const UNWIND_X86_FRAMELESS_STACK_REG_COUNT: number;

declare const UNWIND_X86_FRAMELESS_STACK_REG_PERMUTATION: number;

declare const UNWIND_X86_FRAMELESS_STACK_SIZE: number;

declare const UNWIND_X86_MODE_DWARF: number;

declare const UNWIND_X86_MODE_EBP_FRAME: number;

declare const UNWIND_X86_MODE_MASK: number;

declare const UNWIND_X86_MODE_STACK_IMMD: number;

declare const UNWIND_X86_MODE_STACK_IND: number;

declare const UNWIND_X86_REG_EBP: number;

declare const UNWIND_X86_REG_EBX: number;

declare const UNWIND_X86_REG_ECX: number;

declare const UNWIND_X86_REG_EDI: number;

declare const UNWIND_X86_REG_EDX: number;

declare const UNWIND_X86_REG_ESI: number;

declare const UNWIND_X86_REG_NONE: number;

/**
 * @since 2.0
 */
declare function _NSGetExecutablePath(buf: string | interop.Pointer | interop.Reference<any>, bufsize: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function _dyld_get_image_header(image_index: number): interop.Pointer | interop.Reference<mach_header>;

/**
 * @since 2.0
 */
declare function _dyld_get_image_name(image_index: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function _dyld_get_image_vmaddr_slide(image_index: number): number;

/**
 * @since 2.0
 */
declare function _dyld_image_count(): number;

/**
 * @since 2.0
 */
declare function _dyld_register_func_for_add_image(func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<mach_header>, p2: number) => void>): void;

/**
 * @since 2.0
 */
declare function _dyld_register_func_for_remove_image(func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<mach_header>, p2: number) => void>): void;

/**
 * @since 14.0
 */
declare function _dyld_shared_cache_contains_path(path: string | interop.Pointer | interop.Reference<any>): boolean;

declare var _mh_bundle_header: mach_header_64;

declare var _mh_dylib_header: mach_header_64;

declare var _mh_dylinker_header: mach_header_64;

declare var _mh_execute_header: mach_header_64;

/**
 * @since 8.0
 */
declare function _tlv_atexit(termFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>, objAddr: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 8.0
 */
declare function _tlv_bootstrap(): void;

interface build_tool_version {
	tool: number;
	version: number;
}
declare var build_tool_version: interop.StructType<build_tool_version>;

interface build_version_command {
	cmd: number;
	cmdsize: number;
	platform: number;
	minos: number;
	sdk: number;
	ntools: number;
}
declare var build_version_command: interop.StructType<build_version_command>;

interface data_in_code_entry {
	offset: number;
	length: number;
	kind: number;
}
declare var data_in_code_entry: interop.StructType<data_in_code_entry>;

interface dyld_all_image_infos {
	version: number;
	infoArrayCount: number;
	infoArray: interop.Pointer | interop.Reference<dyld_image_info>;
	notification: interop.FunctionReference<(p1: dyld_image_mode, p2: number, p3: interop.Reference<dyld_image_info>) => void>;
	processDetachedFromSharedRegion: boolean;
	libSystemInitialized: boolean;
	dyldImageLoadAddress: interop.Pointer | interop.Reference<mach_header>;
	jitInfo: interop.Pointer | interop.Reference<any>;
	dyldVersion: interop.Pointer | interop.Reference<any>;
	errorMessage: interop.Pointer | interop.Reference<any>;
	terminationFlags: number;
	coreSymbolicationShmPage: interop.Pointer | interop.Reference<any>;
	systemOrderFlag: number;
	uuidArrayCount: number;
	uuidArray: interop.Pointer | interop.Reference<dyld_uuid_info>;
	dyldAllImageInfosAddress: interop.Pointer | interop.Reference<dyld_all_image_infos>;
	initialImageCount: number;
	errorKind: number;
	errorClientOfDylibPath: interop.Pointer | interop.Reference<any>;
	errorTargetDylibPath: interop.Pointer | interop.Reference<any>;
	errorSymbol: interop.Pointer | interop.Reference<any>;
	sharedCacheSlide: number;
	sharedCacheUUID: interop.Reference<number>;
	sharedCacheBaseAddress: number;
	infoArrayChangeTimestamp: number;
	dyldPath: interop.Pointer | interop.Reference<any>;
	notifyPorts: interop.Reference<number>;
	reserved: interop.Reference<number>;
	sharedCacheFSID: number;
	sharedCacheFSObjID: number;
	compact_dyld_image_info_addr: number;
	compact_dyld_image_info_size: number;
	platform: number;
	aotInfoCount: number;
	aotInfoArray: interop.Pointer | interop.Reference<dyld_aot_image_info>;
	aotInfoArrayChangeTimestamp: number;
	aotSharedCacheBaseAddress: number;
	aotSharedCacheUUID: interop.Reference<number>;
}
declare var dyld_all_image_infos: interop.StructType<dyld_all_image_infos>;

interface dyld_aot_image_info {
	x86LoadAddress: interop.Pointer | interop.Reference<mach_header>;
	aotLoadAddress: interop.Pointer | interop.Reference<mach_header>;
	aotImageSize: number;
	aotImageKey: interop.Reference<number>;
}
declare var dyld_aot_image_info: interop.StructType<dyld_aot_image_info>;

interface dyld_aot_shared_cache_info {
	cacheBaseAddress: number;
	cacheUUID: interop.Reference<number>;
}
declare var dyld_aot_shared_cache_info: interop.StructType<dyld_aot_shared_cache_info>;

interface dyld_chained_fixups_header {
	fixups_version: number;
	starts_offset: number;
	imports_offset: number;
	symbols_offset: number;
	imports_count: number;
	imports_format: number;
	symbols_format: number;
}
declare var dyld_chained_fixups_header: interop.StructType<dyld_chained_fixups_header>;

interface dyld_chained_import {
	lib_ordinal: number;
	weak_import: number;
	name_offset: number;
}
declare var dyld_chained_import: interop.StructType<dyld_chained_import>;

interface dyld_chained_import_addend {
	lib_ordinal: number;
	weak_import: number;
	name_offset: number;
	addend: number;
}
declare var dyld_chained_import_addend: interop.StructType<dyld_chained_import_addend>;

interface dyld_chained_import_addend64 {
	lib_ordinal: number;
	weak_import: number;
	reserved: number;
	name_offset: number;
	addend: number;
}
declare var dyld_chained_import_addend64: interop.StructType<dyld_chained_import_addend64>;

interface dyld_chained_ptr_32_bind {
	ordinal: number;
	addend: number;
	next: number;
	bind: number;
}
declare var dyld_chained_ptr_32_bind: interop.StructType<dyld_chained_ptr_32_bind>;

interface dyld_chained_ptr_32_cache_rebase {
	target: number;
	next: number;
}
declare var dyld_chained_ptr_32_cache_rebase: interop.StructType<dyld_chained_ptr_32_cache_rebase>;

interface dyld_chained_ptr_32_firmware_rebase {
	target: number;
	next: number;
}
declare var dyld_chained_ptr_32_firmware_rebase: interop.StructType<dyld_chained_ptr_32_firmware_rebase>;

interface dyld_chained_ptr_32_rebase {
	target: number;
	next: number;
	bind: number;
}
declare var dyld_chained_ptr_32_rebase: interop.StructType<dyld_chained_ptr_32_rebase>;

interface dyld_chained_ptr_64_bind {
	ordinal: number;
	addend: number;
	reserved: number;
	next: number;
	bind: number;
}
declare var dyld_chained_ptr_64_bind: interop.StructType<dyld_chained_ptr_64_bind>;

interface dyld_chained_ptr_64_kernel_cache_rebase {
	target: number;
	cacheLevel: number;
	diversity: number;
	addrDiv: number;
	key: number;
	next: number;
	isAuth: number;
}
declare var dyld_chained_ptr_64_kernel_cache_rebase: interop.StructType<dyld_chained_ptr_64_kernel_cache_rebase>;

interface dyld_chained_ptr_64_rebase {
	target: number;
	high8: number;
	reserved: number;
	next: number;
	bind: number;
}
declare var dyld_chained_ptr_64_rebase: interop.StructType<dyld_chained_ptr_64_rebase>;

interface dyld_chained_ptr_arm64e_auth_bind {
	ordinal: number;
	zero: number;
	diversity: number;
	addrDiv: number;
	key: number;
	next: number;
	bind: number;
	auth: number;
}
declare var dyld_chained_ptr_arm64e_auth_bind: interop.StructType<dyld_chained_ptr_arm64e_auth_bind>;

interface dyld_chained_ptr_arm64e_auth_bind24 {
	ordinal: number;
	zero: number;
	diversity: number;
	addrDiv: number;
	key: number;
	next: number;
	bind: number;
	auth: number;
}
declare var dyld_chained_ptr_arm64e_auth_bind24: interop.StructType<dyld_chained_ptr_arm64e_auth_bind24>;

interface dyld_chained_ptr_arm64e_auth_rebase {
	target: number;
	diversity: number;
	addrDiv: number;
	key: number;
	next: number;
	bind: number;
	auth: number;
}
declare var dyld_chained_ptr_arm64e_auth_rebase: interop.StructType<dyld_chained_ptr_arm64e_auth_rebase>;

interface dyld_chained_ptr_arm64e_bind {
	ordinal: number;
	zero: number;
	addend: number;
	next: number;
	bind: number;
	auth: number;
}
declare var dyld_chained_ptr_arm64e_bind: interop.StructType<dyld_chained_ptr_arm64e_bind>;

interface dyld_chained_ptr_arm64e_bind24 {
	ordinal: number;
	zero: number;
	addend: number;
	next: number;
	bind: number;
	auth: number;
}
declare var dyld_chained_ptr_arm64e_bind24: interop.StructType<dyld_chained_ptr_arm64e_bind24>;

interface dyld_chained_ptr_arm64e_rebase {
	target: number;
	high8: number;
	next: number;
	bind: number;
	auth: number;
}
declare var dyld_chained_ptr_arm64e_rebase: interop.StructType<dyld_chained_ptr_arm64e_rebase>;

interface dyld_chained_ptr_arm64e_shared_cache_auth_rebase {
	runtimeOffset: number;
	diversity: number;
	addrDiv: number;
	keyIsData: number;
	next: number;
	auth: number;
}
declare var dyld_chained_ptr_arm64e_shared_cache_auth_rebase: interop.StructType<dyld_chained_ptr_arm64e_shared_cache_auth_rebase>;

interface dyld_chained_ptr_arm64e_shared_cache_rebase {
	runtimeOffset: number;
	high8: number;
	unused: number;
	next: number;
	auth: number;
}
declare var dyld_chained_ptr_arm64e_shared_cache_rebase: interop.StructType<dyld_chained_ptr_arm64e_shared_cache_rebase>;

interface dyld_chained_starts_in_image {
	seg_count: number;
	seg_info_offset: interop.Reference<number>;
}
declare var dyld_chained_starts_in_image: interop.StructType<dyld_chained_starts_in_image>;

interface dyld_chained_starts_in_segment {
	size: number;
	page_size: number;
	pointer_format: number;
	segment_offset: number;
	max_valid_pointer: number;
	page_count: number;
	page_start: interop.Reference<number>;
}
declare var dyld_chained_starts_in_segment: interop.StructType<dyld_chained_starts_in_segment>;

interface dyld_chained_starts_offsets {
	pointer_format: number;
	starts_count: number;
	chain_starts: interop.Reference<number>;
}
declare var dyld_chained_starts_offsets: interop.StructType<dyld_chained_starts_offsets>;

declare const dyld_error_kind_dylib_missing: number;

declare const dyld_error_kind_dylib_version: number;

declare const dyld_error_kind_dylib_wrong_arch: number;

declare const dyld_error_kind_none: number;

declare const dyld_error_kind_symbol_missing: number;

interface dyld_image_info {
	imageLoadAddress: interop.Pointer | interop.Reference<mach_header>;
	imageFilePath: interop.Pointer | interop.Reference<any>;
	imageFileModDate: number;
}
declare var dyld_image_info: interop.StructType<dyld_image_info>;

declare const enum dyld_image_mode {

	dyld_image_adding = 0,

	dyld_image_removing = 1,

	dyld_image_info_change = 2,

	dyld_image_dyld_moved = 3
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
	imageLoadAddress: interop.Pointer | interop.Reference<mach_header>;
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

interface dylib_use_command {
	cmd: number;
	cmdsize: number;
	nameoff: number;
	marker: number;
	current_version: number;
	compat_version: number;
	flags: number;
}
declare var dylib_use_command: interop.StructType<dylib_use_command>;

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

interface fat_arch_64 {
	cputype: number;
	cpusubtype: number;
	offset: number;
	size: number;
	align: number;
	reserved: number;
}
declare var fat_arch_64: interop.StructType<fat_arch_64>;

interface fat_header {
	magic: number;
	nfat_arch: number;
}
declare var fat_header: interop.StructType<fat_header>;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function get_edata(): number;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function get_end(): number;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function get_etext(): number;

declare function getsectbyname(segname: string | interop.Pointer | interop.Reference<any>, sectname: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<section_64>;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function getsectbynamefromheader(mhp: interop.Pointer | interop.Reference<mach_header>, segname: string | interop.Pointer | interop.Reference<any>, sectname: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<section>;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function getsectbynamefromheader_64(mhp: interop.Pointer | interop.Reference<mach_header_64>, segname: string | interop.Pointer | interop.Reference<any>, sectname: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<section_64>;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function getsectbynamefromheaderwithswap(mhp: interop.Pointer | interop.Reference<mach_header>, segname: string | interop.Pointer | interop.Reference<any>, sectname: string | interop.Pointer | interop.Reference<any>, fSwap: number): interop.Pointer | interop.Reference<section>;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function getsectbynamefromheaderwithswap_64(mhp: interop.Pointer | interop.Reference<mach_header_64>, segname: string | interop.Pointer | interop.Reference<any>, sectname: string | interop.Pointer | interop.Reference<any>, fSwap: number): interop.Pointer | interop.Reference<section>;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function getsectdata(segname: string | interop.Pointer | interop.Reference<any>, sectname: string | interop.Pointer | interop.Reference<any>, size: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function getsectdatafromFramework(FrameworkName: string | interop.Pointer | interop.Reference<any>, segname: string | interop.Pointer | interop.Reference<any>, sectname: string | interop.Pointer | interop.Reference<any>, size: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function getsectdatafromheader(mhp: interop.Pointer | interop.Reference<mach_header>, segname: string | interop.Pointer | interop.Reference<any>, sectname: string | interop.Pointer | interop.Reference<any>, size: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function getsectdatafromheader_64(mhp: interop.Pointer | interop.Reference<mach_header_64>, segname: string | interop.Pointer | interop.Reference<any>, sectname: string | interop.Pointer | interop.Reference<any>, size: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

declare function getsectiondata(mhp: interop.Pointer | interop.Reference<mach_header_64>, segname: string | interop.Pointer | interop.Reference<any>, sectname: string | interop.Pointer | interop.Reference<any>, size: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function getsegbyname(segname: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<segment_command_64>;

declare function getsegmentdata(mhp: interop.Pointer | interop.Reference<mach_header_64>, segname: string | interop.Pointer | interop.Reference<any>, size: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

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

/**
 * @since 16.0
 */
declare function macho_arch_name_for_cpu_type(type: number, subtype: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 16.0
 */
declare function macho_arch_name_for_mach_header(mh: interop.Pointer | interop.Reference<mach_header>): interop.Pointer | interop.Reference<any>;

/**
 * @since 16.0
 */
declare function macho_best_slice(path: string | interop.Pointer | interop.Reference<any>, bestSlice: (p1: interop.Pointer | interop.Reference<mach_header>, p2: number, p3: number) => void): number;

/**
 * @since 16.0
 */
declare function macho_best_slice_in_fd(fd: number, bestSlice: (p1: interop.Pointer | interop.Reference<mach_header>, p2: number, p3: number) => void): number;

/**
 * @since 16.0
 */
declare function macho_cpu_type_for_arch_name(archName: string | interop.Pointer | interop.Reference<any>, type: interop.Pointer | interop.Reference<number>, subtype: interop.Pointer | interop.Reference<number>): boolean;

/**
 * @since 16.0
 */
declare function macho_for_each_slice(path: string | interop.Pointer | interop.Reference<any>, callback: (p1: interop.Pointer | interop.Reference<mach_header>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<boolean>) => void): number;

/**
 * @since 16.0
 */
declare function macho_for_each_slice_in_fd(fd: number, callback: (p1: interop.Pointer | interop.Reference<mach_header>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<boolean>) => void): number;

interface note_command {
	cmd: number;
	cmdsize: number;
	data_owner: interop.Reference<number>;
	offset: number;
	size: number;
}
declare var note_command: interop.StructType<note_command>;

interface prebind_cksum_command {
	cmd: number;
	cmdsize: number;
	cksum: number;
}
declare var prebind_cksum_command: interop.StructType<prebind_cksum_command>;

declare const enum reloc_type_arm {

	ARM_RELOC_VANILLA = 0,

	ARM_RELOC_PAIR = 1,

	ARM_RELOC_SECTDIFF = 2,

	ARM_RELOC_LOCAL_SECTDIFF = 3,

	ARM_RELOC_PB_LA_PTR = 4,

	ARM_RELOC_BR24 = 5,

	ARM_THUMB_RELOC_BR22 = 6,

	ARM_THUMB_32BIT_BRANCH = 7,

	ARM_RELOC_HALF = 8,

	ARM_RELOC_HALF_SECTDIFF = 9
}

declare const enum reloc_type_arm64 {

	ARM64_RELOC_UNSIGNED = 0,

	ARM64_RELOC_SUBTRACTOR = 1,

	ARM64_RELOC_BRANCH26 = 2,

	ARM64_RELOC_PAGE21 = 3,

	ARM64_RELOC_PAGEOFF12 = 4,

	ARM64_RELOC_GOT_LOAD_PAGE21 = 5,

	ARM64_RELOC_GOT_LOAD_PAGEOFF12 = 6,

	ARM64_RELOC_POINTER_TO_GOT = 7,

	ARM64_RELOC_TLVP_LOAD_PAGE21 = 8,

	ARM64_RELOC_TLVP_LOAD_PAGEOFF12 = 9,

	ARM64_RELOC_ADDEND = 10,

	ARM64_RELOC_AUTHENTICATED_POINTER = 11
}

declare const enum reloc_type_generic {

	GENERIC_RELOC_VANILLA = 0,

	GENERIC_RELOC_PAIR = 1,

	GENERIC_RELOC_SECTDIFF = 2,

	GENERIC_RELOC_PB_LA_PTR = 3,

	GENERIC_RELOC_LOCAL_SECTDIFF = 4,

	GENERIC_RELOC_TLV = 5
}

declare const enum reloc_type_x86_64 {

	X86_64_RELOC_UNSIGNED = 0,

	X86_64_RELOC_SIGNED = 1,

	X86_64_RELOC_BRANCH = 2,

	X86_64_RELOC_GOT_LOAD = 3,

	X86_64_RELOC_GOT = 4,

	X86_64_RELOC_SUBTRACTOR = 5,

	X86_64_RELOC_SIGNED_1 = 6,

	X86_64_RELOC_SIGNED_2 = 7,

	X86_64_RELOC_SIGNED_4 = 8,

	X86_64_RELOC_TLV = 9
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

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_build_tool_version(bt: interop.Pointer | interop.Reference<build_tool_version>, ntools: number, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_build_version_command(bv: interop.Pointer | interop.Reference<build_version_command>, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_dyld_info_command(ed: interop.Pointer | interop.Reference<dyld_info_command>, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_dylib_module(mods: interop.Pointer | interop.Reference<dylib_module>, nmods: number, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_dylib_module_64(mods: interop.Pointer | interop.Reference<dylib_module_64>, nmods: number, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_dylib_reference(refs: interop.Pointer | interop.Reference<dylib_reference>, nrefs: number, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_dylib_table_of_contents(tocs: interop.Pointer | interop.Reference<dylib_table_of_contents>, ntocs: number, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_dysymtab_command(dyst: interop.Pointer | interop.Reference<dysymtab_command>, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_encryption_command(ec: interop.Pointer | interop.Reference<encryption_info_command>, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_encryption_command_64(ec: interop.Pointer | interop.Reference<encryption_info_command_64>, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_entry_point_command(ep: interop.Pointer | interop.Reference<entry_point_command>, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_fat_arch(fat_archs: interop.Pointer | interop.Reference<fat_arch>, nfat_arch: number, target_byte_order: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_fat_arch_64(fat_archs64: interop.Pointer | interop.Reference<fat_arch_64>, nfat_arch: number, target_byte_order: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_fat_header(fat_header: interop.Pointer | interop.Reference<fat_header>, target_byte_order: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_ident_command(ident: interop.Pointer | interop.Reference<ident_command>, target_byte_order: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_indirect_symbols(indirect_symbols: interop.Pointer | interop.Reference<number>, nindirect_symbols: number, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_linkedit_data_command(ld: interop.Pointer | interop.Reference<linkedit_data_command>, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_linker_option_command(lo: interop.Pointer | interop.Reference<linker_option_command>, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_load_command(lc: interop.Pointer | interop.Reference<load_command>, target_byte_order: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_mach_header(mh: interop.Pointer | interop.Reference<mach_header>, target_byte_order: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_mach_header_64(mh: interop.Pointer | interop.Reference<mach_header_64>, target_byte_order: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_note_command(nc: interop.Pointer | interop.Reference<note_command>, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_prebind_cksum_command(cksum_cmd: interop.Pointer | interop.Reference<prebind_cksum_command>, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_prebind_cksum_commandFunction(cksum_cmd: interop.Pointer | interop.Reference<prebind_cksum_command>, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_relocation_info(relocs: interop.Pointer | interop.Reference<relocation_info>, nrelocs: number, target_byte_order: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_routines_command(r_cmd: interop.Pointer | interop.Reference<routines_command>, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_routines_command_64(r_cmd: interop.Pointer | interop.Reference<routines_command_64>, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_section(s: interop.Pointer | interop.Reference<section>, nsects: number, target_byte_order: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_section_64(s: interop.Pointer | interop.Reference<section_64>, nsects: number, target_byte_order: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_segment_command(sg: interop.Pointer | interop.Reference<segment_command>, target_byte_order: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_segment_command_64(sg: interop.Pointer | interop.Reference<segment_command_64>, target_byte_order: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_source_version_command(sv: interop.Pointer | interop.Reference<source_version_command>, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_symseg_command(ss: interop.Pointer | interop.Reference<symseg_command>, target_byte_order: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_symtab_command(st: interop.Pointer | interop.Reference<symtab_command>, target_byte_order: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_thread_command(ut: interop.Pointer | interop.Reference<thread_command>, target_byte_order: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_twolevel_hint(hints: interop.Pointer | interop.Reference<twolevel_hint>, nhints: number, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_twolevel_hints_command(hints_cmd: interop.Pointer | interop.Reference<twolevel_hints_command>, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_uuid_command(uuid_cmd: interop.Pointer | interop.Reference<uuid_command>, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_uuid_commandFunction(uuid_cmd: interop.Pointer | interop.Reference<uuid_command>, target_byte_sex: NXByteOrder): void;

/**
 * @since 1.0
 * @deprecated 16.0
 */
declare function swap_version_min_command(ver_cmd: interop.Pointer | interop.Reference<version_min_command>, target_byte_sex: NXByteOrder): void;

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
	thunk: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<tlv_descriptor>) => interop.Pointer | interop.Reference<any>>;
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
