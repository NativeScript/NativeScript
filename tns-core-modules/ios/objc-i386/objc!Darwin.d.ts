
interface FILE {
	_p: string;
	_r: number;
	_w: number;
	_flags: number;
	_file: number;
	_bf: __sbuf;
	_lbfsize: number;
	_cookie: interop.Pointer | interop.Reference<any>;
	_close: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	_read: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>;
	_seek: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number) => number>;
	_write: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>;
	_ub: __sbuf;
	_extra: interop.Pointer | interop.Reference<any>;
	_ur: number;
	_ubuf: interop.Reference<number>;
	_nbuf: interop.Reference<number>;
	_lb: __sbuf;
	_blksize: number;
	_offset: number;
}
declare var FILE: interop.StructType<FILE>;

interface FixedPoint {
	x: number;
	y: number;
}
declare var FixedPoint: interop.StructType<FixedPoint>;

interface FixedRect {
	left: number;
	top: number;
	right: number;
	bottom: number;
}
declare var FixedRect: interop.StructType<FixedRect>;

interface Float32Point {
	x: number;
	y: number;
}
declare var Float32Point: interop.StructType<Float32Point>;

interface Float80 {
	exp: number;
	man: interop.Reference<number>;
}
declare var Float80: interop.StructType<Float80>;

interface Float96 {
	exp: interop.Reference<number>;
	man: interop.Reference<number>;
}
declare var Float96: interop.StructType<Float96>;

declare var KERNEL_AUDIT_TOKEN: audit_token_t;

declare var KERNEL_SECURITY_TOKEN: security_token_t;

declare var NDR_record: NDR_record_t;

interface NDR_record_t {
	mig_vers: number;
	if_vers: number;
	reserved1: number;
	mig_encoding: number;
	int_rep: number;
	char_rep: number;
	float_rep: number;
	reserved2: number;
}
declare var NDR_record_t: interop.StructType<NDR_record_t>;

declare const enum NXByteOrder {

	X_UnknownByteOrder = 0,

	X_LittleEndian = 1,

	X_BigEndian = 2
}

interface NumVersion {
	nonRelRev: number;
	stage: number;
	minorAndBugRev: number;
	majorRev: number;
}
declare var NumVersion: interop.StructType<NumVersion>;

declare function OSAtomicAdd32(__theAmount: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicAdd32Barrier(__theAmount: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicAdd64(__theAmount: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicAdd64Barrier(__theAmount: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicAnd32(__theMask: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicAnd32Barrier(__theMask: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicAnd32Orig(__theMask: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicAnd32OrigBarrier(__theMask: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicCompareAndSwap32(__oldValue: number, __newValue: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicCompareAndSwap32Barrier(__oldValue: number, __newValue: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicCompareAndSwap64(__oldValue: number, __newValue: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicCompareAndSwap64Barrier(__oldValue: number, __newValue: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicCompareAndSwapInt(__oldValue: number, __newValue: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicCompareAndSwapIntBarrier(__oldValue: number, __newValue: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicCompareAndSwapLong(__oldValue: number, __newValue: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicCompareAndSwapLongBarrier(__oldValue: number, __newValue: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicCompareAndSwapPtr(__oldValue: interop.Pointer | interop.Reference<any>, __newValue: interop.Pointer | interop.Reference<any>, __theValue: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function OSAtomicCompareAndSwapPtrBarrier(__oldValue: interop.Pointer | interop.Reference<any>, __newValue: interop.Pointer | interop.Reference<any>, __theValue: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function OSAtomicDecrement32(__theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicDecrement32Barrier(__theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicDecrement64(__theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicDecrement64Barrier(__theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicDequeue(__list: interop.Pointer | interop.Reference<{ opaque1: interop.Pointer | interop.Reference<any>; opaque2: number; }>, __offset: number): interop.Pointer | interop.Reference<any>;

declare function OSAtomicEnqueue(__list: interop.Pointer | interop.Reference<{ opaque1: interop.Pointer | interop.Reference<any>; opaque2: number; }>, __new: interop.Pointer | interop.Reference<any>, __offset: number): void;

declare function OSAtomicIncrement32(__theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicIncrement32Barrier(__theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicIncrement64(__theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicIncrement64Barrier(__theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicOr32(__theMask: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicOr32Barrier(__theMask: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicOr32Orig(__theMask: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicOr32OrigBarrier(__theMask: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicTestAndClear(__n: number, __theAddress: interop.Pointer | interop.Reference<any>): number;

declare function OSAtomicTestAndClearBarrier(__n: number, __theAddress: interop.Pointer | interop.Reference<any>): number;

declare function OSAtomicTestAndSet(__n: number, __theAddress: interop.Pointer | interop.Reference<any>): number;

declare function OSAtomicTestAndSetBarrier(__n: number, __theAddress: interop.Pointer | interop.Reference<any>): number;

declare function OSAtomicXor32(__theMask: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicXor32Barrier(__theMask: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicXor32Orig(__theMask: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicXor32OrigBarrier(__theMask: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSMemoryBarrier(): void;

declare function OSSpinLockLock(__lock: interop.Pointer | interop.Reference<number>): void;

declare function OSSpinLockTry(__lock: interop.Pointer | interop.Reference<number>): number;

declare function OSSpinLockUnlock(__lock: interop.Pointer | interop.Reference<number>): void;

interface Point {
	v: number;
	h: number;
}
declare var Point: interop.StructType<Point>;

interface ProcessSerialNumber {
	highLongOfPSN: number;
	lowLongOfPSN: number;
}
declare var ProcessSerialNumber: interop.StructType<ProcessSerialNumber>;

interface Rect {
	top: number;
	left: number;
	bottom: number;
	right: number;
}
declare var Rect: interop.StructType<Rect>;

interface TimeRecord {
	value: wide;
	scale: number;
	base: interop.Pointer | interop.Reference<any>;
}
declare var TimeRecord: interop.StructType<TimeRecord>;

interface UnsignedWide {
	lo: number;
	hi: number;
}
declare var UnsignedWide: interop.StructType<UnsignedWide>;

interface VersRec {
	numericVersion: NumVersion;
	countryCode: number;
	shortVersion: interop.Reference<number>;
	reserved: interop.Reference<number>;
}
declare var VersRec: interop.StructType<VersRec>;

declare function _Block_copy(aBlock: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function _Block_object_assign(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number): void;

declare function _Block_object_dispose(p1: interop.Pointer | interop.Reference<any>, p2: number): void;

declare function _Block_release(aBlock: interop.Pointer | interop.Reference<any>): void;

declare var _CurrentRuneLocale: interop.Pointer | interop.Reference<_RuneLocale>;

declare var _DefaultRuneLocale: _RuneLocale;

declare function _Exit(p1: number): void;

declare function _ExitFunction(p1: number): void;

declare var _NSConcreteGlobalBlock: interop.Reference<interop.Pointer | interop.Reference<any>>;

declare var _NSConcreteStackBlock: interop.Reference<interop.Pointer | interop.Reference<any>>;

interface _RuneCharClass {
	__name: interop.Reference<number>;
	__mask: number;
}
declare var _RuneCharClass: interop.StructType<_RuneCharClass>;

interface _RuneEntry {
	__min: number;
	__max: number;
	__map: number;
	__types: interop.Pointer | interop.Reference<number>;
}
declare var _RuneEntry: interop.StructType<_RuneEntry>;

interface _RuneLocale {
	__magic: interop.Reference<number>;
	__encoding: interop.Reference<number>;
	__sgetrune: interop.FunctionReference<(p1: string, p2: number, p3: interop.Pointer | interop.Reference<string>) => number>;
	__sputrune: interop.FunctionReference<(p1: number, p2: string, p3: number, p4: interop.Pointer | interop.Reference<string>) => number>;
	__invalid_rune: number;
	__runetype: interop.Reference<number>;
	__maplower: interop.Reference<number>;
	__mapupper: interop.Reference<number>;
	__runetype_ext: _RuneRange;
	__maplower_ext: _RuneRange;
	__mapupper_ext: _RuneRange;
	__variable: interop.Pointer | interop.Reference<any>;
	__variable_len: number;
	__ncharclasses: number;
	__charclasses: interop.Pointer | interop.Reference<_RuneCharClass>;
}
declare var _RuneLocale: interop.StructType<_RuneLocale>;

interface _RuneRange {
	__nranges: number;
	__ranges: interop.Pointer | interop.Reference<_RuneEntry>;
}
declare var _RuneRange: interop.StructType<_RuneRange>;

interface __Reply___host_page_size_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	out_page_size: number;
}
declare var __Reply___host_page_size_t: interop.StructType<__Reply___host_page_size_t>;

interface __Reply__act_get_state_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	old_stateCnt: number;
	old_state: interop.Reference<number>;
}
declare var __Reply__act_get_state_t: interop.StructType<__Reply__act_get_state_t>;

interface __Reply__act_set_state_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__act_set_state_t: interop.StructType<__Reply__act_set_state_t>;

interface __Reply__clock_set_attributes_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__clock_set_attributes_t: interop.StructType<__Reply__clock_set_attributes_t>;

interface __Reply__clock_set_time_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__clock_set_time_t: interop.StructType<__Reply__clock_set_time_t>;

interface __Reply__etap_trace_thread_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__etap_trace_thread_t: interop.StructType<__Reply__etap_trace_thread_t>;

interface __Reply__get_dp_control_port_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	contorl_port: mach_msg_port_descriptor_t;
}
declare var __Reply__get_dp_control_port_t: interop.StructType<__Reply__get_dp_control_port_t>;

interface __Reply__host_check_multiuser_mode_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	multiuser_mode: number;
}
declare var __Reply__host_check_multiuser_mode_t: interop.StructType<__Reply__host_check_multiuser_mode_t>;

interface __Reply__host_create_mach_voucher_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	voucher: mach_msg_port_descriptor_t;
}
declare var __Reply__host_create_mach_voucher_t: interop.StructType<__Reply__host_create_mach_voucher_t>;

interface __Reply__host_default_memory_manager_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	default_manager: mach_msg_port_descriptor_t;
}
declare var __Reply__host_default_memory_manager_t: interop.StructType<__Reply__host_default_memory_manager_t>;

interface __Reply__host_get_UNDServer_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	server: mach_msg_port_descriptor_t;
}
declare var __Reply__host_get_UNDServer_t: interop.StructType<__Reply__host_get_UNDServer_t>;

interface __Reply__host_get_atm_diagnostic_flag_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	diagnostic_flag: number;
}
declare var __Reply__host_get_atm_diagnostic_flag_t: interop.StructType<__Reply__host_get_atm_diagnostic_flag_t>;

interface __Reply__host_get_boot_info_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	boot_infoOffset: number;
	boot_infoCnt: number;
	boot_info: interop.Reference<number>;
}
declare var __Reply__host_get_boot_info_t: interop.StructType<__Reply__host_get_boot_info_t>;

interface __Reply__host_get_clock_control_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	clock_ctrl: mach_msg_port_descriptor_t;
}
declare var __Reply__host_get_clock_control_t: interop.StructType<__Reply__host_get_clock_control_t>;

interface __Reply__host_get_clock_service_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	clock_serv: mach_msg_port_descriptor_t;
}
declare var __Reply__host_get_clock_service_t: interop.StructType<__Reply__host_get_clock_service_t>;

interface __Reply__host_get_exception_ports_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	old_handlers: interop.Reference<mach_msg_port_descriptor_t>;
	NDR: NDR_record_t;
	masksCnt: number;
	masks: interop.Reference<number>;
	old_behaviors: interop.Reference<number>;
	old_flavors: interop.Reference<number>;
}
declare var __Reply__host_get_exception_ports_t: interop.StructType<__Reply__host_get_exception_ports_t>;

interface __Reply__host_get_io_master_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	io_master: mach_msg_port_descriptor_t;
}
declare var __Reply__host_get_io_master_t: interop.StructType<__Reply__host_get_io_master_t>;

interface __Reply__host_get_multiuser_config_flags_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	multiuser_flags: number;
}
declare var __Reply__host_get_multiuser_config_flags_t: interop.StructType<__Reply__host_get_multiuser_config_flags_t>;

interface __Reply__host_get_special_port_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	port: mach_msg_port_descriptor_t;
}
declare var __Reply__host_get_special_port_t: interop.StructType<__Reply__host_get_special_port_t>;

interface __Reply__host_info_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	host_info_outCnt: number;
	host_info_out: interop.Reference<number>;
}
declare var __Reply__host_info_t: interop.StructType<__Reply__host_info_t>;

interface __Reply__host_kernel_version_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	kernel_versionOffset: number;
	kernel_versionCnt: number;
	kernel_version: interop.Reference<number>;
}
declare var __Reply__host_kernel_version_t: interop.StructType<__Reply__host_kernel_version_t>;

interface __Reply__host_lockgroup_info_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	lockgroup_info: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	lockgroup_infoCnt: number;
}
declare var __Reply__host_lockgroup_info_t: interop.StructType<__Reply__host_lockgroup_info_t>;

interface __Reply__host_priv_statistics_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	host_info_outCnt: number;
	host_info_out: interop.Reference<number>;
}
declare var __Reply__host_priv_statistics_t: interop.StructType<__Reply__host_priv_statistics_t>;

interface __Reply__host_processor_info_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	out_processor_info: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	out_processor_count: number;
	out_processor_infoCnt: number;
}
declare var __Reply__host_processor_info_t: interop.StructType<__Reply__host_processor_info_t>;

interface __Reply__host_processor_set_priv_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	set: mach_msg_port_descriptor_t;
}
declare var __Reply__host_processor_set_priv_t: interop.StructType<__Reply__host_processor_set_priv_t>;

interface __Reply__host_processor_sets_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	processor_sets: mach_msg_ool_ports_descriptor_t;
	NDR: NDR_record_t;
	processor_setsCnt: number;
}
declare var __Reply__host_processor_sets_t: interop.StructType<__Reply__host_processor_sets_t>;

interface __Reply__host_processors_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	out_processor_list: mach_msg_ool_ports_descriptor_t;
	NDR: NDR_record_t;
	out_processor_listCnt: number;
}
declare var __Reply__host_processors_t: interop.StructType<__Reply__host_processors_t>;

interface __Reply__host_reboot_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__host_reboot_t: interop.StructType<__Reply__host_reboot_t>;

interface __Reply__host_register_mach_voucher_attr_manager_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	new_attr_control: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	new_key: number;
}
declare var __Reply__host_register_mach_voucher_attr_manager_t: interop.StructType<__Reply__host_register_mach_voucher_attr_manager_t>;

interface __Reply__host_register_well_known_mach_voucher_attr_manager_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	new_attr_control: mach_msg_port_descriptor_t;
}
declare var __Reply__host_register_well_known_mach_voucher_attr_manager_t: interop.StructType<__Reply__host_register_well_known_mach_voucher_attr_manager_t>;

interface __Reply__host_request_notification_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__host_request_notification_t: interop.StructType<__Reply__host_request_notification_t>;

interface __Reply__host_security_create_task_token_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	child_task: mach_msg_port_descriptor_t;
}
declare var __Reply__host_security_create_task_token_t: interop.StructType<__Reply__host_security_create_task_token_t>;

interface __Reply__host_security_set_task_token_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__host_security_set_task_token_t: interop.StructType<__Reply__host_security_set_task_token_t>;

interface __Reply__host_set_UNDServer_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__host_set_UNDServer_t: interop.StructType<__Reply__host_set_UNDServer_t>;

interface __Reply__host_set_atm_diagnostic_flag_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__host_set_atm_diagnostic_flag_t: interop.StructType<__Reply__host_set_atm_diagnostic_flag_t>;

interface __Reply__host_set_exception_ports_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__host_set_exception_ports_t: interop.StructType<__Reply__host_set_exception_ports_t>;

interface __Reply__host_set_multiuser_config_flags_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__host_set_multiuser_config_flags_t: interop.StructType<__Reply__host_set_multiuser_config_flags_t>;

interface __Reply__host_set_special_port_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__host_set_special_port_t: interop.StructType<__Reply__host_set_special_port_t>;

interface __Reply__host_statistics64_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	host_info64_outCnt: number;
	host_info64_out: interop.Reference<number>;
}
declare var __Reply__host_statistics64_t: interop.StructType<__Reply__host_statistics64_t>;

interface __Reply__host_statistics_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	host_info_outCnt: number;
	host_info_out: interop.Reference<number>;
}
declare var __Reply__host_statistics_t: interop.StructType<__Reply__host_statistics_t>;

interface __Reply__host_swap_exception_ports_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	old_handlerss: interop.Reference<mach_msg_port_descriptor_t>;
	NDR: NDR_record_t;
	masksCnt: number;
	masks: interop.Reference<number>;
	old_behaviors: interop.Reference<number>;
	old_flavors: interop.Reference<number>;
}
declare var __Reply__host_swap_exception_ports_t: interop.StructType<__Reply__host_swap_exception_ports_t>;

interface __Reply__host_virtual_physical_table_info_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	info: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	infoCnt: number;
}
declare var __Reply__host_virtual_physical_table_info_t: interop.StructType<__Reply__host_virtual_physical_table_info_t>;

interface __Reply__host_zone_info_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	names: mach_msg_ool_descriptor_t;
	info: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	namesCnt: number;
	infoCnt: number;
}
declare var __Reply__host_zone_info_t: interop.StructType<__Reply__host_zone_info_t>;

interface __Reply__kext_request_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	response_data: mach_msg_ool_descriptor_t;
	log_data: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	response_dataCnt: number;
	log_dataCnt: number;
	op_result: number;
}
declare var __Reply__kext_request_t: interop.StructType<__Reply__kext_request_t>;

interface __Reply__kmod_control_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	data: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	dataCnt: number;
}
declare var __Reply__kmod_control_t: interop.StructType<__Reply__kmod_control_t>;

interface __Reply__kmod_create_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	module: number;
}
declare var __Reply__kmod_create_t: interop.StructType<__Reply__kmod_create_t>;

interface __Reply__kmod_destroy_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__kmod_destroy_t: interop.StructType<__Reply__kmod_destroy_t>;

interface __Reply__kmod_get_info_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	modules: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	modulesCnt: number;
}
declare var __Reply__kmod_get_info_t: interop.StructType<__Reply__kmod_get_info_t>;

interface __Reply__lock_acquire_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__lock_acquire_t: interop.StructType<__Reply__lock_acquire_t>;

interface __Reply__lock_handoff_accept_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__lock_handoff_accept_t: interop.StructType<__Reply__lock_handoff_accept_t>;

interface __Reply__lock_handoff_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__lock_handoff_t: interop.StructType<__Reply__lock_handoff_t>;

interface __Reply__lock_make_stable_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__lock_make_stable_t: interop.StructType<__Reply__lock_make_stable_t>;

interface __Reply__lock_release_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__lock_release_t: interop.StructType<__Reply__lock_release_t>;

interface __Reply__lock_set_create_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	new_lock_set: mach_msg_port_descriptor_t;
}
declare var __Reply__lock_set_create_t: interop.StructType<__Reply__lock_set_create_t>;

interface __Reply__lock_set_destroy_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__lock_set_destroy_t: interop.StructType<__Reply__lock_set_destroy_t>;

interface __Reply__lock_try_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__lock_try_t: interop.StructType<__Reply__lock_try_t>;

interface __Reply__mach_make_memory_entry_64_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	object_handle: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	size: number;
}
declare var __Reply__mach_make_memory_entry_64_t: interop.StructType<__Reply__mach_make_memory_entry_64_t>;

interface __Reply__mach_make_memory_entry_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	object_handle: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	size: number;
}
declare var __Reply__mach_make_memory_entry_t: interop.StructType<__Reply__mach_make_memory_entry_t>;

interface __Reply__mach_memory_info_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	names: mach_msg_ool_descriptor_t;
	info: mach_msg_ool_descriptor_t;
	memory_info: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	namesCnt: number;
	infoCnt: number;
	memory_infoCnt: number;
}
declare var __Reply__mach_memory_info_t: interop.StructType<__Reply__mach_memory_info_t>;

interface __Reply__mach_memory_object_memory_entry_64_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	entry_handle: mach_msg_port_descriptor_t;
}
declare var __Reply__mach_memory_object_memory_entry_64_t: interop.StructType<__Reply__mach_memory_object_memory_entry_64_t>;

interface __Reply__mach_memory_object_memory_entry_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	entry_handle: mach_msg_port_descriptor_t;
}
declare var __Reply__mach_memory_object_memory_entry_t: interop.StructType<__Reply__mach_memory_object_memory_entry_t>;

interface __Reply__mach_port_allocate_full_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	qos: mach_port_qos_t;
	name: number;
}
declare var __Reply__mach_port_allocate_full_t: interop.StructType<__Reply__mach_port_allocate_full_t>;

interface __Reply__mach_port_allocate_name_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__mach_port_allocate_name_t: interop.StructType<__Reply__mach_port_allocate_name_t>;

interface __Reply__mach_port_allocate_qos_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	qos: mach_port_qos_t;
	name: number;
}
declare var __Reply__mach_port_allocate_qos_t: interop.StructType<__Reply__mach_port_allocate_qos_t>;

interface __Reply__mach_port_allocate_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	name: number;
}
declare var __Reply__mach_port_allocate_t: interop.StructType<__Reply__mach_port_allocate_t>;

interface __Reply__mach_port_construct_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	name: number;
}
declare var __Reply__mach_port_construct_t: interop.StructType<__Reply__mach_port_construct_t>;

interface __Reply__mach_port_deallocate_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__mach_port_deallocate_t: interop.StructType<__Reply__mach_port_deallocate_t>;

interface __Reply__mach_port_destroy_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__mach_port_destroy_t: interop.StructType<__Reply__mach_port_destroy_t>;

interface __Reply__mach_port_destruct_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__mach_port_destruct_t: interop.StructType<__Reply__mach_port_destruct_t>;

interface __Reply__mach_port_dnrequest_info_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	dnr_total: number;
	dnr_used: number;
}
declare var __Reply__mach_port_dnrequest_info_t: interop.StructType<__Reply__mach_port_dnrequest_info_t>;

interface __Reply__mach_port_extract_member_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__mach_port_extract_member_t: interop.StructType<__Reply__mach_port_extract_member_t>;

interface __Reply__mach_port_extract_right_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	poly: mach_msg_port_descriptor_t;
}
declare var __Reply__mach_port_extract_right_t: interop.StructType<__Reply__mach_port_extract_right_t>;

interface __Reply__mach_port_get_attributes_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	port_info_outCnt: number;
	port_info_out: interop.Reference<number>;
}
declare var __Reply__mach_port_get_attributes_t: interop.StructType<__Reply__mach_port_get_attributes_t>;

interface __Reply__mach_port_get_context_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	context: number;
}
declare var __Reply__mach_port_get_context_t: interop.StructType<__Reply__mach_port_get_context_t>;

interface __Reply__mach_port_get_refs_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	refs: number;
}
declare var __Reply__mach_port_get_refs_t: interop.StructType<__Reply__mach_port_get_refs_t>;

interface __Reply__mach_port_get_set_status_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	members: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	membersCnt: number;
}
declare var __Reply__mach_port_get_set_status_t: interop.StructType<__Reply__mach_port_get_set_status_t>;

interface __Reply__mach_port_get_srights_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	srights: number;
}
declare var __Reply__mach_port_get_srights_t: interop.StructType<__Reply__mach_port_get_srights_t>;

interface __Reply__mach_port_guard_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__mach_port_guard_t: interop.StructType<__Reply__mach_port_guard_t>;

interface __Reply__mach_port_insert_member_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__mach_port_insert_member_t: interop.StructType<__Reply__mach_port_insert_member_t>;

interface __Reply__mach_port_insert_right_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__mach_port_insert_right_t: interop.StructType<__Reply__mach_port_insert_right_t>;

interface __Reply__mach_port_kernel_object_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	object_type: number;
	object_addr: number;
}
declare var __Reply__mach_port_kernel_object_t: interop.StructType<__Reply__mach_port_kernel_object_t>;

interface __Reply__mach_port_kobject_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	object_type: number;
	object_addr: number;
}
declare var __Reply__mach_port_kobject_t: interop.StructType<__Reply__mach_port_kobject_t>;

interface __Reply__mach_port_mod_refs_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__mach_port_mod_refs_t: interop.StructType<__Reply__mach_port_mod_refs_t>;

interface __Reply__mach_port_move_member_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__mach_port_move_member_t: interop.StructType<__Reply__mach_port_move_member_t>;

interface __Reply__mach_port_names_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	names: mach_msg_ool_descriptor_t;
	types: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	namesCnt: number;
	typesCnt: number;
}
declare var __Reply__mach_port_names_t: interop.StructType<__Reply__mach_port_names_t>;

interface __Reply__mach_port_peek_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	request_seqnop: number;
	msg_sizep: number;
	msg_idp: number;
	trailer_infopCnt: number;
	trailer_infop: interop.Reference<number>;
}
declare var __Reply__mach_port_peek_t: interop.StructType<__Reply__mach_port_peek_t>;

interface __Reply__mach_port_rename_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__mach_port_rename_t: interop.StructType<__Reply__mach_port_rename_t>;

interface __Reply__mach_port_request_notification_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	previous: mach_msg_port_descriptor_t;
}
declare var __Reply__mach_port_request_notification_t: interop.StructType<__Reply__mach_port_request_notification_t>;

interface __Reply__mach_port_set_attributes_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__mach_port_set_attributes_t: interop.StructType<__Reply__mach_port_set_attributes_t>;

interface __Reply__mach_port_set_context_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__mach_port_set_context_t: interop.StructType<__Reply__mach_port_set_context_t>;

interface __Reply__mach_port_set_mscount_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__mach_port_set_mscount_t: interop.StructType<__Reply__mach_port_set_mscount_t>;

interface __Reply__mach_port_set_seqno_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__mach_port_set_seqno_t: interop.StructType<__Reply__mach_port_set_seqno_t>;

interface __Reply__mach_port_space_basic_info_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	basic_info: ipc_info_space_basic_t;
}
declare var __Reply__mach_port_space_basic_info_t: interop.StructType<__Reply__mach_port_space_basic_info_t>;

interface __Reply__mach_port_space_info_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	table_info: mach_msg_ool_descriptor_t;
	tree_info: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	space_info: ipc_info_space_t;
	table_infoCnt: number;
	tree_infoCnt: number;
}
declare var __Reply__mach_port_space_info_t: interop.StructType<__Reply__mach_port_space_info_t>;

interface __Reply__mach_port_type_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	ptype: number;
}
declare var __Reply__mach_port_type_t: interop.StructType<__Reply__mach_port_type_t>;

interface __Reply__mach_port_unguard_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__mach_port_unguard_t: interop.StructType<__Reply__mach_port_unguard_t>;

interface __Reply__mach_ports_lookup_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	init_port_set: mach_msg_ool_ports_descriptor_t;
	NDR: NDR_record_t;
	init_port_setCnt: number;
}
declare var __Reply__mach_ports_lookup_t: interop.StructType<__Reply__mach_ports_lookup_t>;

interface __Reply__mach_ports_register_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__mach_ports_register_t: interop.StructType<__Reply__mach_ports_register_t>;

interface __Reply__mach_vm_region_info_64_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	objects: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	region: vm_info_region_64_t;
	objectsCnt: number;
}
declare var __Reply__mach_vm_region_info_64_t: interop.StructType<__Reply__mach_vm_region_info_64_t>;

interface __Reply__mach_vm_region_info_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	objects: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	region: vm_info_region_t;
	objectsCnt: number;
}
declare var __Reply__mach_vm_region_info_t: interop.StructType<__Reply__mach_vm_region_info_t>;

interface __Reply__mach_vm_wire_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__mach_vm_wire_t: interop.StructType<__Reply__mach_vm_wire_t>;

interface __Reply__mach_zone_info_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	names: mach_msg_ool_descriptor_t;
	info: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	namesCnt: number;
	infoCnt: number;
}
declare var __Reply__mach_zone_info_t: interop.StructType<__Reply__mach_zone_info_t>;

interface __Reply__processor_assign_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__processor_assign_t: interop.StructType<__Reply__processor_assign_t>;

interface __Reply__processor_control_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__processor_control_t: interop.StructType<__Reply__processor_control_t>;

interface __Reply__processor_exit_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__processor_exit_t: interop.StructType<__Reply__processor_exit_t>;

interface __Reply__processor_get_assignment_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	assigned_set: mach_msg_port_descriptor_t;
}
declare var __Reply__processor_get_assignment_t: interop.StructType<__Reply__processor_get_assignment_t>;

interface __Reply__processor_info_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	host: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	processor_info_outCnt: number;
	processor_info_out: interop.Reference<number>;
}
declare var __Reply__processor_info_t: interop.StructType<__Reply__processor_info_t>;

interface __Reply__processor_set_create_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	new_set: mach_msg_port_descriptor_t;
	new_name: mach_msg_port_descriptor_t;
}
declare var __Reply__processor_set_create_t: interop.StructType<__Reply__processor_set_create_t>;

interface __Reply__processor_set_default_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	default_set: mach_msg_port_descriptor_t;
}
declare var __Reply__processor_set_default_t: interop.StructType<__Reply__processor_set_default_t>;

interface __Reply__processor_set_destroy_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__processor_set_destroy_t: interop.StructType<__Reply__processor_set_destroy_t>;

interface __Reply__processor_set_info_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	host: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	info_outCnt: number;
	info_out: interop.Reference<number>;
}
declare var __Reply__processor_set_info_t: interop.StructType<__Reply__processor_set_info_t>;

interface __Reply__processor_set_max_priority_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__processor_set_max_priority_t: interop.StructType<__Reply__processor_set_max_priority_t>;

interface __Reply__processor_set_policy_control_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__processor_set_policy_control_t: interop.StructType<__Reply__processor_set_policy_control_t>;

interface __Reply__processor_set_policy_disable_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__processor_set_policy_disable_t: interop.StructType<__Reply__processor_set_policy_disable_t>;

interface __Reply__processor_set_policy_enable_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__processor_set_policy_enable_t: interop.StructType<__Reply__processor_set_policy_enable_t>;

interface __Reply__processor_set_stack_usage_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	ltotal: number;
	space: number;
	resident: number;
	maxusage: number;
	maxstack: number;
}
declare var __Reply__processor_set_stack_usage_t: interop.StructType<__Reply__processor_set_stack_usage_t>;

interface __Reply__processor_set_statistics_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	info_outCnt: number;
	info_out: interop.Reference<number>;
}
declare var __Reply__processor_set_statistics_t: interop.StructType<__Reply__processor_set_statistics_t>;

interface __Reply__processor_set_tasks_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	task_list: mach_msg_ool_ports_descriptor_t;
	NDR: NDR_record_t;
	task_listCnt: number;
}
declare var __Reply__processor_set_tasks_t: interop.StructType<__Reply__processor_set_tasks_t>;

interface __Reply__processor_set_threads_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	thread_list: mach_msg_ool_ports_descriptor_t;
	NDR: NDR_record_t;
	thread_listCnt: number;
}
declare var __Reply__processor_set_threads_t: interop.StructType<__Reply__processor_set_threads_t>;

interface __Reply__processor_start_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__processor_start_t: interop.StructType<__Reply__processor_start_t>;

interface __Reply__semaphore_create_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	semaphore: mach_msg_port_descriptor_t;
}
declare var __Reply__semaphore_create_t: interop.StructType<__Reply__semaphore_create_t>;

interface __Reply__semaphore_destroy_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__semaphore_destroy_t: interop.StructType<__Reply__semaphore_destroy_t>;

interface __Reply__set_dp_control_port_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__set_dp_control_port_t: interop.StructType<__Reply__set_dp_control_port_t>;

interface __Reply__task_assign_default_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_assign_default_t: interop.StructType<__Reply__task_assign_default_t>;

interface __Reply__task_assign_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_assign_t: interop.StructType<__Reply__task_assign_t>;

interface __Reply__task_create_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	child_task: mach_msg_port_descriptor_t;
}
declare var __Reply__task_create_t: interop.StructType<__Reply__task_create_t>;

interface __Reply__task_generate_corpse_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	corpse_task_port: mach_msg_port_descriptor_t;
}
declare var __Reply__task_generate_corpse_t: interop.StructType<__Reply__task_generate_corpse_t>;

interface __Reply__task_get_assignment_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	assigned_set: mach_msg_port_descriptor_t;
}
declare var __Reply__task_get_assignment_t: interop.StructType<__Reply__task_get_assignment_t>;

interface __Reply__task_get_dyld_image_infos_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	dyld_images: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	dyld_imagesCnt: number;
}
declare var __Reply__task_get_dyld_image_infos_t: interop.StructType<__Reply__task_get_dyld_image_infos_t>;

interface __Reply__task_get_emulation_vector_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	emulation_vector: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	vector_start: number;
	emulation_vectorCnt: number;
}
declare var __Reply__task_get_emulation_vector_t: interop.StructType<__Reply__task_get_emulation_vector_t>;

interface __Reply__task_get_exception_ports_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	old_handlers: interop.Reference<mach_msg_port_descriptor_t>;
	NDR: NDR_record_t;
	masksCnt: number;
	masks: interop.Reference<number>;
	old_behaviors: interop.Reference<number>;
	old_flavors: interop.Reference<number>;
}
declare var __Reply__task_get_exception_ports_t: interop.StructType<__Reply__task_get_exception_ports_t>;

interface __Reply__task_get_mach_voucher_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	voucher: mach_msg_port_descriptor_t;
}
declare var __Reply__task_get_mach_voucher_t: interop.StructType<__Reply__task_get_mach_voucher_t>;

interface __Reply__task_get_special_port_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	special_port: mach_msg_port_descriptor_t;
}
declare var __Reply__task_get_special_port_t: interop.StructType<__Reply__task_get_special_port_t>;

interface __Reply__task_get_state_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	old_stateCnt: number;
	old_state: interop.Reference<number>;
}
declare var __Reply__task_get_state_t: interop.StructType<__Reply__task_get_state_t>;

interface __Reply__task_info_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	task_info_outCnt: number;
	task_info_out: interop.Reference<number>;
}
declare var __Reply__task_info_t: interop.StructType<__Reply__task_info_t>;

interface __Reply__task_map_corpse_info_64_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	kcd_addr_begin: number;
	kcd_size: number;
}
declare var __Reply__task_map_corpse_info_64_t: interop.StructType<__Reply__task_map_corpse_info_64_t>;

interface __Reply__task_map_corpse_info_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	kcd_addr_begin: number;
	kcd_size: number;
}
declare var __Reply__task_map_corpse_info_t: interop.StructType<__Reply__task_map_corpse_info_t>;

interface __Reply__task_policy_get_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	policy_infoCnt: number;
	policy_info: interop.Reference<number>;
	get_default: number;
}
declare var __Reply__task_policy_get_t: interop.StructType<__Reply__task_policy_get_t>;

interface __Reply__task_policy_set_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_policy_set_t: interop.StructType<__Reply__task_policy_set_t>;

interface __Reply__task_policy_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_policy_t: interop.StructType<__Reply__task_policy_t>;

interface __Reply__task_purgable_info_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	stats: vm_purgeable_info;
}
declare var __Reply__task_purgable_info_t: interop.StructType<__Reply__task_purgable_info_t>;

interface __Reply__task_register_dyld_image_infos_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_register_dyld_image_infos_t: interop.StructType<__Reply__task_register_dyld_image_infos_t>;

interface __Reply__task_register_dyld_set_dyld_state_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_register_dyld_set_dyld_state_t: interop.StructType<__Reply__task_register_dyld_set_dyld_state_t>;

interface __Reply__task_register_dyld_shared_cache_image_info_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_register_dyld_shared_cache_image_info_t: interop.StructType<__Reply__task_register_dyld_shared_cache_image_info_t>;

interface __Reply__task_resume2_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_resume2_t: interop.StructType<__Reply__task_resume2_t>;

interface __Reply__task_resume_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_resume_t: interop.StructType<__Reply__task_resume_t>;

interface __Reply__task_sample_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_sample_t: interop.StructType<__Reply__task_sample_t>;

interface __Reply__task_set_emulation_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_set_emulation_t: interop.StructType<__Reply__task_set_emulation_t>;

interface __Reply__task_set_emulation_vector_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_set_emulation_vector_t: interop.StructType<__Reply__task_set_emulation_vector_t>;

interface __Reply__task_set_exception_ports_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_set_exception_ports_t: interop.StructType<__Reply__task_set_exception_ports_t>;

interface __Reply__task_set_info_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_set_info_t: interop.StructType<__Reply__task_set_info_t>;

interface __Reply__task_set_mach_voucher_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_set_mach_voucher_t: interop.StructType<__Reply__task_set_mach_voucher_t>;

interface __Reply__task_set_phys_footprint_limit_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	old_limit: number;
}
declare var __Reply__task_set_phys_footprint_limit_t: interop.StructType<__Reply__task_set_phys_footprint_limit_t>;

interface __Reply__task_set_policy_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_set_policy_t: interop.StructType<__Reply__task_set_policy_t>;

interface __Reply__task_set_port_space_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_set_port_space_t: interop.StructType<__Reply__task_set_port_space_t>;

interface __Reply__task_set_ras_pc_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_set_ras_pc_t: interop.StructType<__Reply__task_set_ras_pc_t>;

interface __Reply__task_set_special_port_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_set_special_port_t: interop.StructType<__Reply__task_set_special_port_t>;

interface __Reply__task_set_state_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_set_state_t: interop.StructType<__Reply__task_set_state_t>;

interface __Reply__task_suspend2_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	suspend_token: mach_msg_port_descriptor_t;
}
declare var __Reply__task_suspend2_t: interop.StructType<__Reply__task_suspend2_t>;

interface __Reply__task_suspend_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_suspend_t: interop.StructType<__Reply__task_suspend_t>;

interface __Reply__task_swap_exception_ports_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	old_handlerss: interop.Reference<mach_msg_port_descriptor_t>;
	NDR: NDR_record_t;
	masksCnt: number;
	masks: interop.Reference<number>;
	old_behaviors: interop.Reference<number>;
	old_flavors: interop.Reference<number>;
}
declare var __Reply__task_swap_exception_ports_t: interop.StructType<__Reply__task_swap_exception_ports_t>;

interface __Reply__task_swap_mach_voucher_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	old_voucher: mach_msg_port_descriptor_t;
}
declare var __Reply__task_swap_mach_voucher_t: interop.StructType<__Reply__task_swap_mach_voucher_t>;

interface __Reply__task_terminate_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_terminate_t: interop.StructType<__Reply__task_terminate_t>;

interface __Reply__task_threads_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	act_list: mach_msg_ool_ports_descriptor_t;
	NDR: NDR_record_t;
	act_listCnt: number;
}
declare var __Reply__task_threads_t: interop.StructType<__Reply__task_threads_t>;

interface __Reply__task_unregister_dyld_image_infos_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_unregister_dyld_image_infos_t: interop.StructType<__Reply__task_unregister_dyld_image_infos_t>;

interface __Reply__task_wire_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_wire_t: interop.StructType<__Reply__task_wire_t>;

interface __Reply__task_zone_info_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	names: mach_msg_ool_descriptor_t;
	info: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	namesCnt: number;
	infoCnt: number;
}
declare var __Reply__task_zone_info_t: interop.StructType<__Reply__task_zone_info_t>;

interface __Reply__thread_abort_safely_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__thread_abort_safely_t: interop.StructType<__Reply__thread_abort_safely_t>;

interface __Reply__thread_abort_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__thread_abort_t: interop.StructType<__Reply__thread_abort_t>;

interface __Reply__thread_assign_default_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__thread_assign_default_t: interop.StructType<__Reply__thread_assign_default_t>;

interface __Reply__thread_assign_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__thread_assign_t: interop.StructType<__Reply__thread_assign_t>;

interface __Reply__thread_create_running_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	child_act: mach_msg_port_descriptor_t;
}
declare var __Reply__thread_create_running_t: interop.StructType<__Reply__thread_create_running_t>;

interface __Reply__thread_create_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	child_act: mach_msg_port_descriptor_t;
}
declare var __Reply__thread_create_t: interop.StructType<__Reply__thread_create_t>;

interface __Reply__thread_depress_abort_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__thread_depress_abort_t: interop.StructType<__Reply__thread_depress_abort_t>;

interface __Reply__thread_get_assignment_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	assigned_set: mach_msg_port_descriptor_t;
}
declare var __Reply__thread_get_assignment_t: interop.StructType<__Reply__thread_get_assignment_t>;

interface __Reply__thread_get_exception_ports_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	old_handlers: interop.Reference<mach_msg_port_descriptor_t>;
	NDR: NDR_record_t;
	masksCnt: number;
	masks: interop.Reference<number>;
	old_behaviors: interop.Reference<number>;
	old_flavors: interop.Reference<number>;
}
declare var __Reply__thread_get_exception_ports_t: interop.StructType<__Reply__thread_get_exception_ports_t>;

interface __Reply__thread_get_mach_voucher_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	voucher: mach_msg_port_descriptor_t;
}
declare var __Reply__thread_get_mach_voucher_t: interop.StructType<__Reply__thread_get_mach_voucher_t>;

interface __Reply__thread_get_special_port_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	special_port: mach_msg_port_descriptor_t;
}
declare var __Reply__thread_get_special_port_t: interop.StructType<__Reply__thread_get_special_port_t>;

interface __Reply__thread_get_state_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	old_stateCnt: number;
	old_state: interop.Reference<number>;
}
declare var __Reply__thread_get_state_t: interop.StructType<__Reply__thread_get_state_t>;

interface __Reply__thread_info_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	thread_info_outCnt: number;
	thread_info_out: interop.Reference<number>;
}
declare var __Reply__thread_info_t: interop.StructType<__Reply__thread_info_t>;

interface __Reply__thread_policy_get_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	policy_infoCnt: number;
	policy_info: interop.Reference<number>;
	get_default: number;
}
declare var __Reply__thread_policy_get_t: interop.StructType<__Reply__thread_policy_get_t>;

interface __Reply__thread_policy_set_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__thread_policy_set_t: interop.StructType<__Reply__thread_policy_set_t>;

interface __Reply__thread_policy_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__thread_policy_t: interop.StructType<__Reply__thread_policy_t>;

interface __Reply__thread_resume_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__thread_resume_t: interop.StructType<__Reply__thread_resume_t>;

interface __Reply__thread_sample_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__thread_sample_t: interop.StructType<__Reply__thread_sample_t>;

interface __Reply__thread_set_exception_ports_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__thread_set_exception_ports_t: interop.StructType<__Reply__thread_set_exception_ports_t>;

interface __Reply__thread_set_mach_voucher_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__thread_set_mach_voucher_t: interop.StructType<__Reply__thread_set_mach_voucher_t>;

interface __Reply__thread_set_policy_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__thread_set_policy_t: interop.StructType<__Reply__thread_set_policy_t>;

interface __Reply__thread_set_special_port_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__thread_set_special_port_t: interop.StructType<__Reply__thread_set_special_port_t>;

interface __Reply__thread_set_state_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__thread_set_state_t: interop.StructType<__Reply__thread_set_state_t>;

interface __Reply__thread_suspend_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__thread_suspend_t: interop.StructType<__Reply__thread_suspend_t>;

interface __Reply__thread_swap_exception_ports_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	old_handlers: interop.Reference<mach_msg_port_descriptor_t>;
	NDR: NDR_record_t;
	masksCnt: number;
	masks: interop.Reference<number>;
	old_behaviors: interop.Reference<number>;
	old_flavors: interop.Reference<number>;
}
declare var __Reply__thread_swap_exception_ports_t: interop.StructType<__Reply__thread_swap_exception_ports_t>;

interface __Reply__thread_swap_mach_voucher_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	old_voucher: mach_msg_port_descriptor_t;
}
declare var __Reply__thread_swap_mach_voucher_t: interop.StructType<__Reply__thread_swap_mach_voucher_t>;

interface __Reply__thread_terminate_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__thread_terminate_t: interop.StructType<__Reply__thread_terminate_t>;

interface __Reply__thread_wire_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__thread_wire_t: interop.StructType<__Reply__thread_wire_t>;

interface __Reply__vm_allocate_cpm_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	address: number;
}
declare var __Reply__vm_allocate_cpm_t: interop.StructType<__Reply__vm_allocate_cpm_t>;

interface __Reply__vm_allocate_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	address: number;
}
declare var __Reply__vm_allocate_t: interop.StructType<__Reply__vm_allocate_t>;

interface __Reply__vm_behavior_set_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__vm_behavior_set_t: interop.StructType<__Reply__vm_behavior_set_t>;

interface __Reply__vm_copy_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__vm_copy_t: interop.StructType<__Reply__vm_copy_t>;

interface __Reply__vm_deallocate_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__vm_deallocate_t: interop.StructType<__Reply__vm_deallocate_t>;

interface __Reply__vm_inherit_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__vm_inherit_t: interop.StructType<__Reply__vm_inherit_t>;

interface __Reply__vm_machine_attribute_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	value: number;
}
declare var __Reply__vm_machine_attribute_t: interop.StructType<__Reply__vm_machine_attribute_t>;

interface __Reply__vm_map_64_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	address: number;
}
declare var __Reply__vm_map_64_t: interop.StructType<__Reply__vm_map_64_t>;

interface __Reply__vm_map_page_query_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	disposition: number;
	ref_count: number;
}
declare var __Reply__vm_map_page_query_t: interop.StructType<__Reply__vm_map_page_query_t>;

interface __Reply__vm_map_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	address: number;
}
declare var __Reply__vm_map_t: interop.StructType<__Reply__vm_map_t>;

interface __Reply__vm_mapped_pages_info_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	pages: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	pagesCnt: number;
}
declare var __Reply__vm_mapped_pages_info_t: interop.StructType<__Reply__vm_mapped_pages_info_t>;

interface __Reply__vm_msync_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__vm_msync_t: interop.StructType<__Reply__vm_msync_t>;

interface __Reply__vm_protect_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__vm_protect_t: interop.StructType<__Reply__vm_protect_t>;

interface __Reply__vm_purgable_control_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	state: number;
}
declare var __Reply__vm_purgable_control_t: interop.StructType<__Reply__vm_purgable_control_t>;

interface __Reply__vm_read_list_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	data_list: interop.Reference<vm_read_entry>;
}
declare var __Reply__vm_read_list_t: interop.StructType<__Reply__vm_read_list_t>;

interface __Reply__vm_read_overwrite_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	outsize: number;
}
declare var __Reply__vm_read_overwrite_t: interop.StructType<__Reply__vm_read_overwrite_t>;

interface __Reply__vm_read_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	data: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	dataCnt: number;
}
declare var __Reply__vm_read_t: interop.StructType<__Reply__vm_read_t>;

interface __Reply__vm_region_64_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	object_name: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	address: number;
	size: number;
	infoCnt: number;
	info: interop.Reference<number>;
}
declare var __Reply__vm_region_64_t: interop.StructType<__Reply__vm_region_64_t>;

interface __Reply__vm_region_recurse_64_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	address: number;
	size: number;
	nesting_depth: number;
	infoCnt: number;
	info: interop.Reference<number>;
}
declare var __Reply__vm_region_recurse_64_t: interop.StructType<__Reply__vm_region_recurse_64_t>;

interface __Reply__vm_region_recurse_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	address: number;
	size: number;
	nesting_depth: number;
	infoCnt: number;
	info: interop.Reference<number>;
}
declare var __Reply__vm_region_recurse_t: interop.StructType<__Reply__vm_region_recurse_t>;

interface __Reply__vm_region_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	object_name: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	address: number;
	size: number;
	infoCnt: number;
	info: interop.Reference<number>;
}
declare var __Reply__vm_region_t: interop.StructType<__Reply__vm_region_t>;

interface __Reply__vm_remap_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	target_address: number;
	cur_protection: number;
	max_protection: number;
}
declare var __Reply__vm_remap_t: interop.StructType<__Reply__vm_remap_t>;

interface __Reply__vm_wire_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__vm_wire_t: interop.StructType<__Reply__vm_wire_t>;

interface __Reply__vm_write_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__vm_write_t: interop.StructType<__Reply__vm_write_t>;

interface __Request___host_page_size_t {
	Head: mach_msg_header_t;
}
declare var __Request___host_page_size_t: interop.StructType<__Request___host_page_size_t>;

interface __Request__act_get_state_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	old_stateCnt: number;
}
declare var __Request__act_get_state_t: interop.StructType<__Request__act_get_state_t>;

interface __Request__act_set_state_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	new_stateCnt: number;
	new_state: interop.Reference<number>;
}
declare var __Request__act_set_state_t: interop.StructType<__Request__act_set_state_t>;

interface __Request__clock_set_attributes_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	clock_attrCnt: number;
	clock_attr: interop.Reference<number>;
}
declare var __Request__clock_set_attributes_t: interop.StructType<__Request__clock_set_attributes_t>;

interface __Request__clock_set_time_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	new_time: mach_timespec_t;
}
declare var __Request__clock_set_time_t: interop.StructType<__Request__clock_set_time_t>;

interface __Request__etap_trace_thread_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	trace_status: number;
}
declare var __Request__etap_trace_thread_t: interop.StructType<__Request__etap_trace_thread_t>;

interface __Request__get_dp_control_port_t {
	Head: mach_msg_header_t;
}
declare var __Request__get_dp_control_port_t: interop.StructType<__Request__get_dp_control_port_t>;

interface __Request__host_check_multiuser_mode_t {
	Head: mach_msg_header_t;
}
declare var __Request__host_check_multiuser_mode_t: interop.StructType<__Request__host_check_multiuser_mode_t>;

interface __Request__host_create_mach_voucher_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	recipesCnt: number;
	recipes: interop.Reference<number>;
}
declare var __Request__host_create_mach_voucher_t: interop.StructType<__Request__host_create_mach_voucher_t>;

interface __Request__host_default_memory_manager_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	default_manager: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	cluster_size: number;
}
declare var __Request__host_default_memory_manager_t: interop.StructType<__Request__host_default_memory_manager_t>;

interface __Request__host_get_UNDServer_t {
	Head: mach_msg_header_t;
}
declare var __Request__host_get_UNDServer_t: interop.StructType<__Request__host_get_UNDServer_t>;

interface __Request__host_get_atm_diagnostic_flag_t {
	Head: mach_msg_header_t;
}
declare var __Request__host_get_atm_diagnostic_flag_t: interop.StructType<__Request__host_get_atm_diagnostic_flag_t>;

interface __Request__host_get_boot_info_t {
	Head: mach_msg_header_t;
}
declare var __Request__host_get_boot_info_t: interop.StructType<__Request__host_get_boot_info_t>;

interface __Request__host_get_clock_control_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	clock_id: number;
}
declare var __Request__host_get_clock_control_t: interop.StructType<__Request__host_get_clock_control_t>;

interface __Request__host_get_clock_service_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	clock_id: number;
}
declare var __Request__host_get_clock_service_t: interop.StructType<__Request__host_get_clock_service_t>;

interface __Request__host_get_exception_ports_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	exception_mask: number;
}
declare var __Request__host_get_exception_ports_t: interop.StructType<__Request__host_get_exception_ports_t>;

interface __Request__host_get_io_master_t {
	Head: mach_msg_header_t;
}
declare var __Request__host_get_io_master_t: interop.StructType<__Request__host_get_io_master_t>;

interface __Request__host_get_multiuser_config_flags_t {
	Head: mach_msg_header_t;
}
declare var __Request__host_get_multiuser_config_flags_t: interop.StructType<__Request__host_get_multiuser_config_flags_t>;

interface __Request__host_get_special_port_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	node: number;
	which: number;
}
declare var __Request__host_get_special_port_t: interop.StructType<__Request__host_get_special_port_t>;

interface __Request__host_info_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	host_info_outCnt: number;
}
declare var __Request__host_info_t: interop.StructType<__Request__host_info_t>;

interface __Request__host_kernel_version_t {
	Head: mach_msg_header_t;
}
declare var __Request__host_kernel_version_t: interop.StructType<__Request__host_kernel_version_t>;

interface __Request__host_lockgroup_info_t {
	Head: mach_msg_header_t;
}
declare var __Request__host_lockgroup_info_t: interop.StructType<__Request__host_lockgroup_info_t>;

interface __Request__host_priv_statistics_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	host_info_outCnt: number;
}
declare var __Request__host_priv_statistics_t: interop.StructType<__Request__host_priv_statistics_t>;

interface __Request__host_processor_info_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
}
declare var __Request__host_processor_info_t: interop.StructType<__Request__host_processor_info_t>;

interface __Request__host_processor_set_priv_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	set_name: mach_msg_port_descriptor_t;
}
declare var __Request__host_processor_set_priv_t: interop.StructType<__Request__host_processor_set_priv_t>;

interface __Request__host_processor_sets_t {
	Head: mach_msg_header_t;
}
declare var __Request__host_processor_sets_t: interop.StructType<__Request__host_processor_sets_t>;

interface __Request__host_processors_t {
	Head: mach_msg_header_t;
}
declare var __Request__host_processors_t: interop.StructType<__Request__host_processors_t>;

interface __Request__host_reboot_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	options: number;
}
declare var __Request__host_reboot_t: interop.StructType<__Request__host_reboot_t>;

interface __Request__host_register_mach_voucher_attr_manager_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	attr_manager: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	default_value: number;
}
declare var __Request__host_register_mach_voucher_attr_manager_t: interop.StructType<__Request__host_register_mach_voucher_attr_manager_t>;

interface __Request__host_register_well_known_mach_voucher_attr_manager_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	attr_manager: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	default_value: number;
	key: number;
}
declare var __Request__host_register_well_known_mach_voucher_attr_manager_t: interop.StructType<__Request__host_register_well_known_mach_voucher_attr_manager_t>;

interface __Request__host_request_notification_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	notify_port: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	notify_type: number;
}
declare var __Request__host_request_notification_t: interop.StructType<__Request__host_request_notification_t>;

interface __Request__host_security_create_task_token_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	parent_task: mach_msg_port_descriptor_t;
	host: mach_msg_port_descriptor_t;
	ledgers: mach_msg_ool_ports_descriptor_t;
	NDR: NDR_record_t;
	sec_token: security_token_t;
	audit_token: audit_token_t;
	ledgersCnt: number;
	inherit_memory: number;
}
declare var __Request__host_security_create_task_token_t: interop.StructType<__Request__host_security_create_task_token_t>;

interface __Request__host_security_set_task_token_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	target_task: mach_msg_port_descriptor_t;
	host: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	sec_token: security_token_t;
	audit_token: audit_token_t;
}
declare var __Request__host_security_set_task_token_t: interop.StructType<__Request__host_security_set_task_token_t>;

interface __Request__host_set_UNDServer_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	server: mach_msg_port_descriptor_t;
}
declare var __Request__host_set_UNDServer_t: interop.StructType<__Request__host_set_UNDServer_t>;

interface __Request__host_set_atm_diagnostic_flag_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	diagnostic_flag: number;
}
declare var __Request__host_set_atm_diagnostic_flag_t: interop.StructType<__Request__host_set_atm_diagnostic_flag_t>;

interface __Request__host_set_exception_ports_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	new_port: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	exception_mask: number;
	behavior: number;
	new_flavor: number;
}
declare var __Request__host_set_exception_ports_t: interop.StructType<__Request__host_set_exception_ports_t>;

interface __Request__host_set_multiuser_config_flags_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	multiuser_flags: number;
}
declare var __Request__host_set_multiuser_config_flags_t: interop.StructType<__Request__host_set_multiuser_config_flags_t>;

interface __Request__host_set_special_port_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	port: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	which: number;
}
declare var __Request__host_set_special_port_t: interop.StructType<__Request__host_set_special_port_t>;

interface __Request__host_statistics64_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	host_info64_outCnt: number;
}
declare var __Request__host_statistics64_t: interop.StructType<__Request__host_statistics64_t>;

interface __Request__host_statistics_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	host_info_outCnt: number;
}
declare var __Request__host_statistics_t: interop.StructType<__Request__host_statistics_t>;

interface __Request__host_swap_exception_ports_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	new_port: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	exception_mask: number;
	behavior: number;
	new_flavor: number;
}
declare var __Request__host_swap_exception_ports_t: interop.StructType<__Request__host_swap_exception_ports_t>;

interface __Request__host_virtual_physical_table_info_t {
	Head: mach_msg_header_t;
}
declare var __Request__host_virtual_physical_table_info_t: interop.StructType<__Request__host_virtual_physical_table_info_t>;

interface __Request__host_zone_info_t {
	Head: mach_msg_header_t;
}
declare var __Request__host_zone_info_t: interop.StructType<__Request__host_zone_info_t>;

interface __Request__kext_request_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	request_data: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	user_log_flags: number;
	request_dataCnt: number;
}
declare var __Request__kext_request_t: interop.StructType<__Request__kext_request_t>;

interface __Request__kmod_control_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	data: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	module: number;
	flavor: number;
	dataCnt: number;
}
declare var __Request__kmod_control_t: interop.StructType<__Request__kmod_control_t>;

interface __Request__kmod_create_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	info: number;
}
declare var __Request__kmod_create_t: interop.StructType<__Request__kmod_create_t>;

interface __Request__kmod_destroy_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	module: number;
}
declare var __Request__kmod_destroy_t: interop.StructType<__Request__kmod_destroy_t>;

interface __Request__kmod_get_info_t {
	Head: mach_msg_header_t;
}
declare var __Request__kmod_get_info_t: interop.StructType<__Request__kmod_get_info_t>;

interface __Request__lock_acquire_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	lock_id: number;
}
declare var __Request__lock_acquire_t: interop.StructType<__Request__lock_acquire_t>;

interface __Request__lock_handoff_accept_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	lock_id: number;
}
declare var __Request__lock_handoff_accept_t: interop.StructType<__Request__lock_handoff_accept_t>;

interface __Request__lock_handoff_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	lock_id: number;
}
declare var __Request__lock_handoff_t: interop.StructType<__Request__lock_handoff_t>;

interface __Request__lock_make_stable_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	lock_id: number;
}
declare var __Request__lock_make_stable_t: interop.StructType<__Request__lock_make_stable_t>;

interface __Request__lock_release_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	lock_id: number;
}
declare var __Request__lock_release_t: interop.StructType<__Request__lock_release_t>;

interface __Request__lock_set_create_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	n_ulocks: number;
	policy: number;
}
declare var __Request__lock_set_create_t: interop.StructType<__Request__lock_set_create_t>;

interface __Request__lock_set_destroy_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	lock_set: mach_msg_port_descriptor_t;
}
declare var __Request__lock_set_destroy_t: interop.StructType<__Request__lock_set_destroy_t>;

interface __Request__lock_try_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	lock_id: number;
}
declare var __Request__lock_try_t: interop.StructType<__Request__lock_try_t>;

interface __Request__mach_make_memory_entry_64_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	parent_entry: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	size: number;
	offset: number;
	permission: number;
}
declare var __Request__mach_make_memory_entry_64_t: interop.StructType<__Request__mach_make_memory_entry_64_t>;

interface __Request__mach_make_memory_entry_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	parent_entry: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	size: number;
	offset: number;
	permission: number;
}
declare var __Request__mach_make_memory_entry_t: interop.StructType<__Request__mach_make_memory_entry_t>;

interface __Request__mach_memory_info_t {
	Head: mach_msg_header_t;
}
declare var __Request__mach_memory_info_t: interop.StructType<__Request__mach_memory_info_t>;

interface __Request__mach_memory_object_memory_entry_64_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	pager: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	internal: number;
	size: number;
	permission: number;
}
declare var __Request__mach_memory_object_memory_entry_64_t: interop.StructType<__Request__mach_memory_object_memory_entry_64_t>;

interface __Request__mach_memory_object_memory_entry_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	pager: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	internal: number;
	size: number;
	permission: number;
}
declare var __Request__mach_memory_object_memory_entry_t: interop.StructType<__Request__mach_memory_object_memory_entry_t>;

interface __Request__mach_port_allocate_full_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	proto: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	right: number;
	qos: mach_port_qos_t;
	name: number;
}
declare var __Request__mach_port_allocate_full_t: interop.StructType<__Request__mach_port_allocate_full_t>;

interface __Request__mach_port_allocate_name_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	right: number;
	name: number;
}
declare var __Request__mach_port_allocate_name_t: interop.StructType<__Request__mach_port_allocate_name_t>;

interface __Request__mach_port_allocate_qos_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	right: number;
	qos: mach_port_qos_t;
}
declare var __Request__mach_port_allocate_qos_t: interop.StructType<__Request__mach_port_allocate_qos_t>;

interface __Request__mach_port_allocate_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	right: number;
}
declare var __Request__mach_port_allocate_t: interop.StructType<__Request__mach_port_allocate_t>;

interface __Request__mach_port_construct_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	options: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	context: number;
}
declare var __Request__mach_port_construct_t: interop.StructType<__Request__mach_port_construct_t>;

interface __Request__mach_port_deallocate_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
}
declare var __Request__mach_port_deallocate_t: interop.StructType<__Request__mach_port_deallocate_t>;

interface __Request__mach_port_destroy_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
}
declare var __Request__mach_port_destroy_t: interop.StructType<__Request__mach_port_destroy_t>;

interface __Request__mach_port_destruct_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
	srdelta: number;
	guard: number;
}
declare var __Request__mach_port_destruct_t: interop.StructType<__Request__mach_port_destruct_t>;

interface __Request__mach_port_dnrequest_info_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
}
declare var __Request__mach_port_dnrequest_info_t: interop.StructType<__Request__mach_port_dnrequest_info_t>;

interface __Request__mach_port_extract_member_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
	pset: number;
}
declare var __Request__mach_port_extract_member_t: interop.StructType<__Request__mach_port_extract_member_t>;

interface __Request__mach_port_extract_right_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
	msgt_name: number;
}
declare var __Request__mach_port_extract_right_t: interop.StructType<__Request__mach_port_extract_right_t>;

interface __Request__mach_port_get_attributes_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
	flavor: number;
	port_info_outCnt: number;
}
declare var __Request__mach_port_get_attributes_t: interop.StructType<__Request__mach_port_get_attributes_t>;

interface __Request__mach_port_get_context_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
}
declare var __Request__mach_port_get_context_t: interop.StructType<__Request__mach_port_get_context_t>;

interface __Request__mach_port_get_refs_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
	right: number;
}
declare var __Request__mach_port_get_refs_t: interop.StructType<__Request__mach_port_get_refs_t>;

interface __Request__mach_port_get_set_status_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
}
declare var __Request__mach_port_get_set_status_t: interop.StructType<__Request__mach_port_get_set_status_t>;

interface __Request__mach_port_get_srights_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
}
declare var __Request__mach_port_get_srights_t: interop.StructType<__Request__mach_port_get_srights_t>;

interface __Request__mach_port_guard_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
	guard: number;
	strict: number;
}
declare var __Request__mach_port_guard_t: interop.StructType<__Request__mach_port_guard_t>;

interface __Request__mach_port_insert_member_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
	pset: number;
}
declare var __Request__mach_port_insert_member_t: interop.StructType<__Request__mach_port_insert_member_t>;

interface __Request__mach_port_insert_right_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	poly: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	name: number;
}
declare var __Request__mach_port_insert_right_t: interop.StructType<__Request__mach_port_insert_right_t>;

interface __Request__mach_port_kernel_object_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
}
declare var __Request__mach_port_kernel_object_t: interop.StructType<__Request__mach_port_kernel_object_t>;

interface __Request__mach_port_kobject_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
}
declare var __Request__mach_port_kobject_t: interop.StructType<__Request__mach_port_kobject_t>;

interface __Request__mach_port_mod_refs_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
	right: number;
	delta: number;
}
declare var __Request__mach_port_mod_refs_t: interop.StructType<__Request__mach_port_mod_refs_t>;

interface __Request__mach_port_move_member_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	member: number;
	after: number;
}
declare var __Request__mach_port_move_member_t: interop.StructType<__Request__mach_port_move_member_t>;

interface __Request__mach_port_names_t {
	Head: mach_msg_header_t;
}
declare var __Request__mach_port_names_t: interop.StructType<__Request__mach_port_names_t>;

interface __Request__mach_port_peek_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
	trailer_type: number;
	request_seqnop: number;
	trailer_infopCnt: number;
}
declare var __Request__mach_port_peek_t: interop.StructType<__Request__mach_port_peek_t>;

interface __Request__mach_port_rename_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	old_name: number;
	new_name: number;
}
declare var __Request__mach_port_rename_t: interop.StructType<__Request__mach_port_rename_t>;

interface __Request__mach_port_request_notification_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	notify: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	name: number;
	msgid: number;
	sync: number;
}
declare var __Request__mach_port_request_notification_t: interop.StructType<__Request__mach_port_request_notification_t>;

interface __Request__mach_port_set_attributes_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
	flavor: number;
	port_infoCnt: number;
	port_info: interop.Reference<number>;
}
declare var __Request__mach_port_set_attributes_t: interop.StructType<__Request__mach_port_set_attributes_t>;

interface __Request__mach_port_set_context_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
	context: number;
}
declare var __Request__mach_port_set_context_t: interop.StructType<__Request__mach_port_set_context_t>;

interface __Request__mach_port_set_mscount_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
	mscount: number;
}
declare var __Request__mach_port_set_mscount_t: interop.StructType<__Request__mach_port_set_mscount_t>;

interface __Request__mach_port_set_seqno_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
	seqno: number;
}
declare var __Request__mach_port_set_seqno_t: interop.StructType<__Request__mach_port_set_seqno_t>;

interface __Request__mach_port_space_basic_info_t {
	Head: mach_msg_header_t;
}
declare var __Request__mach_port_space_basic_info_t: interop.StructType<__Request__mach_port_space_basic_info_t>;

interface __Request__mach_port_space_info_t {
	Head: mach_msg_header_t;
}
declare var __Request__mach_port_space_info_t: interop.StructType<__Request__mach_port_space_info_t>;

interface __Request__mach_port_type_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
}
declare var __Request__mach_port_type_t: interop.StructType<__Request__mach_port_type_t>;

interface __Request__mach_port_unguard_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
	guard: number;
}
declare var __Request__mach_port_unguard_t: interop.StructType<__Request__mach_port_unguard_t>;

interface __Request__mach_ports_lookup_t {
	Head: mach_msg_header_t;
}
declare var __Request__mach_ports_lookup_t: interop.StructType<__Request__mach_ports_lookup_t>;

interface __Request__mach_ports_register_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	init_port_set: mach_msg_ool_ports_descriptor_t;
	NDR: NDR_record_t;
	init_port_setCnt: number;
}
declare var __Request__mach_ports_register_t: interop.StructType<__Request__mach_ports_register_t>;

interface __Request__mach_vm_region_info_64_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	address: number;
}
declare var __Request__mach_vm_region_info_64_t: interop.StructType<__Request__mach_vm_region_info_64_t>;

interface __Request__mach_vm_region_info_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	address: number;
}
declare var __Request__mach_vm_region_info_t: interop.StructType<__Request__mach_vm_region_info_t>;

interface __Request__mach_vm_wire_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	task: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	address: number;
	size: number;
	desired_access: number;
}
declare var __Request__mach_vm_wire_t: interop.StructType<__Request__mach_vm_wire_t>;

interface __Request__mach_zone_info_t {
	Head: mach_msg_header_t;
}
declare var __Request__mach_zone_info_t: interop.StructType<__Request__mach_zone_info_t>;

interface __Request__processor_assign_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	new_set: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	wait: number;
}
declare var __Request__processor_assign_t: interop.StructType<__Request__processor_assign_t>;

interface __Request__processor_control_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	processor_cmdCnt: number;
	processor_cmd: interop.Reference<number>;
}
declare var __Request__processor_control_t: interop.StructType<__Request__processor_control_t>;

interface __Request__processor_exit_t {
	Head: mach_msg_header_t;
}
declare var __Request__processor_exit_t: interop.StructType<__Request__processor_exit_t>;

interface __Request__processor_get_assignment_t {
	Head: mach_msg_header_t;
}
declare var __Request__processor_get_assignment_t: interop.StructType<__Request__processor_get_assignment_t>;

interface __Request__processor_info_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	processor_info_outCnt: number;
}
declare var __Request__processor_info_t: interop.StructType<__Request__processor_info_t>;

interface __Request__processor_set_create_t {
	Head: mach_msg_header_t;
}
declare var __Request__processor_set_create_t: interop.StructType<__Request__processor_set_create_t>;

interface __Request__processor_set_default_t {
	Head: mach_msg_header_t;
}
declare var __Request__processor_set_default_t: interop.StructType<__Request__processor_set_default_t>;

interface __Request__processor_set_destroy_t {
	Head: mach_msg_header_t;
}
declare var __Request__processor_set_destroy_t: interop.StructType<__Request__processor_set_destroy_t>;

interface __Request__processor_set_info_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	info_outCnt: number;
}
declare var __Request__processor_set_info_t: interop.StructType<__Request__processor_set_info_t>;

interface __Request__processor_set_max_priority_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	max_priority: number;
	change_threads: number;
}
declare var __Request__processor_set_max_priority_t: interop.StructType<__Request__processor_set_max_priority_t>;

interface __Request__processor_set_policy_control_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	policy_infoCnt: number;
	policy_info: interop.Reference<number>;
	change: number;
}
declare var __Request__processor_set_policy_control_t: interop.StructType<__Request__processor_set_policy_control_t>;

interface __Request__processor_set_policy_disable_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	policy: number;
	change_threads: number;
}
declare var __Request__processor_set_policy_disable_t: interop.StructType<__Request__processor_set_policy_disable_t>;

interface __Request__processor_set_policy_enable_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	policy: number;
}
declare var __Request__processor_set_policy_enable_t: interop.StructType<__Request__processor_set_policy_enable_t>;

interface __Request__processor_set_stack_usage_t {
	Head: mach_msg_header_t;
}
declare var __Request__processor_set_stack_usage_t: interop.StructType<__Request__processor_set_stack_usage_t>;

interface __Request__processor_set_statistics_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	info_outCnt: number;
}
declare var __Request__processor_set_statistics_t: interop.StructType<__Request__processor_set_statistics_t>;

interface __Request__processor_set_tasks_t {
	Head: mach_msg_header_t;
}
declare var __Request__processor_set_tasks_t: interop.StructType<__Request__processor_set_tasks_t>;

interface __Request__processor_set_threads_t {
	Head: mach_msg_header_t;
}
declare var __Request__processor_set_threads_t: interop.StructType<__Request__processor_set_threads_t>;

interface __Request__processor_start_t {
	Head: mach_msg_header_t;
}
declare var __Request__processor_start_t: interop.StructType<__Request__processor_start_t>;

interface __Request__semaphore_create_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	policy: number;
	value: number;
}
declare var __Request__semaphore_create_t: interop.StructType<__Request__semaphore_create_t>;

interface __Request__semaphore_destroy_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	semaphore: mach_msg_port_descriptor_t;
}
declare var __Request__semaphore_destroy_t: interop.StructType<__Request__semaphore_destroy_t>;

interface __Request__set_dp_control_port_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	control_port: mach_msg_port_descriptor_t;
}
declare var __Request__set_dp_control_port_t: interop.StructType<__Request__set_dp_control_port_t>;

interface __Request__task_assign_default_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	assign_threads: number;
}
declare var __Request__task_assign_default_t: interop.StructType<__Request__task_assign_default_t>;

interface __Request__task_assign_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	new_set: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	assign_threads: number;
}
declare var __Request__task_assign_t: interop.StructType<__Request__task_assign_t>;

interface __Request__task_create_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	ledgers: mach_msg_ool_ports_descriptor_t;
	NDR: NDR_record_t;
	ledgersCnt: number;
	inherit_memory: number;
}
declare var __Request__task_create_t: interop.StructType<__Request__task_create_t>;

interface __Request__task_generate_corpse_t {
	Head: mach_msg_header_t;
}
declare var __Request__task_generate_corpse_t: interop.StructType<__Request__task_generate_corpse_t>;

interface __Request__task_get_assignment_t {
	Head: mach_msg_header_t;
}
declare var __Request__task_get_assignment_t: interop.StructType<__Request__task_get_assignment_t>;

interface __Request__task_get_dyld_image_infos_t {
	Head: mach_msg_header_t;
}
declare var __Request__task_get_dyld_image_infos_t: interop.StructType<__Request__task_get_dyld_image_infos_t>;

interface __Request__task_get_emulation_vector_t {
	Head: mach_msg_header_t;
}
declare var __Request__task_get_emulation_vector_t: interop.StructType<__Request__task_get_emulation_vector_t>;

interface __Request__task_get_exception_ports_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	exception_mask: number;
}
declare var __Request__task_get_exception_ports_t: interop.StructType<__Request__task_get_exception_ports_t>;

interface __Request__task_get_mach_voucher_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	which: number;
}
declare var __Request__task_get_mach_voucher_t: interop.StructType<__Request__task_get_mach_voucher_t>;

interface __Request__task_get_special_port_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	which_port: number;
}
declare var __Request__task_get_special_port_t: interop.StructType<__Request__task_get_special_port_t>;

interface __Request__task_get_state_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	old_stateCnt: number;
}
declare var __Request__task_get_state_t: interop.StructType<__Request__task_get_state_t>;

interface __Request__task_info_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	task_info_outCnt: number;
}
declare var __Request__task_info_t: interop.StructType<__Request__task_info_t>;

interface __Request__task_map_corpse_info_64_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	corspe_task: mach_msg_port_descriptor_t;
}
declare var __Request__task_map_corpse_info_64_t: interop.StructType<__Request__task_map_corpse_info_64_t>;

interface __Request__task_map_corpse_info_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	corspe_task: mach_msg_port_descriptor_t;
}
declare var __Request__task_map_corpse_info_t: interop.StructType<__Request__task_map_corpse_info_t>;

interface __Request__task_policy_get_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	policy_infoCnt: number;
	get_default: number;
}
declare var __Request__task_policy_get_t: interop.StructType<__Request__task_policy_get_t>;

interface __Request__task_policy_set_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	policy_infoCnt: number;
	policy_info: interop.Reference<number>;
}
declare var __Request__task_policy_set_t: interop.StructType<__Request__task_policy_set_t>;

interface __Request__task_policy_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	policy: number;
	baseCnt: number;
	base: interop.Reference<number>;
	set_limit: number;
	change: number;
}
declare var __Request__task_policy_t: interop.StructType<__Request__task_policy_t>;

interface __Request__task_purgable_info_t {
	Head: mach_msg_header_t;
}
declare var __Request__task_purgable_info_t: interop.StructType<__Request__task_purgable_info_t>;

interface __Request__task_register_dyld_get_process_state_t {
	Head: mach_msg_header_t;
}
declare var __Request__task_register_dyld_get_process_state_t: interop.StructType<__Request__task_register_dyld_get_process_state_t>;

interface __Request__task_register_dyld_image_infos_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	dyld_images: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	dyld_imagesCnt: number;
}
declare var __Request__task_register_dyld_image_infos_t: interop.StructType<__Request__task_register_dyld_image_infos_t>;

interface __Request__task_register_dyld_set_dyld_state_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	dyld_state: number;
	dyld_statePad: interop.Reference<number>;
}
declare var __Request__task_register_dyld_set_dyld_state_t: interop.StructType<__Request__task_register_dyld_set_dyld_state_t>;

interface __Request__task_resume2_t {
	Head: mach_msg_header_t;
}
declare var __Request__task_resume2_t: interop.StructType<__Request__task_resume2_t>;

interface __Request__task_resume_t {
	Head: mach_msg_header_t;
}
declare var __Request__task_resume_t: interop.StructType<__Request__task_resume_t>;

interface __Request__task_sample_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	reply: mach_msg_port_descriptor_t;
}
declare var __Request__task_sample_t: interop.StructType<__Request__task_sample_t>;

interface __Request__task_set_emulation_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	routine_entry_pt: number;
	routine_number: number;
}
declare var __Request__task_set_emulation_t: interop.StructType<__Request__task_set_emulation_t>;

interface __Request__task_set_emulation_vector_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	emulation_vector: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	vector_start: number;
	emulation_vectorCnt: number;
}
declare var __Request__task_set_emulation_vector_t: interop.StructType<__Request__task_set_emulation_vector_t>;

interface __Request__task_set_exception_ports_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	new_port: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	exception_mask: number;
	behavior: number;
	new_flavor: number;
}
declare var __Request__task_set_exception_ports_t: interop.StructType<__Request__task_set_exception_ports_t>;

interface __Request__task_set_info_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	task_info_inCnt: number;
	task_info_in: interop.Reference<number>;
}
declare var __Request__task_set_info_t: interop.StructType<__Request__task_set_info_t>;

interface __Request__task_set_mach_voucher_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	voucher: mach_msg_port_descriptor_t;
}
declare var __Request__task_set_mach_voucher_t: interop.StructType<__Request__task_set_mach_voucher_t>;

interface __Request__task_set_phys_footprint_limit_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	new_limit: number;
}
declare var __Request__task_set_phys_footprint_limit_t: interop.StructType<__Request__task_set_phys_footprint_limit_t>;

interface __Request__task_set_policy_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	pset: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	policy: number;
	baseCnt: number;
	base: interop.Reference<number>;
	limitCnt: number;
	limit: interop.Reference<number>;
	change: number;
}
declare var __Request__task_set_policy_t: interop.StructType<__Request__task_set_policy_t>;

interface __Request__task_set_port_space_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	table_entries: number;
}
declare var __Request__task_set_port_space_t: interop.StructType<__Request__task_set_port_space_t>;

interface __Request__task_set_ras_pc_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	basepc: number;
	boundspc: number;
}
declare var __Request__task_set_ras_pc_t: interop.StructType<__Request__task_set_ras_pc_t>;

interface __Request__task_set_special_port_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	special_port: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	which_port: number;
}
declare var __Request__task_set_special_port_t: interop.StructType<__Request__task_set_special_port_t>;

interface __Request__task_set_state_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	new_stateCnt: number;
	new_state: interop.Reference<number>;
}
declare var __Request__task_set_state_t: interop.StructType<__Request__task_set_state_t>;

interface __Request__task_suspend2_t {
	Head: mach_msg_header_t;
}
declare var __Request__task_suspend2_t: interop.StructType<__Request__task_suspend2_t>;

interface __Request__task_suspend_t {
	Head: mach_msg_header_t;
}
declare var __Request__task_suspend_t: interop.StructType<__Request__task_suspend_t>;

interface __Request__task_swap_exception_ports_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	new_port: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	exception_mask: number;
	behavior: number;
	new_flavor: number;
}
declare var __Request__task_swap_exception_ports_t: interop.StructType<__Request__task_swap_exception_ports_t>;

interface __Request__task_swap_mach_voucher_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	new_voucher: mach_msg_port_descriptor_t;
	old_voucher: mach_msg_port_descriptor_t;
}
declare var __Request__task_swap_mach_voucher_t: interop.StructType<__Request__task_swap_mach_voucher_t>;

interface __Request__task_terminate_t {
	Head: mach_msg_header_t;
}
declare var __Request__task_terminate_t: interop.StructType<__Request__task_terminate_t>;

interface __Request__task_threads_t {
	Head: mach_msg_header_t;
}
declare var __Request__task_threads_t: interop.StructType<__Request__task_threads_t>;

interface __Request__task_unregister_dyld_image_infos_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	dyld_images: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	dyld_imagesCnt: number;
}
declare var __Request__task_unregister_dyld_image_infos_t: interop.StructType<__Request__task_unregister_dyld_image_infos_t>;

interface __Request__task_wire_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	must_wire: number;
}
declare var __Request__task_wire_t: interop.StructType<__Request__task_wire_t>;

interface __Request__task_zone_info_t {
	Head: mach_msg_header_t;
}
declare var __Request__task_zone_info_t: interop.StructType<__Request__task_zone_info_t>;

interface __Request__thread_abort_safely_t {
	Head: mach_msg_header_t;
}
declare var __Request__thread_abort_safely_t: interop.StructType<__Request__thread_abort_safely_t>;

interface __Request__thread_abort_t {
	Head: mach_msg_header_t;
}
declare var __Request__thread_abort_t: interop.StructType<__Request__thread_abort_t>;

interface __Request__thread_assign_default_t {
	Head: mach_msg_header_t;
}
declare var __Request__thread_assign_default_t: interop.StructType<__Request__thread_assign_default_t>;

interface __Request__thread_assign_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	new_set: mach_msg_port_descriptor_t;
}
declare var __Request__thread_assign_t: interop.StructType<__Request__thread_assign_t>;

interface __Request__thread_create_running_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	new_stateCnt: number;
	new_state: interop.Reference<number>;
}
declare var __Request__thread_create_running_t: interop.StructType<__Request__thread_create_running_t>;

interface __Request__thread_create_t {
	Head: mach_msg_header_t;
}
declare var __Request__thread_create_t: interop.StructType<__Request__thread_create_t>;

interface __Request__thread_depress_abort_t {
	Head: mach_msg_header_t;
}
declare var __Request__thread_depress_abort_t: interop.StructType<__Request__thread_depress_abort_t>;

interface __Request__thread_get_assignment_t {
	Head: mach_msg_header_t;
}
declare var __Request__thread_get_assignment_t: interop.StructType<__Request__thread_get_assignment_t>;

interface __Request__thread_get_exception_ports_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	exception_mask: number;
}
declare var __Request__thread_get_exception_ports_t: interop.StructType<__Request__thread_get_exception_ports_t>;

interface __Request__thread_get_mach_voucher_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	which: number;
}
declare var __Request__thread_get_mach_voucher_t: interop.StructType<__Request__thread_get_mach_voucher_t>;

interface __Request__thread_get_special_port_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	which_port: number;
}
declare var __Request__thread_get_special_port_t: interop.StructType<__Request__thread_get_special_port_t>;

interface __Request__thread_get_state_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	old_stateCnt: number;
}
declare var __Request__thread_get_state_t: interop.StructType<__Request__thread_get_state_t>;

interface __Request__thread_info_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	thread_info_outCnt: number;
}
declare var __Request__thread_info_t: interop.StructType<__Request__thread_info_t>;

interface __Request__thread_policy_get_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	policy_infoCnt: number;
	get_default: number;
}
declare var __Request__thread_policy_get_t: interop.StructType<__Request__thread_policy_get_t>;

interface __Request__thread_policy_set_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	policy_infoCnt: number;
	policy_info: interop.Reference<number>;
}
declare var __Request__thread_policy_set_t: interop.StructType<__Request__thread_policy_set_t>;

interface __Request__thread_policy_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	policy: number;
	baseCnt: number;
	base: interop.Reference<number>;
	set_limit: number;
}
declare var __Request__thread_policy_t: interop.StructType<__Request__thread_policy_t>;

interface __Request__thread_resume_t {
	Head: mach_msg_header_t;
}
declare var __Request__thread_resume_t: interop.StructType<__Request__thread_resume_t>;

interface __Request__thread_sample_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	reply: mach_msg_port_descriptor_t;
}
declare var __Request__thread_sample_t: interop.StructType<__Request__thread_sample_t>;

interface __Request__thread_set_exception_ports_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	new_port: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	exception_mask: number;
	behavior: number;
	new_flavor: number;
}
declare var __Request__thread_set_exception_ports_t: interop.StructType<__Request__thread_set_exception_ports_t>;

interface __Request__thread_set_mach_voucher_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	voucher: mach_msg_port_descriptor_t;
}
declare var __Request__thread_set_mach_voucher_t: interop.StructType<__Request__thread_set_mach_voucher_t>;

interface __Request__thread_set_policy_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	pset: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	policy: number;
	baseCnt: number;
	base: interop.Reference<number>;
	limitCnt: number;
	limit: interop.Reference<number>;
}
declare var __Request__thread_set_policy_t: interop.StructType<__Request__thread_set_policy_t>;

interface __Request__thread_set_special_port_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	special_port: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	which_port: number;
}
declare var __Request__thread_set_special_port_t: interop.StructType<__Request__thread_set_special_port_t>;

interface __Request__thread_set_state_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	new_stateCnt: number;
	new_state: interop.Reference<number>;
}
declare var __Request__thread_set_state_t: interop.StructType<__Request__thread_set_state_t>;

interface __Request__thread_suspend_t {
	Head: mach_msg_header_t;
}
declare var __Request__thread_suspend_t: interop.StructType<__Request__thread_suspend_t>;

interface __Request__thread_swap_exception_ports_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	new_port: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	exception_mask: number;
	behavior: number;
	new_flavor: number;
}
declare var __Request__thread_swap_exception_ports_t: interop.StructType<__Request__thread_swap_exception_ports_t>;

interface __Request__thread_swap_mach_voucher_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	new_voucher: mach_msg_port_descriptor_t;
	old_voucher: mach_msg_port_descriptor_t;
}
declare var __Request__thread_swap_mach_voucher_t: interop.StructType<__Request__thread_swap_mach_voucher_t>;

interface __Request__thread_terminate_t {
	Head: mach_msg_header_t;
}
declare var __Request__thread_terminate_t: interop.StructType<__Request__thread_terminate_t>;

interface __Request__thread_wire_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	thread: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	wired: number;
}
declare var __Request__thread_wire_t: interop.StructType<__Request__thread_wire_t>;

interface __Request__vm_allocate_cpm_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	task: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	address: number;
	size: number;
	flags: number;
}
declare var __Request__vm_allocate_cpm_t: interop.StructType<__Request__vm_allocate_cpm_t>;

interface __Request__vm_allocate_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	address: number;
	size: number;
	flags: number;
}
declare var __Request__vm_allocate_t: interop.StructType<__Request__vm_allocate_t>;

interface __Request__vm_behavior_set_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	address: number;
	size: number;
	new_behavior: number;
}
declare var __Request__vm_behavior_set_t: interop.StructType<__Request__vm_behavior_set_t>;

interface __Request__vm_copy_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	source_address: number;
	size: number;
	dest_address: number;
}
declare var __Request__vm_copy_t: interop.StructType<__Request__vm_copy_t>;

interface __Request__vm_deallocate_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	address: number;
	size: number;
}
declare var __Request__vm_deallocate_t: interop.StructType<__Request__vm_deallocate_t>;

interface __Request__vm_inherit_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	address: number;
	size: number;
	new_inheritance: number;
}
declare var __Request__vm_inherit_t: interop.StructType<__Request__vm_inherit_t>;

interface __Request__vm_machine_attribute_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	address: number;
	size: number;
	attribute: number;
	value: number;
}
declare var __Request__vm_machine_attribute_t: interop.StructType<__Request__vm_machine_attribute_t>;

interface __Request__vm_map_64_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	object: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	address: number;
	size: number;
	mask: number;
	flags: number;
	offset: number;
	copy: number;
	cur_protection: number;
	max_protection: number;
	inheritance: number;
}
declare var __Request__vm_map_64_t: interop.StructType<__Request__vm_map_64_t>;

interface __Request__vm_map_page_query_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	offset: number;
}
declare var __Request__vm_map_page_query_t: interop.StructType<__Request__vm_map_page_query_t>;

interface __Request__vm_map_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	object: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	address: number;
	size: number;
	mask: number;
	flags: number;
	offset: number;
	copy: number;
	cur_protection: number;
	max_protection: number;
	inheritance: number;
}
declare var __Request__vm_map_t: interop.StructType<__Request__vm_map_t>;

interface __Request__vm_mapped_pages_info_t {
	Head: mach_msg_header_t;
}
declare var __Request__vm_mapped_pages_info_t: interop.StructType<__Request__vm_mapped_pages_info_t>;

interface __Request__vm_msync_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	address: number;
	size: number;
	sync_flags: number;
}
declare var __Request__vm_msync_t: interop.StructType<__Request__vm_msync_t>;

interface __Request__vm_protect_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	address: number;
	size: number;
	set_maximum: number;
	new_protection: number;
}
declare var __Request__vm_protect_t: interop.StructType<__Request__vm_protect_t>;

interface __Request__vm_purgable_control_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	address: number;
	control: number;
	state: number;
}
declare var __Request__vm_purgable_control_t: interop.StructType<__Request__vm_purgable_control_t>;

interface __Request__vm_read_list_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	data_list: interop.Reference<vm_read_entry>;
	count: number;
}
declare var __Request__vm_read_list_t: interop.StructType<__Request__vm_read_list_t>;

interface __Request__vm_read_overwrite_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	address: number;
	size: number;
	data: number;
}
declare var __Request__vm_read_overwrite_t: interop.StructType<__Request__vm_read_overwrite_t>;

interface __Request__vm_read_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	address: number;
	size: number;
}
declare var __Request__vm_read_t: interop.StructType<__Request__vm_read_t>;

interface __Request__vm_region_64_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	address: number;
	flavor: number;
	infoCnt: number;
}
declare var __Request__vm_region_64_t: interop.StructType<__Request__vm_region_64_t>;

interface __Request__vm_region_recurse_64_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	address: number;
	nesting_depth: number;
	infoCnt: number;
}
declare var __Request__vm_region_recurse_64_t: interop.StructType<__Request__vm_region_recurse_64_t>;

interface __Request__vm_region_recurse_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	address: number;
	nesting_depth: number;
	infoCnt: number;
}
declare var __Request__vm_region_recurse_t: interop.StructType<__Request__vm_region_recurse_t>;

interface __Request__vm_region_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	address: number;
	flavor: number;
	infoCnt: number;
}
declare var __Request__vm_region_t: interop.StructType<__Request__vm_region_t>;

interface __Request__vm_remap_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	src_task: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	target_address: number;
	size: number;
	mask: number;
	flags: number;
	src_address: number;
	copy: number;
	inheritance: number;
}
declare var __Request__vm_remap_t: interop.StructType<__Request__vm_remap_t>;

interface __Request__vm_wire_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	task: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	address: number;
	size: number;
	desired_access: number;
}
declare var __Request__vm_wire_t: interop.StructType<__Request__vm_wire_t>;

interface __Request__vm_write_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	data: mach_msg_ool_descriptor_t;
	NDR: NDR_record_t;
	address: number;
	dataCnt: number;
}
declare var __Request__vm_write_t: interop.StructType<__Request__vm_write_t>;

declare function ___runetype(p1: number): number;

declare function ___tolower(p1: number): number;

declare function ___toupper(p1: number): number;

declare function __cospi(p1: number): number;

declare function __cospif(p1: number): number;

interface __darwin_pthread_handler_rec {
	__routine: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	__arg: interop.Pointer | interop.Reference<any>;
	__next: interop.Pointer | interop.Reference<__darwin_pthread_handler_rec>;
}
declare var __darwin_pthread_handler_rec: interop.StructType<__darwin_pthread_handler_rec>;

interface __double2 {
	__sinval: number;
	__cosval: number;
}
declare var __double2: interop.StructType<__double2>;

declare function __error(): interop.Pointer | interop.Reference<number>;

declare function __exp10(p1: number): number;

declare function __exp10f(p1: number): number;

interface __float2 {
	__sinval: number;
	__cosval: number;
}
declare var __float2: interop.StructType<__float2>;

declare function __fpclassifyd(p1: number): number;

declare function __fpclassifyf(p1: number): number;

declare function __fpclassifyl(p1: number): number;

declare function __inline_isfinited(p1: number): number;

declare function __inline_isfinitef(p1: number): number;

declare function __inline_isfinitel(p1: number): number;

declare function __inline_isinfd(p1: number): number;

declare function __inline_isinff(p1: number): number;

declare function __inline_isinfl(p1: number): number;

declare function __inline_isnand(p1: number): number;

declare function __inline_isnanf(p1: number): number;

declare function __inline_isnanl(p1: number): number;

declare function __inline_isnormald(p1: number): number;

declare function __inline_isnormalf(p1: number): number;

declare function __inline_isnormall(p1: number): number;

declare function __inline_signbitd(p1: number): number;

declare function __inline_signbitf(p1: number): number;

declare function __inline_signbitl(p1: number): number;

declare function __maskrune(p1: number, p2: number): number;

declare function __math_errhandling(): number;

declare var __mb_cur_max: number;

interface __msfilterreq {
	msfr_ifindex: number;
	msfr_fmode: number;
	msfr_nsrcs: number;
	__msfr_align: number;
	msfr_group: sockaddr_storage;
	msfr_srcs: interop.Pointer | interop.Reference<sockaddr_storage>;
}
declare var __msfilterreq: interop.StructType<__msfilterreq>;

interface __sbuf {
	_base: string;
	_size: number;
}
declare var __sbuf: interop.StructType<__sbuf>;

declare function __sincos(__x: number, __sinp: interop.Pointer | interop.Reference<number>, __cosp: interop.Pointer | interop.Reference<number>): void;

declare function __sincos_stret(p1: number): __double2;

declare function __sincosf(__x: number, __sinp: interop.Pointer | interop.Reference<number>, __cosp: interop.Pointer | interop.Reference<number>): void;

declare function __sincosf_stret(p1: number): __float2;

declare function __sincospi(__x: number, __sinp: interop.Pointer | interop.Reference<number>, __cosp: interop.Pointer | interop.Reference<number>): void;

declare function __sincospi_stret(p1: number): __double2;

declare function __sincospif(__x: number, __sinp: interop.Pointer | interop.Reference<number>, __cosp: interop.Pointer | interop.Reference<number>): void;

declare function __sincospif_stret(p1: number): __float2;

declare function __sinpi(p1: number): number;

declare function __sinpif(p1: number): number;

declare function __srget(p1: interop.Pointer | interop.Reference<FILE>): number;

declare var __stderrp: interop.Pointer | interop.Reference<FILE>;

declare var __stdinp: interop.Pointer | interop.Reference<FILE>;

declare var __stdoutp: interop.Pointer | interop.Reference<FILE>;

declare function __swbuf(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function __tanpi(p1: number): number;

declare function __tanpif(p1: number): number;

declare function __tg_promote(p1: number): number;

declare function __tg_promoteFunction(p1: number): number;

declare function __tg_promoteFunction2(p1: number): number;

declare function __tg_promoteFunction3(p1: number): number;

declare function __tg_promoteFunction4(p1: number): number;

declare function __tg_promoteFunction5(p1: number): number;

declare function __tg_promoteFunction6(p1: number): number;

declare function __tg_promoteFunction7(p1: number): number;

declare function __tg_promoteFunction8(p1: number): number;

declare function __tolower(p1: number): number;

declare function __toupper(p1: number): number;

declare function _exit(p1: number): void;

declare function _host_page_size(host: number, out_page_size: interop.Pointer | interop.Reference<number>): number;

declare function _kernelrpc_mach_port_allocate_trap(target: number, right: number, name: interop.Pointer | interop.Reference<number>): number;

declare function _kernelrpc_mach_port_construct_trap(target: number, options: interop.Pointer | interop.Reference<mach_port_options_t>, context: number, name: interop.Pointer | interop.Reference<number>): number;

declare function _kernelrpc_mach_port_deallocate_trap(target: number, name: number): number;

declare function _kernelrpc_mach_port_destroy_trap(target: number, name: number): number;

declare function _kernelrpc_mach_port_destruct_trap(target: number, name: number, srdelta: number, guard: number): number;

declare function _kernelrpc_mach_port_extract_member_trap(target: number, name: number, pset: number): number;

declare function _kernelrpc_mach_port_guard_trap(target: number, name: number, guard: number, strict: number): number;

declare function _kernelrpc_mach_port_insert_member_trap(target: number, name: number, pset: number): number;

declare function _kernelrpc_mach_port_insert_right_trap(target: number, name: number, poly: number, polyPoly: number): number;

declare function _kernelrpc_mach_port_mod_refs_trap(target: number, name: number, right: number, delta: number): number;

declare function _kernelrpc_mach_port_move_member_trap(target: number, member: number, after: number): number;

declare function _kernelrpc_mach_port_unguard_trap(target: number, name: number, guard: number): number;

declare function _kernelrpc_mach_vm_allocate_trap(target: number, addr: interop.Pointer | interop.Reference<number>, size: number, flags: number): number;

declare function _kernelrpc_mach_vm_deallocate_trap(target: number, address: number, size: number): number;

declare function _kernelrpc_mach_vm_map_trap(target: number, address: interop.Pointer | interop.Reference<number>, size: number, mask: number, flags: number, cur_protection: number): number;

declare function _kernelrpc_mach_vm_protect_trap(target: number, address: number, size: number, set_maximum: number, new_protection: number): number;

declare function _kernelrpc_mach_vm_purgable_control_trap(target: number, address: number, control: number, state: interop.Pointer | interop.Reference<number>): number;

declare function _longjmp(p1: interop.Reference<number>, p2: number): void;

interface _opaque_pthread_attr_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_attr_t: interop.StructType<_opaque_pthread_attr_t>;

interface _opaque_pthread_cond_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_cond_t: interop.StructType<_opaque_pthread_cond_t>;

interface _opaque_pthread_condattr_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_condattr_t: interop.StructType<_opaque_pthread_condattr_t>;

interface _opaque_pthread_mutex_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_mutex_t: interop.StructType<_opaque_pthread_mutex_t>;

interface _opaque_pthread_mutexattr_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_mutexattr_t: interop.StructType<_opaque_pthread_mutexattr_t>;

interface _opaque_pthread_once_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_once_t: interop.StructType<_opaque_pthread_once_t>;

interface _opaque_pthread_rwlock_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_rwlock_t: interop.StructType<_opaque_pthread_rwlock_t>;

interface _opaque_pthread_rwlockattr_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_rwlockattr_t: interop.StructType<_opaque_pthread_rwlockattr_t>;

interface _opaque_pthread_t {
	__sig: number;
	__cleanup_stack: interop.Pointer | interop.Reference<__darwin_pthread_handler_rec>;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_t: interop.StructType<_opaque_pthread_t>;

declare function _setjmp(p1: interop.Reference<number>): number;

declare function a64l(p1: string): number;

declare function abort(): void;

declare function abs(p1: number): number;

declare function accept(p1: number, p2: interop.Pointer | interop.Reference<sockaddr>, p3: interop.Pointer | interop.Reference<number>): number;

declare function access(p1: string, p2: number): number;

interface accessx_descriptor {
	ad_name_offset: number;
	ad_flags: number;
	ad_pad: interop.Reference<number>;
}
declare var accessx_descriptor: interop.StructType<accessx_descriptor>;

declare function accessx_np(p1: interop.Pointer | interop.Reference<accessx_descriptor>, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: number): number;

declare function acct(p1: string): number;

declare function acl_add_flag_np(flagset_d: interop.Pointer | interop.Reference<any>, flag: acl_flag_t): number;

declare function acl_add_perm(permset_d: interop.Pointer | interop.Reference<any>, perm: acl_perm_t): number;

declare function acl_calc_mask(acl_p: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function acl_clear_flags_np(flagset_d: interop.Pointer | interop.Reference<any>): number;

declare function acl_clear_perms(permset_d: interop.Pointer | interop.Reference<any>): number;

declare function acl_copy_entry(dest_d: interop.Pointer | interop.Reference<any>, src_d: interop.Pointer | interop.Reference<any>): number;

declare function acl_copy_ext(buf_p: interop.Pointer | interop.Reference<any>, acl: interop.Pointer | interop.Reference<any>, size: number): number;

declare function acl_copy_ext_native(buf_p: interop.Pointer | interop.Reference<any>, acl: interop.Pointer | interop.Reference<any>, size: number): number;

declare function acl_copy_int(buf_p: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function acl_copy_int_native(buf_p: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function acl_create_entry(acl_p: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, entry_p: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function acl_create_entry_np(acl_p: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, entry_p: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, entry_index: number): number;

declare function acl_delete_def_file(path_p: string): number;

declare function acl_delete_entry(acl: interop.Pointer | interop.Reference<any>, entry_d: interop.Pointer | interop.Reference<any>): number;

declare function acl_delete_flag_np(flagset_d: interop.Pointer | interop.Reference<any>, flag: acl_flag_t): number;

declare function acl_delete_perm(permset_d: interop.Pointer | interop.Reference<any>, perm: acl_perm_t): number;

declare function acl_dup(acl: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare const enum acl_entry_id_t {

	ACL_FIRST_ENTRY = 0,

	ACL_NEXT_ENTRY = -1,

	ACL_LAST_ENTRY = -2
}

declare const enum acl_flag_t {

	ACL_FLAG_DEFER_INHERIT = 1,

	ACL_FLAG_NO_INHERIT = 131072,

	ACL_ENTRY_INHERITED = 16,

	ACL_ENTRY_FILE_INHERIT = 32,

	ACL_ENTRY_DIRECTORY_INHERIT = 64,

	ACL_ENTRY_LIMIT_INHERIT = 128,

	ACL_ENTRY_ONLY_INHERIT = 256
}

declare function acl_free(obj_p: interop.Pointer | interop.Reference<any>): number;

declare function acl_from_text(buf_p: string): interop.Pointer | interop.Reference<any>;

declare function acl_get_entry(acl: interop.Pointer | interop.Reference<any>, entry_id: number, entry_p: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function acl_get_fd(fd: number): interop.Pointer | interop.Reference<any>;

declare function acl_get_fd_np(fd: number, type: acl_type_t): interop.Pointer | interop.Reference<any>;

declare function acl_get_file(path_p: string, type: acl_type_t): interop.Pointer | interop.Reference<any>;

declare function acl_get_flag_np(flagset_d: interop.Pointer | interop.Reference<any>, flag: acl_flag_t): number;

declare function acl_get_flagset_np(obj_p: interop.Pointer | interop.Reference<any>, flagset_p: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function acl_get_link_np(path_p: string, type: acl_type_t): interop.Pointer | interop.Reference<any>;

declare function acl_get_perm_np(permset_d: interop.Pointer | interop.Reference<any>, perm: acl_perm_t): number;

declare function acl_get_permset(entry_d: interop.Pointer | interop.Reference<any>, permset_p: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function acl_get_permset_mask_np(entry_d: interop.Pointer | interop.Reference<any>, mask_p: interop.Pointer | interop.Reference<number>): number;

declare function acl_get_qualifier(entry_d: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function acl_get_tag_type(entry_d: interop.Pointer | interop.Reference<any>, tag_type_p: interop.Pointer | interop.Reference<acl_tag_t>): number;

declare function acl_init(count: number): interop.Pointer | interop.Reference<any>;

declare function acl_maximal_permset_mask_np(mask_p: interop.Pointer | interop.Reference<number>): number;

declare const enum acl_perm_t {

	ACL_READ_DATA = 2,

	ACL_LIST_DIRECTORY = 2,

	ACL_WRITE_DATA = 4,

	ACL_ADD_FILE = 4,

	ACL_EXECUTE = 8,

	ACL_SEARCH = 8,

	ACL_DELETE = 16,

	ACL_APPEND_DATA = 32,

	ACL_ADD_SUBDIRECTORY = 32,

	ACL_DELETE_CHILD = 64,

	ACL_READ_ATTRIBUTES = 128,

	ACL_WRITE_ATTRIBUTES = 256,

	ACL_READ_EXTATTRIBUTES = 512,

	ACL_WRITE_EXTATTRIBUTES = 1024,

	ACL_READ_SECURITY = 2048,

	ACL_WRITE_SECURITY = 4096,

	ACL_CHANGE_OWNER = 8192,

	ACL_SYNCHRONIZE = 1048576
}

declare function acl_set_fd(fd: number, acl: interop.Pointer | interop.Reference<any>): number;

declare function acl_set_fd_np(fd: number, acl: interop.Pointer | interop.Reference<any>, acl_type: acl_type_t): number;

declare function acl_set_file(path_p: string, type: acl_type_t, acl: interop.Pointer | interop.Reference<any>): number;

declare function acl_set_flagset_np(obj_p: interop.Pointer | interop.Reference<any>, flagset_d: interop.Pointer | interop.Reference<any>): number;

declare function acl_set_link_np(path_p: string, type: acl_type_t, acl: interop.Pointer | interop.Reference<any>): number;

declare function acl_set_permset(entry_d: interop.Pointer | interop.Reference<any>, permset_d: interop.Pointer | interop.Reference<any>): number;

declare function acl_set_permset_mask_np(entry_d: interop.Pointer | interop.Reference<any>, mask: number): number;

declare function acl_set_qualifier(entry_d: interop.Pointer | interop.Reference<any>, tag_qualifier_p: interop.Pointer | interop.Reference<any>): number;

declare function acl_set_tag_type(entry_d: interop.Pointer | interop.Reference<any>, tag_type: acl_tag_t): number;

declare function acl_size(acl: interop.Pointer | interop.Reference<any>): number;

declare const enum acl_tag_t {

	ACL_UNDEFINED_TAG = 0,

	ACL_EXTENDED_ALLOW = 1,

	ACL_EXTENDED_DENY = 2
}

declare function acl_to_text(acl: interop.Pointer | interop.Reference<any>, len_p: interop.Pointer | interop.Reference<number>): string;

declare const enum acl_type_t {

	ACL_TYPE_EXTENDED = 256,

	ACL_TYPE_ACCESS = 0,

	ACL_TYPE_DEFAULT = 1,

	ACL_TYPE_AFS = 2,

	ACL_TYPE_CODA = 3,

	ACL_TYPE_NTFS = 4,

	ACL_TYPE_NWFS = 5
}

declare function acl_valid(acl: interop.Pointer | interop.Reference<any>): number;

declare function acl_valid_fd_np(fd: number, type: acl_type_t, acl: interop.Pointer | interop.Reference<any>): number;

declare function acl_valid_file_np(path: string, type: acl_type_t, acl: interop.Pointer | interop.Reference<any>): number;

declare function acl_valid_link_np(path: string, type: acl_type_t, acl: interop.Pointer | interop.Reference<any>): number;

declare function acos(p1: number): number;

declare function acosf(p1: number): number;

declare function acosh(p1: number): number;

declare function acoshf(p1: number): number;

declare function acoshl(p1: number): number;

declare function acosl(p1: number): number;

declare function act_get_state(target_act: number, flavor: number, old_state: interop.Pointer | interop.Reference<number>, old_stateCnt: interop.Pointer | interop.Reference<number>): number;

declare function act_set_state(target_act: number, flavor: number, new_state: interop.Pointer | interop.Reference<number>, new_stateCnt: number): number;

declare function add_profil(p1: string, p2: number, p3: number, p4: number): number;

declare function alarm(p1: number): number;

declare function alloca(p1: number): interop.Pointer | interop.Reference<any>;

declare function arc4random(): number;

declare function arc4random_addrandom(p1: string, p2: number): void;

declare function arc4random_buf(__buf: interop.Pointer | interop.Reference<any>, __nbytes: number): void;

declare function arc4random_stir(): void;

declare function arc4random_uniform(__upper_bound: number): number;

declare function asctime(p1: interop.Pointer | interop.Reference<tm>): string;

declare function asctime_r(p1: interop.Pointer | interop.Reference<tm>, p2: string): string;

declare function asin(p1: number): number;

declare function asinf(p1: number): number;

declare function asinh(p1: number): number;

declare function asinhf(p1: number): number;

declare function asinhl(p1: number): number;

declare function asinl(p1: number): number;

declare function atan(p1: number): number;

declare function atan2(p1: number, p2: number): number;

declare function atan2f(p1: number, p2: number): number;

declare function atan2l(p1: number, p2: number): number;

declare function atanf(p1: number): number;

declare function atanh(p1: number): number;

declare function atanhf(p1: number): number;

declare function atanhl(p1: number): number;

declare function atanl(p1: number): number;

declare function atexit(p1: interop.FunctionReference<() => void>): number;

declare function atexit_b(p1: () => void): number;

declare function atof(p1: string): number;

declare function atoi(p1: string): number;

declare function atol(p1: string): number;

declare function atoll(p1: string): number;

interface audit_token_t {
	val: interop.Reference<number>;
}
declare var audit_token_t: interop.StructType<audit_token_t>;

declare function bcmp(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number): number;

declare function bcopy(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number): void;

declare function bind(p1: number, p2: interop.Pointer | interop.Reference<sockaddr>, p3: number): number;

declare function bindresvport(p1: number, p2: interop.Pointer | interop.Reference<sockaddr_in>): number;

declare function bindresvport_sa(p1: number, p2: interop.Pointer | interop.Reference<sockaddr>): number;

declare var bootstrap_port: number;

declare function brk(p1: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function bsd_signal(p1: number, p2: interop.FunctionReference<(p1: number) => void>): interop.FunctionReference<(p1: number) => void>;

declare function bsearch(__key: interop.Pointer | interop.Reference<any>, __base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): interop.Pointer | interop.Reference<any>;

declare function bsearch_b(__key: interop.Pointer | interop.Reference<any>, __base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number): interop.Pointer | interop.Reference<any>;

declare function bzero(p1: interop.Pointer | interop.Reference<any>, p2: number): void;

declare function calloc(__count: number, __size: number): interop.Pointer | interop.Reference<any>;

declare function cbrt(p1: number): number;

declare function cbrtf(p1: number): number;

declare function cbrtl(p1: number): number;

declare function ceil(p1: number): number;

declare function ceilf(p1: number): number;

declare function ceill(p1: number): number;

declare function cgetcap(p1: string, p2: string, p3: number): string;

declare function cgetclose(): number;

declare function cgetent(p1: interop.Pointer | interop.Reference<string>, p2: interop.Pointer | interop.Reference<string>, p3: string): number;

declare function cgetfirst(p1: interop.Pointer | interop.Reference<string>, p2: interop.Pointer | interop.Reference<string>): number;

declare function cgetmatch(p1: string, p2: string): number;

declare function cgetnext(p1: interop.Pointer | interop.Reference<string>, p2: interop.Pointer | interop.Reference<string>): number;

declare function cgetnum(p1: string, p2: string, p3: interop.Pointer | interop.Reference<number>): number;

declare function cgetset(p1: string): number;

declare function cgetstr(p1: string, p2: string, p3: interop.Pointer | interop.Reference<string>): number;

declare function cgetustr(p1: string, p2: string, p3: interop.Pointer | interop.Reference<string>): number;

declare function chdir(p1: string): number;

declare function chown(p1: string, p2: number, p3: number): number;

declare function chroot(p1: string): number;

declare function clearerr(p1: interop.Pointer | interop.Reference<FILE>): void;

declare function clock(): number;

declare function clock_get_res(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function clock_getres(__clock_id: clockid_t, __res: interop.Pointer | interop.Reference<timespec>): number;

declare function clock_gettime(__clock_id: clockid_t, __tp: interop.Pointer | interop.Reference<timespec>): number;

declare function clock_gettime_nsec_np(__clock_id: clockid_t): number;

declare function clock_set_attributes(clock_ctrl: number, flavor: number, clock_attr: interop.Pointer | interop.Reference<number>, clock_attrCnt: number): number;

declare function clock_set_res(p1: number, p2: number): number;

declare function clock_set_time(clock_ctrl: number, new_time: mach_timespec_t): number;

declare function clock_sleep(p1: number, p2: number, p3: mach_timespec_t, p4: interop.Pointer | interop.Reference<mach_timespec_t>): number;

declare function clock_sleep_trap(clock_name: number, sleep_type: number, sleep_sec: number, sleep_nsec: number, wakeup_time: interop.Pointer | interop.Reference<mach_timespec_t>): number;

declare const enum clockid_t {

	_CLOCK_REALTIME = 0,

	_CLOCK_MONOTONIC = 6,

	_CLOCK_MONOTONIC_RAW = 4,

	_CLOCK_MONOTONIC_RAW_APPROX = 5,

	_CLOCK_UPTIME_RAW = 8,

	_CLOCK_UPTIME_RAW_APPROX = 9,

	_CLOCK_PROCESS_CPUTIME_ID = 12,

	_CLOCK_THREAD_CPUTIME_ID = 16
}

declare function close(p1: number): number;

interface cmsghdr {
	cmsg_len: number;
	cmsg_level: number;
	cmsg_type: number;
}
declare var cmsghdr: interop.StructType<cmsghdr>;

declare function confstr(p1: number, p2: string, p3: number): number;

declare function connect(p1: number, p2: interop.Pointer | interop.Reference<sockaddr>, p3: number): number;

declare function connectx(p1: number, p2: interop.Pointer | interop.Reference<sa_endpoints_t>, p3: number, p4: number, p5: interop.Pointer | interop.Reference<iovec>, p6: number, p7: interop.Pointer | interop.Reference<number>, p8: interop.Pointer | interop.Reference<number>): number;

declare function copysign(p1: number, p2: number): number;

declare function copysignf(p1: number, p2: number): number;

declare function copysignl(p1: number, p2: number): number;

declare function cos(p1: number): number;

declare function cosf(p1: number): number;

declare function cosh(p1: number): number;

declare function coshf(p1: number): number;

declare function coshl(p1: number): number;

declare function cosl(p1: number): number;

declare function creat(p1: string, p2: number): number;

declare function crypt(p1: string, p2: string): string;

declare function ctermid(p1: string): string;

declare function ctermid_r(p1: string): string;

declare function ctime(p1: interop.Pointer | interop.Reference<number>): string;

declare function ctime_r(p1: interop.Pointer | interop.Reference<number>, p2: string): string;

declare function daemon(p1: number, p2: number): number;

declare var daylight: number;

declare function devname(p1: number, p2: number): string;

declare function devname_r(p1: number, p2: number, buf: string, len: number): string;

declare function difftime(p1: number, p2: number): number;

declare function disconnectx(p1: number, p2: number, p3: number): number;

declare function div(p1: number, p2: number): div_t;

interface div_t {
	quot: number;
	rem: number;
}
declare var div_t: interop.StructType<div_t>;

declare function drand48(): number;

declare function dup(p1: number): number;

declare function dup2(p1: number, p2: number): number;

declare function ecvt(p1: number, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>): string;

declare function encrypt(p1: string, p2: number): void;

declare function endusershell(): void;

declare function erand48(p1: interop.Reference<number>): number;

declare function erf(p1: number): number;

declare function erfc(p1: number): number;

declare function erfcf(p1: number): number;

declare function erfcl(p1: number): number;

declare function erff(p1: number): number;

declare function erfl(p1: number): number;

declare function etap_trace_thread(target_act: number, trace_status: number): number;

interface exception {
	type: number;
	name: string;
	arg1: number;
	arg2: number;
	retval: number;
}
declare var exception: interop.StructType<exception>;

declare function exchangedata(p1: string, p2: string, p3: number): number;

declare function execv(__path: string, __argv: interop.Pointer | interop.Reference<string>): number;

declare function execvP(__file: string, __searchpath: string, __argv: interop.Pointer | interop.Reference<string>): number;

declare function execve(__file: string, __argv: interop.Pointer | interop.Reference<string>, __envp: interop.Pointer | interop.Reference<string>): number;

declare function execvp(__file: string, __argv: interop.Pointer | interop.Reference<string>): number;

declare function exit(p1: number): void;

declare function exp(p1: number): number;

declare function exp2(p1: number): number;

declare function exp2f(p1: number): number;

declare function exp2l(p1: number): number;

declare function expf(p1: number): number;

declare function expl(p1: number): number;

declare function expm1(p1: number): number;

declare function expm1f(p1: number): number;

declare function expm1l(p1: number): number;

declare function fabs(p1: number): number;

declare function fabsf(p1: number): number;

declare function fabsl(p1: number): number;

declare function faccessat(p1: number, p2: string, p3: number, p4: number): number;

interface fbootstraptransfer_t {
	fbt_offset: number;
	fbt_length: number;
	fbt_buffer: interop.Pointer | interop.Reference<any>;
}
declare var fbootstraptransfer_t: interop.StructType<fbootstraptransfer_t>;

declare function fchdir(p1: number): number;

interface fchecklv_t {
	lv_file_start: number;
	lv_error_message_size: number;
	lv_error_message: interop.Pointer | interop.Reference<any>;
}
declare var fchecklv_t: interop.StructType<fchecklv_t>;

declare function fchown(p1: number, p2: number, p3: number): number;

declare function fchownat(p1: number, p2: string, p3: number, p4: number, p5: number): number;

declare function fclose(p1: interop.Pointer | interop.Reference<FILE>): number;

interface fcodeblobs_t {
	f_cd_hash: interop.Pointer | interop.Reference<any>;
	f_hash_size: number;
	f_cd_buffer: interop.Pointer | interop.Reference<any>;
	f_cd_size: number;
	f_out_size: interop.Pointer | interop.Reference<number>;
	f_arch: number;
	__padding: number;
}
declare var fcodeblobs_t: interop.StructType<fcodeblobs_t>;

declare function fcvt(p1: number, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>): string;

interface fd_set {
	fds_bits: interop.Reference<number>;
}
declare var fd_set: interop.StructType<fd_set>;

declare function fdim(p1: number, p2: number): number;

declare function fdimf(p1: number, p2: number): number;

declare function fdiml(p1: number, p2: number): number;

declare function fdopen(p1: number, p2: string): interop.Pointer | interop.Reference<FILE>;

declare function feof(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function ferror(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function fflagstostr(p1: number): string;

declare function fflush(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function ffs(p1: number): number;

declare function ffsctl(p1: number, p2: number, p3: interop.Pointer | interop.Reference<any>, p4: number): number;

declare function ffsl(p1: number): number;

declare function ffsll(p1: number): number;

declare function fgetattrlist(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: number): number;

declare function fgetc(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function fgetln(p1: interop.Pointer | interop.Reference<FILE>, p2: interop.Pointer | interop.Reference<number>): string;

declare function fgetpos(p1: interop.Pointer | interop.Reference<FILE>, p2: interop.Pointer | interop.Reference<number>): number;

declare function fgets(p1: string, p2: number, p3: interop.Pointer | interop.Reference<FILE>): string;

declare function fileno(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function filesec_dup(p1: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function filesec_free(p1: interop.Pointer | interop.Reference<any>): void;

declare function filesec_get_property(p1: interop.Pointer | interop.Reference<any>, p2: filesec_property_t, p3: interop.Pointer | interop.Reference<any>): number;

declare function filesec_init(): interop.Pointer | interop.Reference<any>;

declare const enum filesec_property_t {

	FILESEC_OWNER = 1,

	FILESEC_GROUP = 2,

	FILESEC_UUID = 3,

	FILESEC_MODE = 4,

	FILESEC_ACL = 5,

	FILESEC_GRPUUID = 6,

	FILESEC_ACL_RAW = 100,

	FILESEC_ACL_ALLOCSIZE = 101
}

declare function filesec_query_property(p1: interop.Pointer | interop.Reference<any>, p2: filesec_property_t, p3: interop.Pointer | interop.Reference<number>): number;

declare function filesec_set_property(p1: interop.Pointer | interop.Reference<any>, p2: filesec_property_t, p3: interop.Pointer | interop.Reference<any>): number;

declare function filesec_unset_property(p1: interop.Pointer | interop.Reference<any>, p2: filesec_property_t): number;

declare function flock(p1: number, p2: number): number;

interface flockStruct {
	l_start: number;
	l_len: number;
	l_pid: number;
	l_type: number;
	l_whence: number;
}
declare var flockStruct: interop.StructType<flockStruct>;

declare function flockfile(p1: interop.Pointer | interop.Reference<FILE>): void;

interface flocktimeout {
	fl: flockStruct;
	timeout: timespec;
}
declare var flocktimeout: interop.StructType<flocktimeout>;

declare function floor(p1: number): number;

declare function floorf(p1: number): number;

declare function floorl(p1: number): number;

declare function fls(p1: number): number;

declare function flsl(p1: number): number;

declare function flsll(p1: number): number;

declare function fma(p1: number, p2: number, p3: number): number;

declare function fmaf(p1: number, p2: number, p3: number): number;

declare function fmal(p1: number, p2: number, p3: number): number;

declare function fmax(p1: number, p2: number): number;

declare function fmaxf(p1: number, p2: number): number;

declare function fmaxl(p1: number, p2: number): number;

declare function fmin(p1: number, p2: number): number;

declare function fminf(p1: number, p2: number): number;

declare function fminl(p1: number, p2: number): number;

declare function fmod(p1: number, p2: number): number;

declare function fmodf(p1: number, p2: number): number;

declare function fmodl(p1: number, p2: number): number;

declare function fmtcheck(p1: string, p2: string): string;

declare function fopen(__filename: string, __mode: string): interop.Pointer | interop.Reference<FILE>;

declare function fork(): number;

declare function fpathconf(p1: number, p2: number): number;

declare function fpurge(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function fputc(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function fputs(p1: string, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function fread(__ptr: interop.Pointer | interop.Reference<any>, __size: number, __nitems: number, __stream: interop.Pointer | interop.Reference<FILE>): number;

declare function free(p1: interop.Pointer | interop.Reference<any>): void;

declare function freopen(p1: string, p2: string, p3: interop.Pointer | interop.Reference<FILE>): interop.Pointer | interop.Reference<FILE>;

declare function frexp(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function frexpf(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function frexpl(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function fsctl(p1: string, p2: number, p3: interop.Pointer | interop.Reference<any>, p4: number): number;

declare function fseek(p1: interop.Pointer | interop.Reference<FILE>, p2: number, p3: number): number;

declare function fseeko(__stream: interop.Pointer | interop.Reference<FILE>, __offset: number, __whence: number): number;

declare function fsetattrlist(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: number): number;

declare function fsetpos(p1: interop.Pointer | interop.Reference<FILE>, p2: interop.Pointer | interop.Reference<number>): number;

interface fsid_t {
	val: interop.Reference<number>;
}
declare var fsid_t: interop.StructType<fsid_t>;

interface fsignatures_t {
	fs_file_start: number;
	fs_blob_start: interop.Pointer | interop.Reference<any>;
	fs_blob_size: number;
}
declare var fsignatures_t: interop.StructType<fsignatures_t>;

interface fsobj_id_t {
	fid_objno: number;
	fid_generation: number;
}
declare var fsobj_id_t: interop.StructType<fsobj_id_t>;

interface fstore_t {
	fst_flags: number;
	fst_posmode: number;
	fst_offset: number;
	fst_length: number;
	fst_bytesalloc: number;
}
declare var fstore_t: interop.StructType<fstore_t>;

declare function fsync(p1: number): number;

declare function fsync_volume_np(p1: number, p2: number): number;

declare function ftell(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function ftello(__stream: interop.Pointer | interop.Reference<FILE>): number;

declare function ftruncate(p1: number, p2: number): number;

declare function ftrylockfile(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function funlockfile(p1: interop.Pointer | interop.Reference<FILE>): void;

declare function funopen(p1: interop.Pointer | interop.Reference<any>, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number) => number>, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>): interop.Pointer | interop.Reference<FILE>;

declare function fwrite(__ptr: interop.Pointer | interop.Reference<any>, __size: number, __nitems: number, __stream: interop.Pointer | interop.Reference<FILE>): number;

declare function gcvt(p1: number, p2: number, p3: string): string;

declare function get_dp_control_port(host: number, contorl_port: interop.Pointer | interop.Reference<number>): number;

declare function getattrlist(p1: string, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: number): number;

declare function getattrlistat(p1: number, p2: string, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<any>, p5: number, p6: number): number;

declare function getattrlistbulk(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: number): number;

declare function getbsize(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): string;

declare function getc(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function getc_unlocked(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function getchar(): number;

declare function getchar_unlocked(): number;

declare function getcwd(p1: string, p2: number): string;

declare function getdate(p1: string): interop.Pointer | interop.Reference<tm>;

declare var getdate_err: number;

declare function getdelim(__linep: interop.Pointer | interop.Reference<string>, __linecapp: interop.Pointer | interop.Reference<number>, __delimiter: number, __stream: interop.Pointer | interop.Reference<FILE>): number;

declare function getdirentriesattr(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: interop.Pointer | interop.Reference<number>, p6: interop.Pointer | interop.Reference<number>, p7: interop.Pointer | interop.Reference<number>, p8: number): number;

declare function getdomainname(p1: string, p2: number): number;

declare function getdtablesize(): number;

declare function getegid(): number;

declare function getenv(p1: string): string;

declare function geteuid(): number;

declare function getgid(): number;

declare function getgrouplist(p1: string, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>): number;

declare function getgroups(p1: number, p2: interop.Reference<number>): number;

declare function gethostid(): number;

declare function gethostname(p1: string, p2: number): number;

declare function getiopolicy_np(p1: number, p2: number): number;

declare function getipv4sourcefilter(p1: number, p2: in_addr, p3: in_addr, p4: interop.Pointer | interop.Reference<number>, p5: interop.Pointer | interop.Reference<number>, p6: interop.Pointer | interop.Reference<in_addr>): number;

declare function getline(__linep: interop.Pointer | interop.Reference<string>, __linecapp: interop.Pointer | interop.Reference<number>, __stream: interop.Pointer | interop.Reference<FILE>): number;

declare function getloadavg(p1: interop.Reference<number>, p2: number): number;

declare function getlogin(): string;

declare function getlogin_r(p1: string, p2: number): number;

declare function getmode(p1: interop.Pointer | interop.Reference<any>, p2: number): number;

declare function getopt(p1: number, p2: interop.Reference<string>, p3: string): number;

declare function getpagesize(): number;

declare function getpass(p1: string): string;

declare function getpeereid(p1: number, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>): number;

declare function getpeername(p1: number, p2: interop.Pointer | interop.Reference<sockaddr>, p3: interop.Pointer | interop.Reference<number>): number;

declare function getpgid(p1: number): number;

declare function getpgrp(): number;

declare function getpid(): number;

declare function getppid(): number;

declare function getpriority(p1: number, p2: number): number;

declare function getprogname(): string;

declare function getrlimit(p1: number, p2: interop.Pointer | interop.Reference<rlimit>): number;

declare function getrusage(p1: number, p2: interop.Pointer | interop.Reference<rusage>): number;

declare function gets(p1: string): string;

declare function getsgroups_np(p1: interop.Pointer | interop.Reference<number>, p2: interop.Reference<number>): number;

declare function getsid(p1: number): number;

declare function getsockname(p1: number, p2: interop.Pointer | interop.Reference<sockaddr>, p3: interop.Pointer | interop.Reference<number>): number;

declare function getsockopt(p1: number, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>, p5: interop.Pointer | interop.Reference<number>): number;

declare function getsourcefilter(p1: number, p2: number, p3: interop.Pointer | interop.Reference<sockaddr>, p4: number, p5: interop.Pointer | interop.Reference<number>, p6: interop.Pointer | interop.Reference<number>, p7: interop.Pointer | interop.Reference<sockaddr_storage>): number;

declare function getsubopt(p1: interop.Pointer | interop.Reference<string>, p2: interop.Pointer | interop.Reference<string>, p3: interop.Pointer | interop.Reference<string>): number;

declare function getsuboptFunction(p1: interop.Pointer | interop.Reference<string>, p2: interop.Pointer | interop.Reference<string>, p3: interop.Pointer | interop.Reference<string>): number;

declare function getuid(): number;

declare function getusershell(): string;

declare function getw(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function getwd(p1: string): string;

declare function getwgroups_np(p1: interop.Pointer | interop.Reference<number>, p2: interop.Reference<number>): number;

declare function gmtime(p1: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<tm>;

declare function gmtime_r(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<tm>): interop.Pointer | interop.Reference<tm>;

interface gpu_energy_data {
	task_gpu_utilisation: number;
	task_gpu_stat_reserved0: number;
	task_gpu_stat_reserved1: number;
	task_gpu_stat_reserved2: number;
}
declare var gpu_energy_data: interop.StructType<gpu_energy_data>;

declare function grantpt(p1: number): number;

interface group_req {
	gr_interface: number;
	gr_group: sockaddr_storage;
}
declare var group_req: interop.StructType<group_req>;

interface group_source_req {
	gsr_interface: number;
	gsr_group: sockaddr_storage;
	gsr_source: sockaddr_storage;
}
declare var group_source_req: interop.StructType<group_source_req>;

interface guid_t {
	g_guid: interop.Reference<number>;
}
declare var guid_t: interop.StructType<guid_t>;

interface hash_info_bucket_t {
	hib_count: number;
}
declare var hash_info_bucket_t: interop.StructType<hash_info_bucket_t>;

declare function heapsort(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): number;

declare function heapsort_b(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number): number;

interface host_basic_info_data_t {
	max_cpus: number;
	avail_cpus: number;
	memory_size: number;
	cpu_type: number;
	cpu_subtype: number;
	cpu_threadtype: number;
	physical_cpu: number;
	physical_cpu_max: number;
	logical_cpu: number;
	logical_cpu_max: number;
	max_mem: number;
}
declare var host_basic_info_data_t: interop.StructType<host_basic_info_data_t>;

interface host_can_has_debugger_info_data_t {
	can_has_debugger: number;
}
declare var host_can_has_debugger_info_data_t: interop.StructType<host_can_has_debugger_info_data_t>;

declare function host_check_multiuser_mode(host: number, multiuser_mode: interop.Pointer | interop.Reference<number>): number;

interface host_cpu_load_info_data_t {
	cpu_ticks: interop.Reference<number>;
}
declare var host_cpu_load_info_data_t: interop.StructType<host_cpu_load_info_data_t>;

declare function host_create_mach_voucher(host: number, recipes: string, recipesCnt: number, voucher: interop.Pointer | interop.Reference<number>): number;

declare function host_create_mach_voucher_trap(host: number, recipes: string, recipes_size: number, voucher: interop.Pointer | interop.Reference<number>): number;

declare function host_default_memory_manager(host_priv: number, default_manager: interop.Pointer | interop.Reference<number>, cluster_size: number): number;

declare function host_get_UNDServer(host: number, server: interop.Pointer | interop.Reference<number>): number;

declare function host_get_atm_diagnostic_flag(host: number, diagnostic_flag: interop.Pointer | interop.Reference<number>): number;

declare function host_get_boot_info(host_priv: number, boot_info: interop.Reference<number>): number;

declare function host_get_clock_control(host_priv: number, clock_id: number, clock_ctrl: interop.Pointer | interop.Reference<number>): number;

declare function host_get_clock_service(host: number, clock_id: number, clock_serv: interop.Pointer | interop.Reference<number>): number;

declare function host_get_exception_ports(host_priv: number, exception_mask: number, masks: interop.Pointer | interop.Reference<number>, masksCnt: interop.Pointer | interop.Reference<number>, old_handlers: interop.Pointer | interop.Reference<number>, old_behaviors: interop.Pointer | interop.Reference<number>, old_flavors: interop.Pointer | interop.Reference<number>): number;

declare function host_get_io_master(host: number, io_master: interop.Pointer | interop.Reference<number>): number;

declare function host_get_multiuser_config_flags(host: number, multiuser_flags: interop.Pointer | interop.Reference<number>): number;

declare function host_get_special_port(host_priv: number, node: number, which: number, port: interop.Pointer | interop.Reference<number>): number;

declare function host_info(host: number, flavor: number, host_info_out: interop.Pointer | interop.Reference<number>, host_info_outCnt: interop.Pointer | interop.Reference<number>): number;

declare function host_kernel_version(host: number, kernel_version: interop.Reference<number>): number;

interface host_load_info_data_t {
	avenrun: interop.Reference<number>;
	mach_factor: interop.Reference<number>;
}
declare var host_load_info_data_t: interop.StructType<host_load_info_data_t>;

declare function host_lockgroup_info(host: number, lockgroup_info: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<lockgroup_info_t>>, lockgroup_infoCnt: interop.Pointer | interop.Reference<number>): number;

declare function host_page_size(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

interface host_priority_info_data_t {
	kernel_priority: number;
	system_priority: number;
	server_priority: number;
	user_priority: number;
	depress_priority: number;
	idle_priority: number;
	minimum_priority: number;
	maximum_priority: number;
}
declare var host_priority_info_data_t: interop.StructType<host_priority_info_data_t>;

declare function host_priv_statistics(host_priv: number, flavor: number, host_info_out: interop.Pointer | interop.Reference<number>, host_info_outCnt: interop.Pointer | interop.Reference<number>): number;

declare function host_processor_info(host: number, flavor: number, out_processor_count: interop.Pointer | interop.Reference<number>, out_processor_info: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, out_processor_infoCnt: interop.Pointer | interop.Reference<number>): number;

declare function host_processor_set_priv(host_priv: number, set_name: number, set: interop.Pointer | interop.Reference<number>): number;

declare function host_processor_sets(host_priv: number, processor_sets: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, processor_setsCnt: interop.Pointer | interop.Reference<number>): number;

declare function host_processors(host_priv: number, out_processor_list: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, out_processor_listCnt: interop.Pointer | interop.Reference<number>): number;

declare function host_reboot(host_priv: number, options: number): number;

declare function host_register_mach_voucher_attr_manager(host: number, attr_manager: number, default_value: number, new_key: interop.Pointer | interop.Reference<number>, new_attr_control: interop.Pointer | interop.Reference<number>): number;

declare function host_register_well_known_mach_voucher_attr_manager(host: number, attr_manager: number, default_value: number, key: number, new_attr_control: interop.Pointer | interop.Reference<number>): number;

declare function host_request_notification(host: number, notify_type: number, notify_port: number): number;

interface host_sched_info_data_t {
	min_timeout: number;
	min_quantum: number;
}
declare var host_sched_info_data_t: interop.StructType<host_sched_info_data_t>;

declare function host_security_create_task_token(host_security: number, parent_task: number, sec_token: security_token_t, audit_token: audit_token_t, host: number, ledgers: interop.Pointer | interop.Reference<number>, ledgersCnt: number, inherit_memory: number, child_task: interop.Pointer | interop.Reference<number>): number;

declare function host_security_set_task_token(host_security: number, target_task: number, sec_token: security_token_t, audit_token: audit_token_t, host: number): number;

declare function host_set_UNDServer(host: number, server: number): number;

declare function host_set_atm_diagnostic_flag(host_priv: number, diagnostic_flag: number): number;

declare function host_set_exception_ports(host_priv: number, exception_mask: number, new_port: number, behavior: number, new_flavor: number): number;

declare function host_set_multiuser_config_flags(host_priv: number, multiuser_flags: number): number;

declare function host_set_special_port(host_priv: number, which: number, port: number): number;

declare function host_statistics(host_priv: number, flavor: number, host_info_out: interop.Pointer | interop.Reference<number>, host_info_outCnt: interop.Pointer | interop.Reference<number>): number;

declare function host_statistics64(host_priv: number, flavor: number, host_info64_out: interop.Pointer | interop.Reference<number>, host_info64_outCnt: interop.Pointer | interop.Reference<number>): number;

declare function host_swap_exception_ports(host_priv: number, exception_mask: number, new_port: number, behavior: number, new_flavor: number, masks: interop.Pointer | interop.Reference<number>, masksCnt: interop.Pointer | interop.Reference<number>, old_handlerss: interop.Pointer | interop.Reference<number>, old_behaviors: interop.Pointer | interop.Reference<number>, old_flavors: interop.Pointer | interop.Reference<number>): number;

declare function host_virtual_physical_table_info(host: number, info: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<hash_info_bucket_t>>, infoCnt: interop.Pointer | interop.Reference<number>): number;

declare function host_zone_info(host: number, names: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<zone_name_t>>, namesCnt: interop.Pointer | interop.Reference<number>, info: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<zone_info_t>>, infoCnt: interop.Pointer | interop.Reference<number>): number;

declare function hypot(p1: number, p2: number): number;

declare function hypotf(p1: number, p2: number): number;

declare function hypotl(p1: number, p2: number): number;

declare const enum idtype_t {

	P_ALL = 0,

	P_PID = 1,

	P_PGID = 2
}

declare function ilogb(p1: number): number;

declare function ilogbf(p1: number): number;

declare function ilogbl(p1: number): number;

declare function imaxabs(j: number): number;

declare function imaxdiv(__numer: number, __denom: number): imaxdiv_t;

interface imaxdiv_t {
	quot: number;
	rem: number;
}
declare var imaxdiv_t: interop.StructType<imaxdiv_t>;

interface in_addr {
	s_addr: number;
}
declare var in_addr: interop.StructType<in_addr>;

interface in_pktinfo {
	ipi_ifindex: number;
	ipi_spec_dst: in_addr;
	ipi_addr: in_addr;
}
declare var in_pktinfo: interop.StructType<in_pktinfo>;

declare function index(p1: string, p2: number): string;

declare function initgroups(p1: string, p2: number): number;

declare function initstate(p1: number, p2: string, p3: number): string;

interface io_stat_entry {
	count: number;
	size: number;
}
declare var io_stat_entry: interop.StructType<io_stat_entry>;

interface io_stat_info {
	disk_reads: io_stat_entry;
	io_priority: interop.Reference<io_stat_entry>;
	paging: io_stat_entry;
	metadata: io_stat_entry;
	total_io: io_stat_entry;
}
declare var io_stat_info: interop.StructType<io_stat_info>;

interface iovec {
	iov_base: interop.Pointer | interop.Reference<any>;
	iov_len: number;
}
declare var iovec: interop.StructType<iovec>;

interface ip_mreq {
	imr_multiaddr: in_addr;
	imr_interface: in_addr;
}
declare var ip_mreq: interop.StructType<ip_mreq>;

interface ip_mreq_source {
	imr_multiaddr: in_addr;
	imr_sourceaddr: in_addr;
	imr_interface: in_addr;
}
declare var ip_mreq_source: interop.StructType<ip_mreq_source>;

interface ip_mreqn {
	imr_multiaddr: in_addr;
	imr_address: in_addr;
	imr_ifindex: number;
}
declare var ip_mreqn: interop.StructType<ip_mreqn>;

interface ip_opts {
	ip_dst: in_addr;
	ip_opts: interop.Reference<number>;
}
declare var ip_opts: interop.StructType<ip_opts>;

interface ipc_info_name_t {
	iin_name: number;
	iin_collision: number;
	iin_type: number;
	iin_urefs: number;
	iin_object: number;
	iin_next: number;
	iin_hash: number;
}
declare var ipc_info_name_t: interop.StructType<ipc_info_name_t>;

interface ipc_info_space_basic_t {
	iisb_genno_mask: number;
	iisb_table_size: number;
	iisb_table_next: number;
	iisb_table_inuse: number;
	iisb_reserved: interop.Reference<number>;
}
declare var ipc_info_space_basic_t: interop.StructType<ipc_info_space_basic_t>;

interface ipc_info_space_t {
	iis_genno_mask: number;
	iis_table_size: number;
	iis_table_next: number;
	iis_tree_size: number;
	iis_tree_small: number;
	iis_tree_hash: number;
}
declare var ipc_info_space_t: interop.StructType<ipc_info_space_t>;

interface ipc_info_tree_name_t {
	iitn_name: ipc_info_name_t;
	iitn_lchild: number;
	iitn_rchild: number;
}
declare var ipc_info_tree_name_t: interop.StructType<ipc_info_tree_name_t>;

declare function iruserok(p1: number, p2: number, p3: string, p4: string): number;

declare function iruserok_sa(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: string, p5: string): number;

declare function isatty(p1: number): number;

declare function issetugid(): number;

declare function j0(p1: number): number;

declare function j1(p1: number): number;

declare function jn(p1: number, p2: number): number;

declare function jrand48(p1: interop.Reference<number>): number;

interface kauth_ace {
	ace_applicable: guid_t;
	ace_flags: number;
	ace_rights: number;
}
declare var kauth_ace: interop.StructType<kauth_ace>;

interface kauth_acl {
	acl_entrycount: number;
	acl_flags: number;
	acl_ace: interop.Reference<kauth_ace>;
}
declare var kauth_acl: interop.StructType<kauth_acl>;

interface kauth_cache_sizes {
	kcs_group_size: number;
	kcs_id_size: number;
}
declare var kauth_cache_sizes: interop.StructType<kauth_cache_sizes>;

interface kauth_filesec {
	fsec_magic: number;
	fsec_owner: guid_t;
	fsec_group: guid_t;
	fsec_acl: kauth_acl;
}
declare var kauth_filesec: interop.StructType<kauth_filesec>;

interface kauth_identity_extlookup {
	el_seqno: number;
	el_result: number;
	el_flags: number;
	el_info_pid: number;
	el_extend: number;
	el_info_reserved_1: number;
	el_uid: number;
	el_uguid: guid_t;
	el_uguid_valid: number;
	el_usid: ntsid_t;
	el_usid_valid: number;
	el_gid: number;
	el_gguid: guid_t;
	el_gguid_valid: number;
	el_gsid: ntsid_t;
	el_gsid_valid: number;
	el_member_valid: number;
	el_sup_grp_cnt: number;
	el_sup_groups: interop.Reference<number>;
}
declare var kauth_identity_extlookup: interop.StructType<kauth_identity_extlookup>;

interface kernel_resource_sizes_data_t {
	task: number;
	thread: number;
	port: number;
	memory_region: number;
	memory_object: number;
}
declare var kernel_resource_sizes_data_t: interop.StructType<kernel_resource_sizes_data_t>;

declare function kext_request(host_priv: number, user_log_flags: number, request_data: number, request_dataCnt: number, response_data: interop.Pointer | interop.Reference<number>, response_dataCnt: interop.Pointer | interop.Reference<number>, log_data: interop.Pointer | interop.Reference<number>, log_dataCnt: interop.Pointer | interop.Reference<number>, op_result: interop.Pointer | interop.Reference<number>): number;

declare function kill(p1: number, p2: number): number;

declare function killpg(p1: number, p2: number): number;

declare function kmod_control(host_priv: number, module: number, flavor: number, data: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, dataCnt: interop.Pointer | interop.Reference<number>): number;

declare function kmod_create(host_priv: number, info: number, module: interop.Pointer | interop.Reference<number>): number;

declare function kmod_destroy(host_priv: number, module: number): number;

declare function kmod_get_info(host: number, modules: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, modulesCnt: interop.Pointer | interop.Reference<number>): number;

interface kmod_info_32_v1_t {
	next_addr: number;
	info_version: number;
	id: number;
	name: interop.Reference<number>;
	version: interop.Reference<number>;
	reference_count: number;
	reference_list_addr: number;
	address: number;
	size: number;
	hdr_size: number;
	start_addr: number;
	stop_addr: number;
}
declare var kmod_info_32_v1_t: interop.StructType<kmod_info_32_v1_t>;

interface kmod_info_64_v1_t {
	next_addr: number;
	info_version: number;
	id: number;
	name: interop.Reference<number>;
	version: interop.Reference<number>;
	reference_count: number;
	reference_list_addr: number;
	address: number;
	size: number;
	hdr_size: number;
	start_addr: number;
	stop_addr: number;
}
declare var kmod_info_64_v1_t: interop.StructType<kmod_info_64_v1_t>;

interface kmod_info_t {
	next: interop.Pointer | interop.Reference<kmod_info_t>;
	info_version: number;
	id: number;
	name: interop.Reference<number>;
	version: interop.Reference<number>;
	reference_count: number;
	reference_list: interop.Pointer | interop.Reference<kmod_reference_t>;
	address: number;
	size: number;
	hdr_size: number;
	start: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<kmod_info_t>, p2: interop.Pointer | interop.Reference<any>) => number>>;
	stop: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<kmod_info_t>, p2: interop.Pointer | interop.Reference<any>) => number>>;
}
declare var kmod_info_t: interop.StructType<kmod_info_t>;

interface kmod_reference_t {
	next: interop.Pointer | interop.Reference<kmod_reference_t>;
	info: interop.Pointer | interop.Reference<kmod_info_t>;
}
declare var kmod_reference_t: interop.StructType<kmod_reference_t>;

declare function l64a(p1: number): string;

declare function labs(p1: number): number;

declare function lchown(p1: string, p2: number, p3: number): number;

declare function lcong48(p1: interop.Reference<number>): void;

interface lconv {
	decimal_point: string;
	thousands_sep: string;
	grouping: string;
	int_curr_symbol: string;
	currency_symbol: string;
	mon_decimal_point: string;
	mon_thousands_sep: string;
	mon_grouping: string;
	positive_sign: string;
	negative_sign: string;
	int_frac_digits: number;
	frac_digits: number;
	p_cs_precedes: number;
	p_sep_by_space: number;
	n_cs_precedes: number;
	n_sep_by_space: number;
	p_sign_posn: number;
	n_sign_posn: number;
	int_p_cs_precedes: number;
	int_n_cs_precedes: number;
	int_p_sep_by_space: number;
	int_n_sep_by_space: number;
	int_p_sign_posn: number;
	int_n_sign_posn: number;
}
declare var lconv: interop.StructType<lconv>;

declare function ldexp(p1: number, p2: number): number;

declare function ldexpf(p1: number, p2: number): number;

declare function ldexpl(p1: number, p2: number): number;

declare function ldiv(p1: number, p2: number): ldiv_t;

interface ldiv_t {
	quot: number;
	rem: number;
}
declare var ldiv_t: interop.StructType<ldiv_t>;

declare function lgamma(p1: number): number;

declare function lgammaf(p1: number): number;

declare function lgammal(p1: number): number;

interface linger {
	l_onoff: number;
	l_linger: number;
}
declare var linger: interop.StructType<linger>;

declare function link(p1: string, p2: string): number;

declare function linkat(p1: number, p2: string, p3: number, p4: string, p5: number): number;

declare function listen(p1: number, p2: number): number;

declare function llabs(p1: number): number;

declare function lldiv(p1: number, p2: number): lldiv_t;

interface lldiv_t {
	quot: number;
	rem: number;
}
declare var lldiv_t: interop.StructType<lldiv_t>;

declare function llrint(p1: number): number;

declare function llrintf(p1: number): number;

declare function llrintl(p1: number): number;

declare function llround(p1: number): number;

declare function llroundf(p1: number): number;

declare function llroundl(p1: number): number;

declare function localeconv(): interop.Pointer | interop.Reference<lconv>;

declare function localtime(p1: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<tm>;

declare function localtime_r(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<tm>): interop.Pointer | interop.Reference<tm>;

declare function lock_acquire(lock_set: number, lock_id: number): number;

declare function lock_handoff(lock_set: number, lock_id: number): number;

declare function lock_handoff_accept(lock_set: number, lock_id: number): number;

declare function lock_make_stable(lock_set: number, lock_id: number): number;

declare function lock_release(lock_set: number, lock_id: number): number;

declare function lock_set_create(task: number, new_lock_set: interop.Pointer | interop.Reference<number>, n_ulocks: number, policy: number): number;

declare function lock_set_destroy(task: number, lock_set: number): number;

declare function lock_try(lock_set: number, lock_id: number): number;

declare function lockf(p1: number, p2: number, p3: number): number;

interface lockgroup_info_t {
	lockgroup_name: interop.Reference<number>;
	lockgroup_attr: number;
	lock_spin_cnt: number;
	lock_spin_util_cnt: number;
	lock_spin_held_cnt: number;
	lock_spin_miss_cnt: number;
	lock_spin_held_max: number;
	lock_spin_held_cum: number;
	lock_mtx_cnt: number;
	lock_mtx_util_cnt: number;
	lock_mtx_held_cnt: number;
	lock_mtx_miss_cnt: number;
	lock_mtx_wait_cnt: number;
	lock_mtx_held_max: number;
	lock_mtx_held_cum: number;
	lock_mtx_wait_max: number;
	lock_mtx_wait_cum: number;
	lock_rw_cnt: number;
	lock_rw_util_cnt: number;
	lock_rw_held_cnt: number;
	lock_rw_miss_cnt: number;
	lock_rw_wait_cnt: number;
	lock_rw_held_max: number;
	lock_rw_held_cum: number;
	lock_rw_wait_max: number;
	lock_rw_wait_cum: number;
}
declare var lockgroup_info_t: interop.StructType<lockgroup_info_t>;

declare function log(p1: number): number;

declare function log10(p1: number): number;

declare function log10f(p1: number): number;

declare function log10l(p1: number): number;

declare function log1p(p1: number): number;

declare function log1pf(p1: number): number;

declare function log1pl(p1: number): number;

declare function log2(p1: number): number;

declare function log2f(p1: number): number;

declare function log2l(p1: number): number;

interface log2phys {
	l2p_flags: number;
	l2p_contigbytes: number;
	l2p_devoffset: number;
}
declare var log2phys: interop.StructType<log2phys>;

declare function logb(p1: number): number;

declare function logbf(p1: number): number;

declare function logbl(p1: number): number;

declare function logf(p1: number): number;

declare function logl(p1: number): number;

declare function longjmp(p1: interop.Reference<number>, p2: number): void;

declare function longjmperror(): void;

declare function lrand48(): number;

declare function lrint(p1: number): number;

declare function lrintf(p1: number): number;

declare function lrintl(p1: number): number;

declare function lround(p1: number): number;

declare function lroundf(p1: number): number;

declare function lroundl(p1: number): number;

declare function lseek(p1: number, p2: number, p3: number): number;

interface mach_core_fileheader {
	signature: number;
	log_offset: number;
	log_length: number;
	gzip_offset: number;
	gzip_length: number;
}
declare var mach_core_fileheader: interop.StructType<mach_core_fileheader>;

interface mach_dead_name_notification_t {
	not_header: mach_msg_header_t;
	NDR: NDR_record_t;
	not_port: number;
	trailer: mach_msg_security_trailer_t;
}
declare var mach_dead_name_notification_t: interop.StructType<mach_dead_name_notification_t>;

declare function mach_error(str: string, error_value: number): void;

declare function mach_error_string(error_value: number): string;

declare function mach_error_type(error_value: number): string;

declare function mach_generate_activity_id(target: number, count: number, activity_id: interop.Pointer | interop.Reference<number>): number;

declare function mach_host_self(): number;

declare function mach_make_memory_entry(target_task: number, size: interop.Pointer | interop.Reference<number>, offset: number, permission: number, object_handle: interop.Pointer | interop.Reference<number>, parent_entry: number): number;

declare function mach_make_memory_entry_64(target_task: number, size: interop.Pointer | interop.Reference<number>, offset: number, permission: number, object_handle: interop.Pointer | interop.Reference<number>, parent_entry: number): number;

declare function mach_memory_info(host: number, names: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<mach_zone_name_t>>, namesCnt: interop.Pointer | interop.Reference<number>, info: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<mach_zone_info_t>>, infoCnt: interop.Pointer | interop.Reference<number>, memory_info: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<mach_memory_info_t>>, memory_infoCnt: interop.Pointer | interop.Reference<number>): number;

interface mach_memory_info_t {
	flags: number;
	site: number;
	size: number;
	free: number;
	largest: number;
	collectable_bytes: number;
	_resv: interop.Reference<number>;
}
declare var mach_memory_info_t: interop.StructType<mach_memory_info_t>;

declare function mach_memory_object_memory_entry(host: number, internal: number, size: number, permission: number, pager: number, entry_handle: interop.Pointer | interop.Reference<number>): number;

declare function mach_memory_object_memory_entry_64(host: number, internal: number, size: number, permission: number, pager: number, entry_handle: interop.Pointer | interop.Reference<number>): number;

declare function mach_msg(msg: interop.Pointer | interop.Reference<mach_msg_header_t>, option: number, send_size: number, rcv_size: number, rcv_name: number, timeout: number, notify: number): number;

interface mach_msg_audit_trailer_t {
	msgh_trailer_type: number;
	msgh_trailer_size: number;
	msgh_seqno: number;
	msgh_sender: security_token_t;
	msgh_audit: audit_token_t;
}
declare var mach_msg_audit_trailer_t: interop.StructType<mach_msg_audit_trailer_t>;

interface mach_msg_base_t {
	header: mach_msg_header_t;
	body: mach_msg_body_t;
}
declare var mach_msg_base_t: interop.StructType<mach_msg_base_t>;

interface mach_msg_body_t {
	msgh_descriptor_count: number;
}
declare var mach_msg_body_t: interop.StructType<mach_msg_body_t>;

interface mach_msg_context_trailer_t {
	msgh_trailer_type: number;
	msgh_trailer_size: number;
	msgh_seqno: number;
	msgh_sender: security_token_t;
	msgh_audit: audit_token_t;
	msgh_context: number;
}
declare var mach_msg_context_trailer_t: interop.StructType<mach_msg_context_trailer_t>;

declare function mach_msg_destroy(p1: interop.Pointer | interop.Reference<mach_msg_header_t>): void;

interface mach_msg_empty_rcv_t {
	header: mach_msg_header_t;
	trailer: mach_msg_trailer_t;
}
declare var mach_msg_empty_rcv_t: interop.StructType<mach_msg_empty_rcv_t>;

interface mach_msg_empty_send_t {
	header: mach_msg_header_t;
}
declare var mach_msg_empty_send_t: interop.StructType<mach_msg_empty_send_t>;

interface mach_msg_header_t {
	msgh_bits: number;
	msgh_size: number;
	msgh_remote_port: number;
	msgh_local_port: number;
	msgh_voucher_port: number;
	msgh_id: number;
}
declare var mach_msg_header_t: interop.StructType<mach_msg_header_t>;

interface mach_msg_mac_trailer_t {
	msgh_trailer_type: number;
	msgh_trailer_size: number;
	msgh_seqno: number;
	msgh_sender: security_token_t;
	msgh_audit: audit_token_t;
	msgh_context: number;
	msgh_ad: number;
	msgh_labels: msg_labels_t;
}
declare var mach_msg_mac_trailer_t: interop.StructType<mach_msg_mac_trailer_t>;

interface mach_msg_ool_descriptor32_t {
	address: number;
	size: number;
	deallocate: number;
	copy: number;
	pad1: number;
	type: number;
}
declare var mach_msg_ool_descriptor32_t: interop.StructType<mach_msg_ool_descriptor32_t>;

interface mach_msg_ool_descriptor64_t {
	address: number;
	deallocate: number;
	copy: number;
	pad1: number;
	type: number;
	size: number;
}
declare var mach_msg_ool_descriptor64_t: interop.StructType<mach_msg_ool_descriptor64_t>;

interface mach_msg_ool_descriptor_t {
	address: interop.Pointer | interop.Reference<any>;
	size: number;
	deallocate: number;
	copy: number;
	pad1: number;
	type: number;
}
declare var mach_msg_ool_descriptor_t: interop.StructType<mach_msg_ool_descriptor_t>;

interface mach_msg_ool_ports_descriptor32_t {
	address: number;
	count: number;
	deallocate: number;
	copy: number;
	disposition: number;
	type: number;
}
declare var mach_msg_ool_ports_descriptor32_t: interop.StructType<mach_msg_ool_ports_descriptor32_t>;

interface mach_msg_ool_ports_descriptor64_t {
	address: number;
	deallocate: number;
	copy: number;
	disposition: number;
	type: number;
	count: number;
}
declare var mach_msg_ool_ports_descriptor64_t: interop.StructType<mach_msg_ool_ports_descriptor64_t>;

interface mach_msg_ool_ports_descriptor_t {
	address: interop.Pointer | interop.Reference<any>;
	count: number;
	deallocate: number;
	copy: number;
	disposition: number;
	type: number;
}
declare var mach_msg_ool_ports_descriptor_t: interop.StructType<mach_msg_ool_ports_descriptor_t>;

declare function mach_msg_overwrite(msg: interop.Pointer | interop.Reference<mach_msg_header_t>, option: number, send_size: number, rcv_size: number, rcv_name: number, timeout: number, notify: number, rcv_msg: interop.Pointer | interop.Reference<mach_msg_header_t>, rcv_limit: number): number;

interface mach_msg_port_descriptor_t {
	name: number;
	pad1: number;
	pad2: number;
	disposition: number;
	type: number;
}
declare var mach_msg_port_descriptor_t: interop.StructType<mach_msg_port_descriptor_t>;

declare function mach_msg_receive(p1: interop.Pointer | interop.Reference<mach_msg_header_t>): number;

interface mach_msg_security_trailer_t {
	msgh_trailer_type: number;
	msgh_trailer_size: number;
	msgh_seqno: number;
	msgh_sender: security_token_t;
}
declare var mach_msg_security_trailer_t: interop.StructType<mach_msg_security_trailer_t>;

declare function mach_msg_send(p1: interop.Pointer | interop.Reference<mach_msg_header_t>): number;

interface mach_msg_seqno_trailer_t {
	msgh_trailer_type: number;
	msgh_trailer_size: number;
	msgh_seqno: number;
}
declare var mach_msg_seqno_trailer_t: interop.StructType<mach_msg_seqno_trailer_t>;

declare function mach_msg_server(p1: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<mach_msg_header_t>, p2: interop.Pointer | interop.Reference<mach_msg_header_t>) => number>, p2: number, p3: number, p4: number): number;

declare function mach_msg_server_importance(p1: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<mach_msg_header_t>, p2: interop.Pointer | interop.Reference<mach_msg_header_t>) => number>, p2: number, p3: number, p4: number): number;

declare function mach_msg_server_once(p1: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<mach_msg_header_t>, p2: interop.Pointer | interop.Reference<mach_msg_header_t>) => number>, p2: number, p3: number, p4: number): number;

interface mach_msg_trailer_t {
	msgh_trailer_type: number;
	msgh_trailer_size: number;
}
declare var mach_msg_trailer_t: interop.StructType<mach_msg_trailer_t>;

interface mach_msg_type_descriptor_t {
	pad1: number;
	pad2: number;
	pad3: number;
	type: number;
}
declare var mach_msg_type_descriptor_t: interop.StructType<mach_msg_type_descriptor_t>;

interface mach_no_senders_notification_t {
	not_header: mach_msg_header_t;
	NDR: NDR_record_t;
	not_count: number;
	trailer: mach_msg_security_trailer_t;
}
declare var mach_no_senders_notification_t: interop.StructType<mach_no_senders_notification_t>;

declare function mach_port_allocate(task: number, right: number, name: interop.Pointer | interop.Reference<number>): number;

declare function mach_port_allocate_full(task: number, right: number, proto: number, qos: interop.Pointer | interop.Reference<mach_port_qos_t>, name: interop.Pointer | interop.Reference<number>): number;

declare function mach_port_allocate_name(task: number, right: number, name: number): number;

declare function mach_port_allocate_qos(task: number, right: number, qos: interop.Pointer | interop.Reference<mach_port_qos_t>, name: interop.Pointer | interop.Reference<number>): number;

declare function mach_port_construct(task: number, options: interop.Pointer | interop.Reference<mach_port_options_t>, context: number, name: interop.Pointer | interop.Reference<number>): number;

declare function mach_port_deallocate(task: number, name: number): number;

interface mach_port_deleted_notification_t {
	not_header: mach_msg_header_t;
	NDR: NDR_record_t;
	not_port: number;
	trailer: mach_msg_security_trailer_t;
}
declare var mach_port_deleted_notification_t: interop.StructType<mach_port_deleted_notification_t>;

declare function mach_port_destroy(task: number, name: number): number;

interface mach_port_destroyed_notification_t {
	not_header: mach_msg_header_t;
	not_body: mach_msg_body_t;
	not_port: mach_msg_port_descriptor_t;
	trailer: mach_msg_security_trailer_t;
}
declare var mach_port_destroyed_notification_t: interop.StructType<mach_port_destroyed_notification_t>;

declare function mach_port_destruct(task: number, name: number, srdelta: number, guard: number): number;

declare function mach_port_dnrequest_info(task: number, name: number, dnr_total: interop.Pointer | interop.Reference<number>, dnr_used: interop.Pointer | interop.Reference<number>): number;

declare function mach_port_extract_member(task: number, name: number, pset: number): number;

declare function mach_port_extract_right(task: number, name: number, msgt_name: number, poly: interop.Pointer | interop.Reference<number>, polyPoly: interop.Pointer | interop.Reference<number>): number;

declare function mach_port_get_attributes(task: number, name: number, flavor: number, port_info_out: interop.Pointer | interop.Reference<number>, port_info_outCnt: interop.Pointer | interop.Reference<number>): number;

declare function mach_port_get_context(task: number, name: number, context: interop.Pointer | interop.Reference<number>): number;

declare function mach_port_get_refs(task: number, name: number, right: number, refs: interop.Pointer | interop.Reference<number>): number;

declare function mach_port_get_set_status(task: number, name: number, members: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, membersCnt: interop.Pointer | interop.Reference<number>): number;

declare function mach_port_get_srights(task: number, name: number, srights: interop.Pointer | interop.Reference<number>): number;

declare function mach_port_guard(task: number, name: number, guard: number, strict: number): number;

declare const enum mach_port_guard_exception_codes {

	kGUARD_EXC_DESTROY = 1,

	kGUARD_EXC_MOD_REFS = 2,

	kGUARD_EXC_SET_CONTEXT = 4,

	kGUARD_EXC_UNGUARDED = 8,

	kGUARD_EXC_INCORRECT_GUARD = 16
}

interface mach_port_info_ext_t {
	mpie_status: mach_port_status_t;
	mpie_boost_cnt: number;
	reserved: interop.Reference<number>;
}
declare var mach_port_info_ext_t: interop.StructType<mach_port_info_ext_t>;

declare function mach_port_insert_member(task: number, name: number, pset: number): number;

declare function mach_port_insert_right(task: number, name: number, poly: number, polyPoly: number): number;

declare function mach_port_kernel_object(task: number, name: number, object_type: interop.Pointer | interop.Reference<number>, object_addr: interop.Pointer | interop.Reference<number>): number;

declare function mach_port_kobject(task: number, name: number, object_type: interop.Pointer | interop.Reference<number>, object_addr: interop.Pointer | interop.Reference<number>): number;

interface mach_port_limits_t {
	mpl_qlimit: number;
}
declare var mach_port_limits_t: interop.StructType<mach_port_limits_t>;

declare function mach_port_mod_refs(task: number, name: number, right: number, delta: number): number;

declare function mach_port_move_member(task: number, member: number, after: number): number;

declare function mach_port_names(task: number, names: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, namesCnt: interop.Pointer | interop.Reference<number>, types: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, typesCnt: interop.Pointer | interop.Reference<number>): number;

interface mach_port_options_t {
	flags: number;
	mpl: mach_port_limits_t;
	reserved: interop.Reference<number>;
}
declare var mach_port_options_t: interop.StructType<mach_port_options_t>;

declare function mach_port_peek(task: number, name: number, trailer_type: number, request_seqnop: interop.Pointer | interop.Reference<number>, msg_sizep: interop.Pointer | interop.Reference<number>, msg_idp: interop.Pointer | interop.Reference<number>, trailer_infop: string, trailer_infopCnt: interop.Pointer | interop.Reference<number>): number;

interface mach_port_qos_t {
	name: number;
	prealloc: number;
	pad1: number;
	len: number;
}
declare var mach_port_qos_t: interop.StructType<mach_port_qos_t>;

declare function mach_port_rename(task: number, old_name: number, new_name: number): number;

declare function mach_port_request_notification(task: number, name: number, msgid: number, sync: number, notify: number, notifyPoly: number, previous: interop.Pointer | interop.Reference<number>): number;

declare function mach_port_set_attributes(task: number, name: number, flavor: number, port_info: interop.Pointer | interop.Reference<number>, port_infoCnt: number): number;

declare function mach_port_set_context(task: number, name: number, context: number): number;

declare function mach_port_set_mscount(task: number, name: number, mscount: number): number;

declare function mach_port_set_seqno(task: number, name: number, seqno: number): number;

declare function mach_port_space_basic_info(task: number, basic_info: interop.Pointer | interop.Reference<ipc_info_space_basic_t>): number;

declare function mach_port_space_info(task: number, space_info: interop.Pointer | interop.Reference<ipc_info_space_t>, table_info: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<ipc_info_name_t>>, table_infoCnt: interop.Pointer | interop.Reference<number>, tree_info: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<ipc_info_tree_name_t>>, tree_infoCnt: interop.Pointer | interop.Reference<number>): number;

interface mach_port_status_t {
	mps_pset: number;
	mps_seqno: number;
	mps_mscount: number;
	mps_qlimit: number;
	mps_msgcount: number;
	mps_sorights: number;
	mps_srights: number;
	mps_pdrequest: number;
	mps_nsrequest: number;
	mps_flags: number;
}
declare var mach_port_status_t: interop.StructType<mach_port_status_t>;

declare function mach_port_type(task: number, name: number, ptype: interop.Pointer | interop.Reference<number>): number;

declare function mach_port_unguard(task: number, name: number, guard: number): number;

declare function mach_ports_lookup(target_task: number, init_port_set: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, init_port_setCnt: interop.Pointer | interop.Reference<number>): number;

declare function mach_ports_register(target_task: number, init_port_set: interop.Pointer | interop.Reference<number>, init_port_setCnt: number): number;

interface mach_send_once_notification_t {
	not_header: mach_msg_header_t;
	trailer: mach_msg_security_trailer_t;
}
declare var mach_send_once_notification_t: interop.StructType<mach_send_once_notification_t>;

interface mach_send_possible_notification_t {
	not_header: mach_msg_header_t;
	NDR: NDR_record_t;
	not_port: number;
	trailer: mach_msg_security_trailer_t;
}
declare var mach_send_possible_notification_t: interop.StructType<mach_send_possible_notification_t>;

interface mach_task_basic_info_data_t {
	virtual_size: number;
	resident_size: number;
	resident_size_max: number;
	user_time: time_value_t;
	system_time: time_value_t;
	policy: number;
	suspend_count: number;
}
declare var mach_task_basic_info_data_t: interop.StructType<mach_task_basic_info_data_t>;

declare var mach_task_self_: number;

declare function mach_thread_self(): number;

interface mach_timespec_t {
	tv_sec: number;
	tv_nsec: number;
}
declare var mach_timespec_t: interop.StructType<mach_timespec_t>;

interface mach_vm_info_region_t {
	vir_start: number;
	vir_end: number;
	vir_object: number;
	vir_offset: number;
	vir_needs_copy: number;
	vir_protection: number;
	vir_max_protection: number;
	vir_inheritance: number;
	vir_wired_count: number;
	vir_user_wired_count: number;
}
declare var mach_vm_info_region_t: interop.StructType<mach_vm_info_region_t>;

interface mach_vm_read_entry {
	address: number;
	size: number;
}
declare var mach_vm_read_entry: interop.StructType<mach_vm_read_entry>;

declare function mach_vm_region_info(task: number, address: number, region: interop.Pointer | interop.Reference<vm_info_region_t>, objects: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<vm_info_object_t>>, objectsCnt: interop.Pointer | interop.Reference<number>): number;

declare function mach_vm_region_info_64(task: number, address: number, region: interop.Pointer | interop.Reference<vm_info_region_64_t>, objects: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<vm_info_object_t>>, objectsCnt: interop.Pointer | interop.Reference<number>): number;

declare function mach_vm_wire(host_priv: number, task: number, address: number, size: number, desired_access: number): number;

declare function mach_voucher_deallocate(voucher: number): number;

declare function mach_voucher_extract_attr_recipe_trap(voucher_name: number, key: number, recipe: string, recipe_size: interop.Pointer | interop.Reference<number>): number;

declare function mach_zone_info(host: number, names: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<mach_zone_name_t>>, namesCnt: interop.Pointer | interop.Reference<number>, info: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<mach_zone_info_t>>, infoCnt: interop.Pointer | interop.Reference<number>): number;

interface mach_zone_info_t {
	mzi_count: number;
	mzi_cur_size: number;
	mzi_max_size: number;
	mzi_elem_size: number;
	mzi_alloc_size: number;
	mzi_sum_size: number;
	mzi_exhaustible: number;
	mzi_collectable: number;
}
declare var mach_zone_info_t: interop.StructType<mach_zone_info_t>;

interface mach_zone_name_t {
	mzn_name: interop.Reference<number>;
}
declare var mach_zone_name_t: interop.StructType<mach_zone_name_t>;

declare function macx_backing_store_recovery(pid: number): number;

declare function macx_backing_store_suspend(suspend: number): number;

declare function macx_swapoff(filename: number, flags: number): number;

declare function macx_swapon(filename: number, flags: number, size: number, priority: number): number;

declare function macx_triggers(hi_water: number, low_water: number, flags: number, alert_port: number): number;

declare function malloc(__size: number): interop.Pointer | interop.Reference<any>;

declare function malloc_create_zone(start_size: number, flags: number): interop.Pointer | interop.Reference<malloc_zone_t>;

declare function malloc_default_purgeable_zone(): interop.Pointer | interop.Reference<malloc_zone_t>;

declare function malloc_default_zone(): interop.Pointer | interop.Reference<malloc_zone_t>;

declare function malloc_destroy_zone(zone: interop.Pointer | interop.Reference<malloc_zone_t>): void;

declare function malloc_get_all_zones(task: number, reader: interop.FunctionReference<(p1: number, p2: number, p3: number, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => number>, addresses: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, count: interop.Pointer | interop.Reference<number>): number;

declare function malloc_get_zone_name(zone: interop.Pointer | interop.Reference<malloc_zone_t>): string;

declare function malloc_good_size(size: number): number;

interface malloc_introspection_t {
	enumerator: interop.FunctionReference<(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number, p5: interop.FunctionReference<(p1: number, p2: number, p3: number, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => number>, p6: interop.FunctionReference<(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<vm_range_t>, p5: number) => void>) => number>;
	good_size: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>, p2: number) => number>;
	check: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>) => number>;
	print: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>, p2: number) => void>;
	log: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>, p2: interop.Pointer | interop.Reference<any>) => void>;
	force_lock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>) => void>;
	force_unlock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>) => void>;
	statistics: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>, p2: interop.Pointer | interop.Reference<malloc_statistics_t>) => void>;
	zone_locked: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>) => number>;
	enable_discharge_checking: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>) => number>;
	disable_discharge_checking: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>) => void>;
	discharge: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>, p2: interop.Pointer | interop.Reference<any>) => void>;
	enumerate_discharged_pointers: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>, p2: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void) => void>;
	reinit_lock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>) => void>;
}
declare var malloc_introspection_t: interop.StructType<malloc_introspection_t>;

declare function malloc_make_nonpurgeable(ptr: interop.Pointer | interop.Reference<any>): number;

declare function malloc_make_purgeable(ptr: interop.Pointer | interop.Reference<any>): void;

declare function malloc_set_zone_name(zone: interop.Pointer | interop.Reference<malloc_zone_t>, name: string): void;

declare function malloc_size(ptr: interop.Pointer | interop.Reference<any>): number;

interface malloc_statistics_t {
	blocks_in_use: number;
	size_in_use: number;
	max_size_in_use: number;
	size_allocated: number;
}
declare var malloc_statistics_t: interop.StructType<malloc_statistics_t>;

declare function malloc_zone_batch_free(zone: interop.Pointer | interop.Reference<malloc_zone_t>, to_be_freed: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, num: number): void;

declare function malloc_zone_batch_malloc(zone: interop.Pointer | interop.Reference<malloc_zone_t>, size: number, results: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, num_requested: number): number;

declare function malloc_zone_calloc(zone: interop.Pointer | interop.Reference<malloc_zone_t>, num_items: number, size: number): interop.Pointer | interop.Reference<any>;

declare function malloc_zone_check(zone: interop.Pointer | interop.Reference<malloc_zone_t>): number;

declare function malloc_zone_disable_discharge_checking(zone: interop.Pointer | interop.Reference<malloc_zone_t>): void;

declare function malloc_zone_discharge(zone: interop.Pointer | interop.Reference<malloc_zone_t>, memory: interop.Pointer | interop.Reference<any>): void;

declare function malloc_zone_enable_discharge_checking(zone: interop.Pointer | interop.Reference<malloc_zone_t>): number;

declare function malloc_zone_enumerate_discharged_pointers(zone: interop.Pointer | interop.Reference<malloc_zone_t>, report_discharged: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void): void;

declare function malloc_zone_free(zone: interop.Pointer | interop.Reference<malloc_zone_t>, ptr: interop.Pointer | interop.Reference<any>): void;

declare function malloc_zone_from_ptr(ptr: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<malloc_zone_t>;

declare function malloc_zone_log(zone: interop.Pointer | interop.Reference<malloc_zone_t>, address: interop.Pointer | interop.Reference<any>): void;

declare function malloc_zone_malloc(zone: interop.Pointer | interop.Reference<malloc_zone_t>, size: number): interop.Pointer | interop.Reference<any>;

declare function malloc_zone_memalign(zone: interop.Pointer | interop.Reference<malloc_zone_t>, alignment: number, size: number): interop.Pointer | interop.Reference<any>;

declare function malloc_zone_pressure_relief(zone: interop.Pointer | interop.Reference<malloc_zone_t>, goal: number): number;

declare function malloc_zone_print(zone: interop.Pointer | interop.Reference<malloc_zone_t>, verbose: number): void;

declare function malloc_zone_print_ptr_info(ptr: interop.Pointer | interop.Reference<any>): void;

declare function malloc_zone_realloc(zone: interop.Pointer | interop.Reference<malloc_zone_t>, ptr: interop.Pointer | interop.Reference<any>, size: number): interop.Pointer | interop.Reference<any>;

declare function malloc_zone_register(zone: interop.Pointer | interop.Reference<malloc_zone_t>): void;

declare function malloc_zone_statistics(zone: interop.Pointer | interop.Reference<malloc_zone_t>, stats: interop.Pointer | interop.Reference<malloc_statistics_t>): void;

interface malloc_zone_t {
	reserved1: interop.Pointer | interop.Reference<any>;
	reserved2: interop.Pointer | interop.Reference<any>;
	size: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>, p2: interop.Pointer | interop.Reference<any>) => number>;
	malloc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>, p2: number) => interop.Pointer | interop.Reference<any>>;
	calloc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>, p2: number, p3: number) => interop.Pointer | interop.Reference<any>>;
	valloc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>, p2: number) => interop.Pointer | interop.Reference<any>>;
	free: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>, p2: interop.Pointer | interop.Reference<any>) => void>;
	realloc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>, p2: interop.Pointer | interop.Reference<any>, p3: number) => interop.Pointer | interop.Reference<any>>;
	destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>) => void>;
	zone_name: string;
	batch_malloc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p4: number) => number>;
	batch_free: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: number) => void>;
	introspect: interop.Pointer | interop.Reference<malloc_introspection_t>;
	version: number;
	memalign: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>, p2: number, p3: number) => interop.Pointer | interop.Reference<any>>;
	free_definite_size: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>, p2: interop.Pointer | interop.Reference<any>, p3: number) => void>;
	pressure_relief: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>, p2: number) => number>;
}
declare var malloc_zone_t: interop.StructType<malloc_zone_t>;

declare function malloc_zone_unregister(zone: interop.Pointer | interop.Reference<malloc_zone_t>): void;

declare function malloc_zone_valloc(zone: interop.Pointer | interop.Reference<malloc_zone_t>, size: number): interop.Pointer | interop.Reference<any>;

declare function mblen(__s: string, __n: number): number;

declare function mbstowcs(p1: interop.Pointer | interop.Reference<number>, p2: string, p3: number): number;

declare function mbtowc(p1: interop.Pointer | interop.Reference<number>, p2: string, p3: number): number;

declare function memccpy(__dst: interop.Pointer | interop.Reference<any>, __src: interop.Pointer | interop.Reference<any>, __c: number, __n: number): interop.Pointer | interop.Reference<any>;

declare function memchr(__s: interop.Pointer | interop.Reference<any>, __c: number, __n: number): interop.Pointer | interop.Reference<any>;

declare function memcmp(__s1: interop.Pointer | interop.Reference<any>, __s2: interop.Pointer | interop.Reference<any>, __n: number): number;

declare function memcpy(__dst: interop.Pointer | interop.Reference<any>, __src: interop.Pointer | interop.Reference<any>, __n: number): interop.Pointer | interop.Reference<any>;

declare function memmem(__big: interop.Pointer | interop.Reference<any>, __big_len: number, __little: interop.Pointer | interop.Reference<any>, __little_len: number): interop.Pointer | interop.Reference<any>;

declare function memmove(__dst: interop.Pointer | interop.Reference<any>, __src: interop.Pointer | interop.Reference<any>, __len: number): interop.Pointer | interop.Reference<any>;

interface memory_object_attr_info {
	copy_strategy: number;
	cluster_size: number;
	may_cache_object: number;
	temporary: number;
}
declare var memory_object_attr_info: interop.StructType<memory_object_attr_info>;

interface memory_object_behave_info {
	copy_strategy: number;
	temporary: number;
	invalidate: number;
	silent_overwrite: number;
	advisory_pageout: number;
}
declare var memory_object_behave_info: interop.StructType<memory_object_behave_info>;

interface memory_object_perf_info {
	cluster_size: number;
	may_cache: number;
}
declare var memory_object_perf_info: interop.StructType<memory_object_perf_info>;

declare function memset(__b: interop.Pointer | interop.Reference<any>, __c: number, __len: number): interop.Pointer | interop.Reference<any>;

declare function memset_pattern16(__b: interop.Pointer | interop.Reference<any>, __pattern16: interop.Pointer | interop.Reference<any>, __len: number): void;

declare function memset_pattern4(__b: interop.Pointer | interop.Reference<any>, __pattern4: interop.Pointer | interop.Reference<any>, __len: number): void;

declare function memset_pattern8(__b: interop.Pointer | interop.Reference<any>, __pattern8: interop.Pointer | interop.Reference<any>, __len: number): void;

declare function memset_s(__s: interop.Pointer | interop.Reference<any>, __smax: number, __c: number, __n: number): number;

declare function mergesort(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): number;

declare function mergesort_b(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number): number;

declare function mig_allocate(p1: interop.Pointer | interop.Reference<number>, p2: number): void;

declare function mig_dealloc_reply_port(reply_port: number): void;

declare function mig_deallocate(p1: number, p2: number): void;

declare function mig_get_reply_port(): number;

declare function mig_put_reply_port(reply_port: number): void;

interface mig_reply_error_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var mig_reply_error_t: interop.StructType<mig_reply_error_t>;

declare function mig_reply_setup(p1: interop.Pointer | interop.Reference<mach_msg_header_t>, p2: interop.Pointer | interop.Reference<mach_msg_header_t>): void;

declare function mig_strncpy(dest: string, src: string, len: number): number;

declare function mig_strncpy_zerofill(dest: string, src: string, len: number): number;

declare function mig_strncpy_zerofillFunction(dest: string, src: string, len: number): number;

interface mig_subsystem {
	server: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<mach_msg_header_t>) => interop.FunctionReference<(p1: interop.Pointer | interop.Reference<mach_msg_header_t>, p2: interop.Pointer | interop.Reference<mach_msg_header_t>) => void>>;
	start: number;
	end: number;
	maxsize: number;
	reserved: number;
	routine: interop.Reference<routine_descriptor>;
}
declare var mig_subsystem: interop.StructType<mig_subsystem>;

interface mig_symtab_t {
	ms_routine_name: string;
	ms_routine_number: number;
	ms_routine: interop.FunctionReference<() => void>;
}
declare var mig_symtab_t: interop.StructType<mig_symtab_t>;

declare function mkdtemp(p1: string): string;

declare function mknod(p1: string, p2: number, p3: number): number;

declare function mkostemp(path: string, oflags: number): number;

declare function mkostemps(path: string, slen: number, oflags: number): number;

declare function mkpath_np(path: string, omode: number): number;

declare function mkpathat_np(dfd: number, path: string, omode: number): number;

declare function mkstemp(p1: string): number;

declare function mkstempFunction(p1: string): number;

declare function mkstemp_dprotected_np(path: string, dpclass: number, dpflags: number): number;

declare function mkstemps(p1: string, p2: number): number;

declare function mktemp(p1: string): string;

declare function mktempFunction(p1: string): string;

declare function mktime(p1: interop.Pointer | interop.Reference<tm>): number;

declare function modf(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function modff(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function modfl(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function mrand48(): number;

interface msg_labels_t {
	sender: number;
}
declare var msg_labels_t: interop.StructType<msg_labels_t>;

interface msghdr {
	msg_name: interop.Pointer | interop.Reference<any>;
	msg_namelen: number;
	msg_iov: interop.Pointer | interop.Reference<iovec>;
	msg_iovlen: number;
	msg_control: interop.Pointer | interop.Reference<any>;
	msg_controllen: number;
	msg_flags: number;
}
declare var msghdr: interop.StructType<msghdr>;

declare function mstats(): mstatsStruct;

interface mstatsStruct {
	bytes_total: number;
	chunks_used: number;
	bytes_used: number;
	chunks_free: number;
	bytes_free: number;
}
declare var mstatsStruct: interop.StructType<mstatsStruct>;

declare function nan(p1: string): number;

declare function nanf(p1: string): number;

declare function nanl(p1: string): number;

declare function nanosleep(__rqtp: interop.Pointer | interop.Reference<timespec>, __rmtp: interop.Pointer | interop.Reference<timespec>): number;

declare function nearbyint(p1: number): number;

declare function nearbyintf(p1: number): number;

declare function nearbyintl(p1: number): number;

declare function nextafter(p1: number, p2: number): number;

declare function nextafterf(p1: number, p2: number): number;

declare function nextafterl(p1: number, p2: number): number;

declare function nexttoward(p1: number, p2: number): number;

declare function nexttowardf(p1: number, p2: number): number;

declare function nexttowardl(p1: number, p2: number): number;

declare function nfssvc(p1: number, p2: interop.Pointer | interop.Reference<any>): number;

declare function nice(p1: number): number;

declare function nrand48(p1: interop.Reference<number>): number;

interface ntsid_t {
	sid_kind: number;
	sid_authcount: number;
	sid_authority: interop.Reference<number>;
	sid_authorities: interop.Reference<number>;
}
declare var ntsid_t: interop.StructType<ntsid_t>;

declare function openx_np(p1: string, p2: number, p3: interop.Pointer | interop.Reference<any>): number;

declare var optarg: string;

declare var opterr: number;

declare var optind: number;

declare var optopt: number;

declare var optreset: number;

interface os_unfair_lock {
	_os_unfair_lock_opaque: number;
}
declare var os_unfair_lock: interop.StructType<os_unfair_lock>;

declare function os_unfair_lock_lock(lock: interop.Pointer | interop.Reference<os_unfair_lock>): void;

declare function os_unfair_lock_trylock(lock: interop.Pointer | interop.Reference<os_unfair_lock>): number;

declare function os_unfair_lock_unlock(lock: interop.Pointer | interop.Reference<os_unfair_lock>): void;

declare function panic_init(p1: number): void;

declare function pathconf(p1: string, p2: number): number;

declare function pause(): number;

declare function pclose(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function perror(p1: string): void;

declare function pfctlinput(p1: number, p2: interop.Pointer | interop.Reference<sockaddr>): void;

declare function pid_for_task(t: number, x: interop.Pointer | interop.Reference<number>): number;

declare function pipe(p1: interop.Reference<number>): number;

interface policy_bases {
	ts: policy_timeshare_base;
	rr: policy_rr_base;
	fifo: policy_fifo_base;
}
declare var policy_bases: interop.StructType<policy_bases>;

interface policy_fifo_base {
	base_priority: number;
}
declare var policy_fifo_base: interop.StructType<policy_fifo_base>;

interface policy_fifo_info {
	max_priority: number;
	base_priority: number;
	depressed: number;
	depress_priority: number;
}
declare var policy_fifo_info: interop.StructType<policy_fifo_info>;

interface policy_fifo_limit {
	max_priority: number;
}
declare var policy_fifo_limit: interop.StructType<policy_fifo_limit>;

interface policy_infos {
	ts: policy_timeshare_info;
	rr: policy_rr_info;
	fifo: policy_fifo_info;
}
declare var policy_infos: interop.StructType<policy_infos>;

interface policy_limits {
	ts: policy_timeshare_limit;
	rr: policy_rr_limit;
	fifo: policy_fifo_limit;
}
declare var policy_limits: interop.StructType<policy_limits>;

interface policy_rr_base {
	base_priority: number;
	quantum: number;
}
declare var policy_rr_base: interop.StructType<policy_rr_base>;

interface policy_rr_info {
	max_priority: number;
	base_priority: number;
	quantum: number;
	depressed: number;
	depress_priority: number;
}
declare var policy_rr_info: interop.StructType<policy_rr_info>;

interface policy_rr_limit {
	max_priority: number;
}
declare var policy_rr_limit: interop.StructType<policy_rr_limit>;

interface policy_timeshare_base {
	base_priority: number;
}
declare var policy_timeshare_base: interop.StructType<policy_timeshare_base>;

interface policy_timeshare_info {
	max_priority: number;
	base_priority: number;
	cur_priority: number;
	depressed: number;
	depress_priority: number;
}
declare var policy_timeshare_info: interop.StructType<policy_timeshare_info>;

interface policy_timeshare_limit {
	max_priority: number;
}
declare var policy_timeshare_limit: interop.StructType<policy_timeshare_limit>;

declare function popen(p1: string, p2: string): interop.Pointer | interop.Reference<FILE>;

declare function posix2time(p1: number): number;

declare function posix_memalign(__memptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __alignment: number, __size: number): number;

declare function posix_openpt(p1: number): number;

declare function pow(p1: number, p2: number): number;

declare function powf(p1: number, p2: number): number;

declare function powl(p1: number, p2: number): number;

declare function pread(__fd: number, __buf: interop.Pointer | interop.Reference<any>, __nbyte: number, __offset: number): number;

interface proc_rlimit_control_wakeupmon {
	wm_flags: number;
	wm_rate: number;
}
declare var proc_rlimit_control_wakeupmon: interop.StructType<proc_rlimit_control_wakeupmon>;

declare function processor_assign(processor: number, new_set: number, wait: number): number;

interface processor_basic_info_data_t {
	cpu_type: number;
	cpu_subtype: number;
	running: number;
	slot_num: number;
	is_master: number;
}
declare var processor_basic_info_data_t: interop.StructType<processor_basic_info_data_t>;

declare function processor_control(processor: number, processor_cmd: interop.Pointer | interop.Reference<number>, processor_cmdCnt: number): number;

interface processor_cpu_load_info_data_t {
	cpu_ticks: interop.Reference<number>;
}
declare var processor_cpu_load_info_data_t: interop.StructType<processor_cpu_load_info_data_t>;

declare function processor_exit(processor: number): number;

declare function processor_get_assignment(processor: number, assigned_set: interop.Pointer | interop.Reference<number>): number;

declare function processor_info(processor: number, flavor: number, host: interop.Pointer | interop.Reference<number>, processor_info_out: interop.Pointer | interop.Reference<number>, processor_info_outCnt: interop.Pointer | interop.Reference<number>): number;

interface processor_set_basic_info_data_t {
	processor_count: number;
	default_policy: number;
}
declare var processor_set_basic_info_data_t: interop.StructType<processor_set_basic_info_data_t>;

declare function processor_set_create(host: number, new_set: interop.Pointer | interop.Reference<number>, new_name: interop.Pointer | interop.Reference<number>): number;

declare function processor_set_default(host: number, default_set: interop.Pointer | interop.Reference<number>): number;

declare function processor_set_destroy(set: number): number;

declare function processor_set_info(set_name: number, flavor: number, host: interop.Pointer | interop.Reference<number>, info_out: interop.Pointer | interop.Reference<number>, info_outCnt: interop.Pointer | interop.Reference<number>): number;

interface processor_set_load_info_data_t {
	task_count: number;
	thread_count: number;
	load_average: number;
	mach_factor: number;
}
declare var processor_set_load_info_data_t: interop.StructType<processor_set_load_info_data_t>;

declare function processor_set_max_priority(processor_set: number, max_priority: number, change_threads: number): number;

declare function processor_set_policy_control(pset: number, flavor: number, policy_info: interop.Pointer | interop.Reference<number>, policy_infoCnt: number, change: number): number;

declare function processor_set_policy_disable(processor_set: number, policy: number, change_threads: number): number;

declare function processor_set_policy_enable(processor_set: number, policy: number): number;

declare function processor_set_stack_usage(pset: number, ltotal: interop.Pointer | interop.Reference<number>, space: interop.Pointer | interop.Reference<number>, resident: interop.Pointer | interop.Reference<number>, maxusage: interop.Pointer | interop.Reference<number>, maxstack: interop.Pointer | interop.Reference<number>): number;

declare function processor_set_statistics(pset: number, flavor: number, info_out: interop.Pointer | interop.Reference<number>, info_outCnt: interop.Pointer | interop.Reference<number>): number;

declare function processor_set_tasks(processor_set: number, task_list: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, task_listCnt: interop.Pointer | interop.Reference<number>): number;

declare function processor_set_threads(processor_set: number, thread_list: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, thread_listCnt: interop.Pointer | interop.Reference<number>): number;

declare function processor_start(processor: number): number;

declare function profil(p1: string, p2: number, p3: number, p4: number): number;

declare function pselect(p1: number, p2: interop.Pointer | interop.Reference<fd_set>, p3: interop.Pointer | interop.Reference<fd_set>, p4: interop.Pointer | interop.Reference<fd_set>, p5: interop.Pointer | interop.Reference<timespec>, p6: interop.Pointer | interop.Reference<number>): number;

declare function psignal(p1: number, p2: string): void;

declare function psort(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): void;

declare function psort_b(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number): void;

declare function psort_r(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, p4: interop.Pointer | interop.Reference<any>, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => number>): void;

declare function pthread_getugid_np(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): number;

declare function pthread_kill(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>, p2: number): number;

declare function pthread_setugid_np(p1: number, p2: number): number;

declare function pthread_sigmask(p1: number, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>): number;

declare function ptsname(p1: number): string;

declare function putc(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function putc_unlocked(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function putchar(p1: number): number;

declare function putchar_unlocked(p1: number): number;

declare function putenv(p1: string): number;

declare function puts(p1: string): number;

declare function putw(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function pwrite(__fd: number, __buf: interop.Pointer | interop.Reference<any>, __nbyte: number, __offset: number): number;

declare function qos_class_main(): qos_class_t;

declare function qos_class_self(): qos_class_t;

declare const enum qos_class_t {

	QOS_CLASS_USER_INTERACTIVE = 33,

	QOS_CLASS_USER_INITIATED = 25,

	QOS_CLASS_DEFAULT = 21,

	QOS_CLASS_UTILITY = 17,

	QOS_CLASS_BACKGROUND = 9,

	QOS_CLASS_UNSPECIFIED = 0
}

declare function qsort(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): void;

declare function qsort_b(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number): void;

declare function qsort_r(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, p4: interop.Pointer | interop.Reference<any>, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => number>): void;

declare function radixsort(__base: interop.Pointer | interop.Reference<string>, __nel: number, __table: string, __endbyte: number): number;

interface radvisory {
	ra_offset: number;
	ra_count: number;
}
declare var radvisory: interop.StructType<radvisory>;

declare function raise(p1: number): number;

declare function rand(): number;

declare function rand_r(p1: interop.Pointer | interop.Reference<number>): number;

declare function random(): number;

declare function rcmd(p1: interop.Pointer | interop.Reference<string>, p2: number, p3: string, p4: string, p5: string, p6: interop.Pointer | interop.Reference<number>): number;

declare function rcmd_af(p1: interop.Pointer | interop.Reference<string>, p2: number, p3: string, p4: string, p5: string, p6: interop.Pointer | interop.Reference<number>, p7: number): number;

declare function read(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number): number;

declare function readlink(p1: string, p2: string, p3: number): number;

declare function readlinkat(p1: number, p2: string, p3: string, p4: number): number;

declare function realloc(__ptr: interop.Pointer | interop.Reference<any>, __size: number): interop.Pointer | interop.Reference<any>;

declare function reallocf(__ptr: interop.Pointer | interop.Reference<any>, __size: number): interop.Pointer | interop.Reference<any>;

declare function realpath(p1: string, p2: string): string;

declare function reboot(p1: number): number;

declare function recv(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number): number;

declare function recvfrom(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number, p5: interop.Pointer | interop.Reference<sockaddr>, p6: interop.Pointer | interop.Reference<number>): number;

declare function recvmsg(p1: number, p2: interop.Pointer | interop.Reference<msghdr>, p3: number): number;

declare function remainder(p1: number, p2: number): number;

declare function remainderf(p1: number, p2: number): number;

declare function remainderl(p1: number, p2: number): number;

declare function remove(p1: string): number;

declare function remquo(p1: number, p2: number, p3: interop.Pointer | interop.Reference<number>): number;

declare function remquof(p1: number, p2: number, p3: interop.Pointer | interop.Reference<number>): number;

declare function remquol(p1: number, p2: number, p3: interop.Pointer | interop.Reference<number>): number;

declare function rename(__old: string, __new: string): number;

declare function revoke(p1: string): number;

declare function rewind(p1: interop.Pointer | interop.Reference<FILE>): void;

declare function rindex(p1: string, p2: number): string;

declare function rint(p1: number): number;

declare function rintf(p1: number): number;

declare function rintl(p1: number): number;

interface rlimit {
	rlim_cur: number;
	rlim_max: number;
}
declare var rlimit: interop.StructType<rlimit>;

declare function rmdir(p1: string): number;

declare function round(p1: number): number;

declare function roundf(p1: number): number;

declare function roundl(p1: number): number;

interface routine_descriptor {
	impl_routine: interop.FunctionReference<() => number>;
	stub_routine: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<mach_msg_header_t>, p2: interop.Pointer | interop.Reference<mach_msg_header_t>) => void>;
	argc: number;
	descr_count: number;
	arg_descr: interop.Pointer | interop.Reference<mach_msg_type_descriptor_t>;
	max_reply_msg: number;
}
declare var routine_descriptor: interop.StructType<routine_descriptor>;

interface rpc_routine_arg_descriptor {
	type: number;
	size: number;
	count: number;
	offset: number;
}
declare var rpc_routine_arg_descriptor: interop.StructType<rpc_routine_arg_descriptor>;

interface rpc_routine_descriptor {
	impl_routine: interop.FunctionReference<() => number>;
	stub_routine: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<mach_msg_header_t>, p2: interop.Pointer | interop.Reference<mach_msg_header_t>) => void>;
	argc: number;
	descr_count: number;
	arg_descr: interop.Pointer | interop.Reference<rpc_routine_arg_descriptor>;
	max_reply_msg: number;
}
declare var rpc_routine_descriptor: interop.StructType<rpc_routine_descriptor>;

interface rpc_signature {
	rd: rpc_routine_descriptor;
	rad: interop.Reference<rpc_routine_arg_descriptor>;
}
declare var rpc_signature: interop.StructType<rpc_signature>;

interface rpc_subsystem {
	reserved: interop.Pointer | interop.Reference<any>;
	start: number;
	end: number;
	maxsize: number;
	base_addr: number;
	routine: interop.Reference<rpc_routine_descriptor>;
	arg_descriptor: interop.Reference<rpc_routine_arg_descriptor>;
}
declare var rpc_subsystem: interop.StructType<rpc_subsystem>;

declare function rresvport(p1: interop.Pointer | interop.Reference<number>): number;

declare function rresvport_af(p1: interop.Pointer | interop.Reference<number>, p2: number): number;

interface rusage {
	ru_utime: timeval;
	ru_stime: timeval;
	ru_maxrss: number;
	ru_ixrss: number;
	ru_idrss: number;
	ru_isrss: number;
	ru_minflt: number;
	ru_majflt: number;
	ru_nswap: number;
	ru_inblock: number;
	ru_oublock: number;
	ru_msgsnd: number;
	ru_msgrcv: number;
	ru_nsignals: number;
	ru_nvcsw: number;
	ru_nivcsw: number;
}
declare var rusage: interop.StructType<rusage>;

interface rusage_info_current {
	ri_uuid: interop.Reference<number>;
	ri_user_time: number;
	ri_system_time: number;
	ri_pkg_idle_wkups: number;
	ri_interrupt_wkups: number;
	ri_pageins: number;
	ri_wired_size: number;
	ri_resident_size: number;
	ri_phys_footprint: number;
	ri_proc_start_abstime: number;
	ri_proc_exit_abstime: number;
	ri_child_user_time: number;
	ri_child_system_time: number;
	ri_child_pkg_idle_wkups: number;
	ri_child_interrupt_wkups: number;
	ri_child_pageins: number;
	ri_child_elapsed_abstime: number;
	ri_diskio_bytesread: number;
	ri_diskio_byteswritten: number;
	ri_cpu_time_qos_default: number;
	ri_cpu_time_qos_maintenance: number;
	ri_cpu_time_qos_background: number;
	ri_cpu_time_qos_utility: number;
	ri_cpu_time_qos_legacy: number;
	ri_cpu_time_qos_user_initiated: number;
	ri_cpu_time_qos_user_interactive: number;
	ri_billed_system_time: number;
	ri_serviced_system_time: number;
}
declare var rusage_info_current: interop.StructType<rusage_info_current>;

interface rusage_info_v0 {
	ri_uuid: interop.Reference<number>;
	ri_user_time: number;
	ri_system_time: number;
	ri_pkg_idle_wkups: number;
	ri_interrupt_wkups: number;
	ri_pageins: number;
	ri_wired_size: number;
	ri_resident_size: number;
	ri_phys_footprint: number;
	ri_proc_start_abstime: number;
	ri_proc_exit_abstime: number;
}
declare var rusage_info_v0: interop.StructType<rusage_info_v0>;

interface rusage_info_v1 {
	ri_uuid: interop.Reference<number>;
	ri_user_time: number;
	ri_system_time: number;
	ri_pkg_idle_wkups: number;
	ri_interrupt_wkups: number;
	ri_pageins: number;
	ri_wired_size: number;
	ri_resident_size: number;
	ri_phys_footprint: number;
	ri_proc_start_abstime: number;
	ri_proc_exit_abstime: number;
	ri_child_user_time: number;
	ri_child_system_time: number;
	ri_child_pkg_idle_wkups: number;
	ri_child_interrupt_wkups: number;
	ri_child_pageins: number;
	ri_child_elapsed_abstime: number;
}
declare var rusage_info_v1: interop.StructType<rusage_info_v1>;

interface rusage_info_v2 {
	ri_uuid: interop.Reference<number>;
	ri_user_time: number;
	ri_system_time: number;
	ri_pkg_idle_wkups: number;
	ri_interrupt_wkups: number;
	ri_pageins: number;
	ri_wired_size: number;
	ri_resident_size: number;
	ri_phys_footprint: number;
	ri_proc_start_abstime: number;
	ri_proc_exit_abstime: number;
	ri_child_user_time: number;
	ri_child_system_time: number;
	ri_child_pkg_idle_wkups: number;
	ri_child_interrupt_wkups: number;
	ri_child_pageins: number;
	ri_child_elapsed_abstime: number;
	ri_diskio_bytesread: number;
	ri_diskio_byteswritten: number;
}
declare var rusage_info_v2: interop.StructType<rusage_info_v2>;

declare function ruserok(p1: string, p2: number, p3: string, p4: string): number;

interface sa_endpoints_t {
	sae_srcif: number;
	sae_srcaddr: interop.Pointer | interop.Reference<sockaddr>;
	sae_srcaddrlen: number;
	sae_dstaddr: interop.Pointer | interop.Reference<sockaddr>;
	sae_dstaddrlen: number;
}
declare var sa_endpoints_t: interop.StructType<sa_endpoints_t>;

declare function safe_gets(p1: string, p2: string, p3: number): void;

declare function sbrk(p1: number): interop.Pointer | interop.Reference<any>;

declare function scalb(p1: number, p2: number): number;

declare function scalbln(p1: number, p2: number): number;

declare function scalblnf(p1: number, p2: number): number;

declare function scalblnl(p1: number, p2: number): number;

declare function scalbn(p1: number, p2: number): number;

declare function scalbnf(p1: number, p2: number): number;

declare function scalbnl(p1: number, p2: number): number;

declare function searchfs(p1: string, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<number>, p4: number, p5: number, p6: interop.Pointer | interop.Reference<any>): number;

interface security_token_t {
	val: interop.Reference<number>;
}
declare var security_token_t: interop.StructType<security_token_t>;

declare function seed48(p1: interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function select(p1: number, p2: interop.Pointer | interop.Reference<fd_set>, p3: interop.Pointer | interop.Reference<fd_set>, p4: interop.Pointer | interop.Reference<fd_set>, p5: interop.Pointer | interop.Reference<timeval>): number;

declare function semaphore_create(task: number, semaphore: interop.Pointer | interop.Reference<number>, policy: number, value: number): number;

declare function semaphore_destroy(task: number, semaphore: number): number;

declare function semaphore_signal(semaphore: number): number;

declare function semaphore_signal_all(semaphore: number): number;

declare function semaphore_signal_thread(semaphore: number, thread: number): number;

declare function semaphore_timedwait(semaphore: number, wait_time: mach_timespec_t): number;

declare function semaphore_timedwait_signal(wait_semaphore: number, signal_semaphore: number, wait_time: mach_timespec_t): number;

declare function semaphore_wait(semaphore: number): number;

declare function semaphore_wait_signal(wait_semaphore: number, signal_semaphore: number): number;

declare function send(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number): number;

declare function sendfile(p1: number, p2: number, p3: number, p4: interop.Pointer | interop.Reference<number>, p5: interop.Pointer | interop.Reference<sf_hdtr>, p6: number): number;

declare function sendmsg(p1: number, p2: interop.Pointer | interop.Reference<msghdr>, p3: number): number;

declare function sendto(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number, p5: interop.Pointer | interop.Reference<sockaddr>, p6: number): number;

declare function set_dp_control_port(host: number, control_port: number): number;

declare function setattrlist(p1: string, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: number): number;

declare function setbuf(p1: interop.Pointer | interop.Reference<FILE>, p2: string): void;

declare function setbuffer(p1: interop.Pointer | interop.Reference<FILE>, p2: string, p3: number): void;

declare function setdomainname(p1: string, p2: number): number;

declare function setegid(p1: number): number;

declare function setenv(__name: string, __value: string, __overwrite: number): number;

declare function seteuid(p1: number): number;

declare function setgid(p1: number): number;

declare function setgroups(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function sethostid(p1: number): void;

declare function sethostname(p1: string, p2: number): number;

declare function setiopolicy_np(p1: number, p2: number, p3: number): number;

declare function setipv4sourcefilter(p1: number, p2: in_addr, p3: in_addr, p4: number, p5: number, p6: interop.Pointer | interop.Reference<in_addr>): number;

declare function setjmp(p1: interop.Reference<number>): number;

declare function setkey(p1: string): void;

declare function setkeyFunction(p1: string): void;

declare function setlinebuf(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function setlocale(p1: number, p2: string): string;

declare function setlogin(p1: string): number;

declare function setmode(p1: string): interop.Pointer | interop.Reference<any>;

declare function setpgid(p1: number, p2: number): number;

declare function setpgrp(): number;

declare function setpriority(p1: number, p2: number, p3: number): number;

declare function setprogname(p1: string): void;

declare function setregid(p1: number, p2: number): number;

declare function setreuid(p1: number, p2: number): number;

declare function setrgid(p1: number): number;

declare function setrlimit(p1: number, p2: interop.Pointer | interop.Reference<rlimit>): number;

declare function setruid(p1: number): number;

declare function setsgroups_np(p1: number, p2: interop.Reference<number>): number;

declare function setsid(): number;

declare function setsockopt(p1: number, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>, p5: number): number;

declare function setsourcefilter(p1: number, p2: number, p3: interop.Pointer | interop.Reference<sockaddr>, p4: number, p5: number, p6: number, p7: interop.Pointer | interop.Reference<sockaddr_storage>): number;

declare function setstate(p1: string): string;

declare function setuid(p1: number): number;

declare function setusershell(): void;

declare function setvbuf(p1: interop.Pointer | interop.Reference<FILE>, p2: string, p3: number, p4: number): number;

declare function setwgroups_np(p1: number, p2: interop.Reference<number>): number;

interface sf_hdtr {
	headers: interop.Pointer | interop.Reference<iovec>;
	hdr_cnt: number;
	trailers: interop.Pointer | interop.Reference<iovec>;
	trl_cnt: number;
}
declare var sf_hdtr: interop.StructType<sf_hdtr>;

declare function shutdown(p1: number, p2: number): number;

declare function sigaddset(p1: interop.Pointer | interop.Reference<number>, p2: number): number;

declare function sigaltstack(p1: interop.Pointer | interop.Reference<stack_t>, p2: interop.Pointer | interop.Reference<stack_t>): number;

declare function sigblock(p1: number): number;

declare function sigdelset(p1: interop.Pointer | interop.Reference<number>, p2: number): number;

declare function sigemptyset(p1: interop.Pointer | interop.Reference<number>): number;

declare function sigfillset(p1: interop.Pointer | interop.Reference<number>): number;

declare function sighold(p1: number): number;

declare function sigignore(p1: number): number;

declare function siginterrupt(p1: number, p2: number): number;

declare function sigismember(p1: interop.Pointer | interop.Reference<number>, p2: number): number;

declare function siglongjmp(p1: interop.Reference<number>, p2: number): void;

declare function signal(p1: number, p2: interop.FunctionReference<(p1: number) => void>): interop.FunctionReference<(p1: number) => void>;

declare var signgam: number;

declare function sigpause(p1: number): number;

declare function sigpending(p1: interop.Pointer | interop.Reference<number>): number;

declare function sigprocmask(p1: number, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>): number;

declare function sigrelse(p1: number): number;

declare function sigset(p1: number, p2: interop.FunctionReference<(p1: number) => void>): interop.FunctionReference<(p1: number) => void>;

declare function sigsetjmp(p1: interop.Reference<number>, p2: number): number;

declare function sigsetmask(p1: number): number;

interface sigstack {
	ss_sp: string;
	ss_onstack: number;
}
declare var sigstack: interop.StructType<sigstack>;

declare function sigsuspend(p1: interop.Pointer | interop.Reference<number>): number;

declare function sigvec(p1: number, p2: interop.Pointer | interop.Reference<sigvecStruct>, p3: interop.Pointer | interop.Reference<sigvecStruct>): number;

interface sigvecStruct {
	sv_handler: interop.FunctionReference<(p1: number) => void>;
	sv_mask: number;
	sv_flags: number;
}
declare var sigvecStruct: interop.StructType<sigvecStruct>;

declare function sigwait(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): number;

declare function sin(p1: number): number;

declare function sinf(p1: number): number;

declare function sinh(p1: number): number;

declare function sinhf(p1: number): number;

declare function sinhl(p1: number): number;

declare function sinl(p1: number): number;

declare function sleep(p1: number): number;

declare function slot_name(p1: number, p2: number, p3: interop.Pointer | interop.Reference<string>, p4: interop.Pointer | interop.Reference<string>): void;

interface so_np_extensions {
	npx_flags: number;
	npx_mask: number;
}
declare var so_np_extensions: interop.StructType<so_np_extensions>;

interface sockaddr {
	sa_len: number;
	sa_family: number;
	sa_data: interop.Reference<number>;
}
declare var sockaddr: interop.StructType<sockaddr>;

interface sockaddr_in {
	sin_len: number;
	sin_family: number;
	sin_port: number;
	sin_addr: in_addr;
	sin_zero: interop.Reference<number>;
}
declare var sockaddr_in: interop.StructType<sockaddr_in>;

interface sockaddr_storage {
	ss_len: number;
	ss_family: number;
	__ss_pad1: interop.Reference<number>;
	__ss_align: number;
	__ss_pad2: interop.Reference<number>;
}
declare var sockaddr_storage: interop.StructType<sockaddr_storage>;

declare function sockatmark(p1: number): number;

declare function socket(p1: number, p2: number, p3: number): number;

declare function socketpair(p1: number, p2: number, p3: number, p4: interop.Pointer | interop.Reference<number>): number;

interface sockproto {
	sp_family: number;
	sp_protocol: number;
}
declare var sockproto: interop.StructType<sockproto>;

declare function sqrt(p1: number): number;

declare function sqrtf(p1: number): number;

declare function sqrtl(p1: number): number;

declare function sradixsort(__base: interop.Pointer | interop.Reference<string>, __nel: number, __table: string, __endbyte: number): number;

declare function srand(p1: number): void;

declare function srand48(p1: number): void;

declare function sranddev(): void;

declare function srandom(p1: number): void;

declare function srandomdev(): void;

interface stack_t {
	ss_sp: interop.Pointer | interop.Reference<any>;
	ss_size: number;
	ss_flags: number;
}
declare var stack_t: interop.StructType<stack_t>;

declare function stpcpy(__dst: string, __src: string): string;

declare function stpncpy(__dst: string, __src: string, __n: number): string;

declare function strcasecmp(p1: string, p2: string): number;

declare function strcasestr(__big: string, __little: string): string;

declare function strcat(__s1: string, __s2: string): string;

declare function strchr(__s: string, __c: number): string;

declare function strcmp(__s1: string, __s2: string): number;

declare function strcoll(__s1: string, __s2: string): number;

declare function strcpy(__dst: string, __src: string): string;

declare function strcspn(__s: string, __charset: string): number;

declare function strdup(__s1: string): string;

declare function strerror(__errnum: number): string;

declare function strerror_r(__errnum: number, __strerrbuf: string, __buflen: number): number;

declare function strftime(p1: string, p2: number, p3: string, p4: interop.Pointer | interop.Reference<tm>): number;

declare function strlcat(__dst: string, __source: string, __size: number): number;

declare function strlcpy(__dst: string, __source: string, __size: number): number;

declare function strlen(__s: string): number;

declare function strmode(__mode: number, __bp: string): void;

declare function strncasecmp(p1: string, p2: string, p3: number): number;

declare function strncat(__s1: string, __s2: string, __n: number): string;

declare function strncmp(__s1: string, __s2: string, __n: number): number;

declare function strncpy(__dst: string, __src: string, __n: number): string;

declare function strndup(__s1: string, __n: number): string;

declare function strnlen(__s1: string, __n: number): number;

declare function strnstr(__big: string, __little: string, __len: number): string;

declare function strpbrk(__s: string, __charset: string): string;

declare function strptime(p1: string, p2: string, p3: interop.Pointer | interop.Reference<tm>): string;

declare function strrchr(__s: string, __c: number): string;

declare function strsep(__stringp: interop.Pointer | interop.Reference<string>, __delim: string): string;

declare function strsignal(__sig: number): string;

declare function strspn(__s: string, __charset: string): number;

declare function strstr(__big: string, __little: string): string;

declare function strtod(p1: string, p2: interop.Pointer | interop.Reference<string>): number;

declare function strtof(p1: string, p2: interop.Pointer | interop.Reference<string>): number;

declare function strtofflags(p1: interop.Pointer | interop.Reference<string>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>): number;

declare function strtoimax(__nptr: string, __endptr: interop.Pointer | interop.Reference<string>, __base: number): number;

declare function strtok(__str: string, __sep: string): string;

declare function strtok_r(__str: string, __sep: string, __lasts: interop.Pointer | interop.Reference<string>): string;

declare function strtol(__str: string, __endptr: interop.Pointer | interop.Reference<string>, __base: number): number;

declare function strtold(p1: string, p2: interop.Pointer | interop.Reference<string>): number;

declare function strtoll(__str: string, __endptr: interop.Pointer | interop.Reference<string>, __base: number): number;

declare function strtoq(__str: string, __endptr: interop.Pointer | interop.Reference<string>, __base: number): number;

declare function strtoul(__str: string, __endptr: interop.Pointer | interop.Reference<string>, __base: number): number;

declare function strtoull(__str: string, __endptr: interop.Pointer | interop.Reference<string>, __base: number): number;

declare function strtoumax(__nptr: string, __endptr: interop.Pointer | interop.Reference<string>, __base: number): number;

declare function strtouq(__str: string, __endptr: interop.Pointer | interop.Reference<string>, __base: number): number;

declare function strxfrm(__s1: string, __s2: string, __n: number): number;

declare var suboptarg: string;

declare var suboptargVar: string;

declare function swab(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number): void;

declare function swabFunction(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number): void;

declare function swapon(p1: string): number;

declare function swtch(): number;

declare function swtch_pri(pri: number): number;

declare function symlink(p1: string, p2: string): number;

declare function symlinkat(p1: string, p2: number, p3: string): number;

declare function sync(): void;

declare function sync_volume_np(p1: string, p2: number): number;

declare var sys_errlist: interop.Reference<string>;

declare var sys_nerr: number;

declare var sys_siglist: interop.Reference<string>;

declare var sys_signame: interop.Reference<string>;

declare function sysconf(p1: number): number;

declare function system(p1: string): number;

declare function tan(p1: number): number;

declare function tanf(p1: number): number;

declare function tanh(p1: number): number;

declare function tanhf(p1: number): number;

declare function tanhl(p1: number): number;

declare function tanl(p1: number): number;

interface task_absolutetime_info_data_t {
	total_user: number;
	total_system: number;
	threads_user: number;
	threads_system: number;
}
declare var task_absolutetime_info_data_t: interop.StructType<task_absolutetime_info_data_t>;

interface task_affinity_tag_info_data_t {
	set_count: number;
	min: number;
	max: number;
	task_count: number;
}
declare var task_affinity_tag_info_data_t: interop.StructType<task_affinity_tag_info_data_t>;

declare function task_assign(task: number, new_set: number, assign_threads: number): number;

declare function task_assign_default(task: number, assign_threads: number): number;

interface task_basic_info_32_data_t {
	suspend_count: number;
	virtual_size: number;
	resident_size: number;
	user_time: time_value_t;
	system_time: time_value_t;
	policy: number;
}
declare var task_basic_info_32_data_t: interop.StructType<task_basic_info_32_data_t>;

interface task_basic_info_64_data_t {
	suspend_count: number;
	virtual_size: number;
	resident_size: number;
	user_time: time_value_t;
	system_time: time_value_t;
	policy: number;
}
declare var task_basic_info_64_data_t: interop.StructType<task_basic_info_64_data_t>;

interface task_basic_info_data_t {
	suspend_count: number;
	virtual_size: number;
	resident_size: number;
	user_time: time_value_t;
	system_time: time_value_t;
	policy: number;
}
declare var task_basic_info_data_t: interop.StructType<task_basic_info_data_t>;

interface task_category_policy_data_t {
	role: number;
}
declare var task_category_policy_data_t: interop.StructType<task_category_policy_data_t>;

declare function task_create(target_task: number, ledgers: interop.Pointer | interop.Reference<number>, ledgersCnt: number, inherit_memory: number, child_task: interop.Pointer | interop.Reference<number>): number;

interface task_dyld_info_data_t {
	all_image_info_addr: number;
	all_image_info_size: number;
	all_image_info_format: number;
}
declare var task_dyld_info_data_t: interop.StructType<task_dyld_info_data_t>;

interface task_events_info_data_t {
	faults: number;
	pageins: number;
	cow_faults: number;
	messages_sent: number;
	messages_received: number;
	syscalls_mach: number;
	syscalls_unix: number;
	csw: number;
}
declare var task_events_info_data_t: interop.StructType<task_events_info_data_t>;

interface task_extmod_info_data_t {
	task_uuid: interop.Reference<number>;
	extmod_statistics: vm_extmod_statistics;
}
declare var task_extmod_info_data_t: interop.StructType<task_extmod_info_data_t>;

interface task_flags_info_data_t {
	flags: number;
}
declare var task_flags_info_data_t: interop.StructType<task_flags_info_data_t>;

declare function task_for_pid(target_tport: number, pid: number, t: interop.Pointer | interop.Reference<number>): number;

declare function task_generate_corpse(task: number, corpse_task_port: interop.Pointer | interop.Reference<number>): number;

declare function task_get_assignment(task: number, assigned_set: interop.Pointer | interop.Reference<number>): number;

declare function task_get_emulation_vector(task: number, vector_start: interop.Pointer | interop.Reference<number>, emulation_vector: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, emulation_vectorCnt: interop.Pointer | interop.Reference<number>): number;

declare function task_get_exception_ports(task: number, exception_mask: number, masks: interop.Pointer | interop.Reference<number>, masksCnt: interop.Pointer | interop.Reference<number>, old_handlers: interop.Pointer | interop.Reference<number>, old_behaviors: interop.Pointer | interop.Reference<number>, old_flavors: interop.Pointer | interop.Reference<number>): number;

declare function task_get_mach_voucher(task: number, which: number, voucher: interop.Pointer | interop.Reference<number>): number;

declare function task_get_special_port(task: number, which_port: number, special_port: interop.Pointer | interop.Reference<number>): number;

declare function task_get_state(task: number, flavor: number, old_state: interop.Pointer | interop.Reference<number>, old_stateCnt: interop.Pointer | interop.Reference<number>): number;

declare function task_info(target_task: number, flavor: number, task_info_out: interop.Pointer | interop.Reference<number>, task_info_outCnt: interop.Pointer | interop.Reference<number>): number;

interface task_kernelmemory_info_data_t {
	total_palloc: number;
	total_pfree: number;
	total_salloc: number;
	total_sfree: number;
}
declare var task_kernelmemory_info_data_t: interop.StructType<task_kernelmemory_info_data_t>;

declare const enum task_latency_qos {

	LATENCY_QOS_TIER_UNSPECIFIED = 0,

	LATENCY_QOS_TIER_0 = 16711681,

	LATENCY_QOS_TIER_1 = 16711682,

	LATENCY_QOS_TIER_2 = 16711683,

	LATENCY_QOS_TIER_3 = 16711684,

	LATENCY_QOS_TIER_4 = 16711685,

	LATENCY_QOS_TIER_5 = 16711686
}

declare function task_map_corpse_info(task: number, corspe_task: number, kcd_addr_begin: interop.Pointer | interop.Reference<number>, kcd_size: interop.Pointer | interop.Reference<number>): number;

declare function task_map_corpse_info_64(task: number, corspe_task: number, kcd_addr_begin: interop.Pointer | interop.Reference<number>, kcd_size: interop.Pointer | interop.Reference<number>): number;

declare function task_name_for_pid(target_tport: number, pid: number, tn: interop.Pointer | interop.Reference<number>): number;

declare function task_policy(task: number, policy: number, base: interop.Pointer | interop.Reference<number>, baseCnt: number, set_limit: number, change: number): number;

declare function task_policy_get(task: number, flavor: number, policy_info: interop.Pointer | interop.Reference<number>, policy_infoCnt: interop.Pointer | interop.Reference<number>, get_default: interop.Pointer | interop.Reference<number>): number;

declare function task_policy_set(task: number, flavor: number, policy_info: interop.Pointer | interop.Reference<number>, policy_infoCnt: number): number;

interface task_power_info_data_t {
	total_user: number;
	total_system: number;
	task_interrupt_wakeups: number;
	task_platform_idle_wakeups: number;
	task_timer_wakeups_bin_1: number;
	task_timer_wakeups_bin_2: number;
}
declare var task_power_info_data_t: interop.StructType<task_power_info_data_t>;

interface task_power_info_v2_data_t {
	cpu_energy: task_power_info_data_t;
	gpu_energy: gpu_energy_data;
}
declare var task_power_info_v2_data_t: interop.StructType<task_power_info_v2_data_t>;

declare function task_purgable_info(task: number, stats: interop.Pointer | interop.Reference<vm_purgeable_info>): number;

interface task_qos_policy {
	task_latency_qos_tier: number;
	task_throughput_qos_tier: number;
}
declare var task_qos_policy: interop.StructType<task_qos_policy>;

declare function task_register_dyld_set_dyld_state(task: number, dyld_state: number): number;

declare function task_resume(target_task: number): number;

declare function task_resume2(suspend_token: number): number;

declare const enum task_role {

	TASK_RENICED = -1,

	TASK_UNSPECIFIED = 0,

	TASK_FOREGROUND_APPLICATION = 1,

	TASK_BACKGROUND_APPLICATION = 2,

	TASK_CONTROL_APPLICATION = 3,

	TASK_GRAPHICS_SERVER = 4,

	TASK_THROTTLE_APPLICATION = 5,

	TASK_NONUI_APPLICATION = 6,

	TASK_DEFAULT_APPLICATION = 7
}

declare function task_sample(task: number, reply: number): number;

declare function task_self_trap(): number;

declare function task_set_emulation(target_port: number, routine_entry_pt: number, routine_number: number): number;

declare function task_set_emulation_vector(task: number, vector_start: number, emulation_vector: interop.Pointer | interop.Reference<number>, emulation_vectorCnt: number): number;

declare function task_set_exception_ports(task: number, exception_mask: number, new_port: number, behavior: number, new_flavor: number): number;

declare function task_set_info(target_task: number, flavor: number, task_info_in: interop.Pointer | interop.Reference<number>, task_info_inCnt: number): number;

declare function task_set_mach_voucher(task: number, voucher: number): number;

declare function task_set_phys_footprint_limit(task: number, new_limit: number, old_limit: interop.Pointer | interop.Reference<number>): number;

declare function task_set_policy(task: number, pset: number, policy: number, base: interop.Pointer | interop.Reference<number>, baseCnt: number, limit: interop.Pointer | interop.Reference<number>, limitCnt: number, change: number): number;

declare function task_set_port_space(task: number, table_entries: number): number;

declare function task_set_ras_pc(target_task: number, basepc: number, boundspc: number): number;

declare function task_set_special_port(task: number, which_port: number, special_port: number): number;

declare function task_set_state(task: number, flavor: number, new_state: interop.Pointer | interop.Reference<number>, new_stateCnt: number): number;

declare function task_suspend(target_task: number): number;

declare function task_suspend2(target_task: number, suspend_token: interop.Pointer | interop.Reference<number>): number;

declare function task_swap_exception_ports(task: number, exception_mask: number, new_port: number, behavior: number, new_flavor: number, masks: interop.Pointer | interop.Reference<number>, masksCnt: interop.Pointer | interop.Reference<number>, old_handlerss: interop.Pointer | interop.Reference<number>, old_behaviors: interop.Pointer | interop.Reference<number>, old_flavors: interop.Pointer | interop.Reference<number>): number;

declare function task_swap_mach_voucher(task: number, new_voucher: number, old_voucher: interop.Pointer | interop.Reference<number>): number;

declare function task_terminate(target_task: number): number;

interface task_thread_times_info_data_t {
	user_time: time_value_t;
	system_time: time_value_t;
}
declare var task_thread_times_info_data_t: interop.StructType<task_thread_times_info_data_t>;

declare function task_threads(target_task: number, act_list: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, act_listCnt: interop.Pointer | interop.Reference<number>): number;

declare const enum task_throughput_qos {

	THROUGHPUT_QOS_TIER_UNSPECIFIED = 0,

	THROUGHPUT_QOS_TIER_0 = 16646145,

	THROUGHPUT_QOS_TIER_1 = 16646146,

	THROUGHPUT_QOS_TIER_2 = 16646147,

	THROUGHPUT_QOS_TIER_3 = 16646148,

	THROUGHPUT_QOS_TIER_4 = 16646149,

	THROUGHPUT_QOS_TIER_5 = 16646150
}

interface task_trace_memory_info_data_t {
	user_memory_address: number;
	buffer_size: number;
	mailbox_array_size: number;
}
declare var task_trace_memory_info_data_t: interop.StructType<task_trace_memory_info_data_t>;

interface task_vm_info_data_t {
	virtual_size: number;
	region_count: number;
	page_size: number;
	resident_size: number;
	resident_size_peak: number;
	device: number;
	device_peak: number;
	internal: number;
	internal_peak: number;
	external: number;
	external_peak: number;
	reusable: number;
	reusable_peak: number;
	purgeable_volatile_pmap: number;
	purgeable_volatile_resident: number;
	purgeable_volatile_virtual: number;
	compressed: number;
	compressed_peak: number;
	compressed_lifetime: number;
	phys_footprint: number;
	min_address: number;
	max_address: number;
}
declare var task_vm_info_data_t: interop.StructType<task_vm_info_data_t>;

interface task_wait_state_info_data_t {
	total_wait_state_time: number;
	total_wait_sfi_state_time: number;
	_reserved: interop.Reference<number>;
}
declare var task_wait_state_info_data_t: interop.StructType<task_wait_state_info_data_t>;

declare function task_wire(target_task: number, must_wire: number): number;

declare function task_zone_info(target_task: number, names: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<mach_zone_name_t>>, namesCnt: interop.Pointer | interop.Reference<number>, info: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<task_zone_info_t>>, infoCnt: interop.Pointer | interop.Reference<number>): number;

interface task_zone_info_t {
	tzi_count: number;
	tzi_cur_size: number;
	tzi_max_size: number;
	tzi_elem_size: number;
	tzi_alloc_size: number;
	tzi_sum_size: number;
	tzi_exhaustible: number;
	tzi_collectable: number;
	tzi_caller_acct: number;
	tzi_task_alloc: number;
	tzi_task_free: number;
}
declare var task_zone_info_t: interop.StructType<task_zone_info_t>;

declare function tcgetpgrp(p1: number): number;

declare function tcsetpgrp(p1: number, p2: number): number;

declare function tempnam(__dir: string, __prefix: string): string;

declare function tgamma(p1: number): number;

declare function tgammaf(p1: number): number;

declare function tgammal(p1: number): number;

declare function thread_abort(target_act: number): number;

declare function thread_abort_safely(target_act: number): number;

interface thread_affinity_policy_data_t {
	affinity_tag: number;
}
declare var thread_affinity_policy_data_t: interop.StructType<thread_affinity_policy_data_t>;

declare function thread_assign(thread: number, new_set: number): number;

declare function thread_assign_default(thread: number): number;

interface thread_background_policy_data_t {
	priority: number;
}
declare var thread_background_policy_data_t: interop.StructType<thread_background_policy_data_t>;

interface thread_basic_info_data_t {
	user_time: time_value_t;
	system_time: time_value_t;
	cpu_usage: number;
	policy: number;
	run_state: number;
	flags: number;
	suspend_count: number;
	sleep_time: number;
}
declare var thread_basic_info_data_t: interop.StructType<thread_basic_info_data_t>;

declare function thread_create(parent_task: number, child_act: interop.Pointer | interop.Reference<number>): number;

declare function thread_create_running(parent_task: number, flavor: number, new_state: interop.Pointer | interop.Reference<number>, new_stateCnt: number, child_act: interop.Pointer | interop.Reference<number>): number;

declare function thread_depress_abort(thread: number): number;

interface thread_extended_info_data_t {
	pth_user_time: number;
	pth_system_time: number;
	pth_cpu_usage: number;
	pth_policy: number;
	pth_run_state: number;
	pth_flags: number;
	pth_sleep_time: number;
	pth_curpri: number;
	pth_priority: number;
	pth_maxpriority: number;
	pth_name: interop.Reference<number>;
}
declare var thread_extended_info_data_t: interop.StructType<thread_extended_info_data_t>;

interface thread_extended_policy_data_t {
	timeshare: number;
}
declare var thread_extended_policy_data_t: interop.StructType<thread_extended_policy_data_t>;

declare function thread_get_assignment(thread: number, assigned_set: interop.Pointer | interop.Reference<number>): number;

declare function thread_get_exception_ports(thread: number, exception_mask: number, masks: interop.Pointer | interop.Reference<number>, masksCnt: interop.Pointer | interop.Reference<number>, old_handlers: interop.Pointer | interop.Reference<number>, old_behaviors: interop.Pointer | interop.Reference<number>, old_flavors: interop.Pointer | interop.Reference<number>): number;

declare function thread_get_mach_voucher(thr_act: number, which: number, voucher: interop.Pointer | interop.Reference<number>): number;

declare function thread_get_special_port(thr_act: number, which_port: number, special_port: interop.Pointer | interop.Reference<number>): number;

declare function thread_get_state(target_act: number, flavor: number, old_state: interop.Pointer | interop.Reference<number>, old_stateCnt: interop.Pointer | interop.Reference<number>): number;

interface thread_identifier_info_data_t {
	thread_id: number;
	thread_handle: number;
	dispatch_qaddr: number;
}
declare var thread_identifier_info_data_t: interop.StructType<thread_identifier_info_data_t>;

declare function thread_info(target_act: number, flavor: number, thread_info_out: interop.Pointer | interop.Reference<number>, thread_info_outCnt: interop.Pointer | interop.Reference<number>): number;

interface thread_latency_qos_policy_data_t {
	thread_latency_qos_tier: number;
}
declare var thread_latency_qos_policy_data_t: interop.StructType<thread_latency_qos_policy_data_t>;

declare function thread_policy(thr_act: number, policy: number, base: interop.Pointer | interop.Reference<number>, baseCnt: number, set_limit: number): number;

declare function thread_policy_get(thread: number, flavor: number, policy_info: interop.Pointer | interop.Reference<number>, policy_infoCnt: interop.Pointer | interop.Reference<number>, get_default: interop.Pointer | interop.Reference<number>): number;

declare function thread_policy_set(thread: number, flavor: number, policy_info: interop.Pointer | interop.Reference<number>, policy_infoCnt: number): number;

interface thread_precedence_policy_data_t {
	importance: number;
}
declare var thread_precedence_policy_data_t: interop.StructType<thread_precedence_policy_data_t>;

declare function thread_resume(target_act: number): number;

declare function thread_sample(thread: number, reply: number): number;

declare function thread_set_exception_ports(thread: number, exception_mask: number, new_port: number, behavior: number, new_flavor: number): number;

declare function thread_set_mach_voucher(thr_act: number, voucher: number): number;

declare function thread_set_policy(thr_act: number, pset: number, policy: number, base: interop.Pointer | interop.Reference<number>, baseCnt: number, limit: interop.Pointer | interop.Reference<number>, limitCnt: number): number;

declare function thread_set_special_port(thr_act: number, which_port: number, special_port: number): number;

declare function thread_set_state(target_act: number, flavor: number, new_state: interop.Pointer | interop.Reference<number>, new_stateCnt: number): number;

interface thread_standard_policy_data_t {
	no_data: number;
}
declare var thread_standard_policy_data_t: interop.StructType<thread_standard_policy_data_t>;

declare function thread_suspend(target_act: number): number;

declare function thread_swap_exception_ports(thread: number, exception_mask: number, new_port: number, behavior: number, new_flavor: number, masks: interop.Pointer | interop.Reference<number>, masksCnt: interop.Pointer | interop.Reference<number>, old_handlers: interop.Pointer | interop.Reference<number>, old_behaviors: interop.Pointer | interop.Reference<number>, old_flavors: interop.Pointer | interop.Reference<number>): number;

declare function thread_swap_mach_voucher(thr_act: number, new_voucher: number, old_voucher: interop.Pointer | interop.Reference<number>): number;

declare function thread_switch(thread_name: number, option: number, option_time: number): number;

declare function thread_terminate(target_act: number): number;

interface thread_throughput_qos_policy_data_t {
	thread_throughput_qos_tier: number;
}
declare var thread_throughput_qos_policy_data_t: interop.StructType<thread_throughput_qos_policy_data_t>;

interface thread_time_constraint_policy_data_t {
	period: number;
	computation: number;
	constraint: number;
	preemptible: number;
}
declare var thread_time_constraint_policy_data_t: interop.StructType<thread_time_constraint_policy_data_t>;

declare function thread_wire(host_priv: number, thread: number, wired: number): number;

declare function time(p1: interop.Pointer | interop.Reference<number>): number;

declare function time2posix(p1: number): number;

interface time_value_t {
	seconds: number;
	microseconds: number;
}
declare var time_value_t: interop.StructType<time_value_t>;

declare function timegm(p1: interop.Pointer | interop.Reference<tm>): number;

declare function timelocal(p1: interop.Pointer | interop.Reference<tm>): number;

interface timespec {
	tv_sec: number;
	tv_nsec: number;
}
declare var timespec: interop.StructType<timespec>;

interface timeval {
	tv_sec: number;
	tv_usec: number;
}
declare var timeval: interop.StructType<timeval>;

declare var timezone: number;

interface tm {
	tm_sec: number;
	tm_min: number;
	tm_hour: number;
	tm_mday: number;
	tm_mon: number;
	tm_year: number;
	tm_wday: number;
	tm_yday: number;
	tm_isdst: number;
	tm_gmtoff: number;
	tm_zone: string;
}
declare var tm: interop.StructType<tm>;

declare function tmpfile(): interop.Pointer | interop.Reference<FILE>;

declare function tmpnam(p1: string): string;

declare function trunc(p1: number): number;

declare function truncate(p1: string, p2: number): number;

declare function truncf(p1: number): number;

declare function truncl(p1: number): number;

declare function ttyname(p1: number): string;

declare function ttyname_r(p1: number, p2: string, p3: number): number;

declare function ttyslot(): number;

declare var tzname: interop.Reference<string>;

declare function tzset(): void;

declare function tzsetwall(): void;

declare function ualarm(p1: number, p2: number): number;

declare function undelete(p1: string): number;

declare function ungetc(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function unlink(p1: string): number;

declare function unlinkat(p1: number, p2: string, p3: number): number;

declare function unlockpt(p1: number): number;

declare function unsetenv(p1: string): number;

declare function unwhiteout(p1: string): number;

declare function usleep(p1: number): number;

declare function uuid_clear(uu: interop.Reference<number>): void;

declare function uuid_compare(uu1: interop.Reference<number>, uu2: interop.Reference<number>): number;

declare function uuid_copy(dst: interop.Reference<number>, src: interop.Reference<number>): void;

declare function uuid_generate(out: interop.Reference<number>): void;

declare function uuid_generate_random(out: interop.Reference<number>): void;

declare function uuid_generate_time(out: interop.Reference<number>): void;

declare function uuid_is_null(uu: interop.Reference<number>): number;

declare function uuid_parse(_in: interop.Reference<number>, uu: interop.Reference<number>): number;

declare function uuid_unparse(uu: interop.Reference<number>, out: interop.Reference<number>): void;

declare function uuid_unparse_lower(uu: interop.Reference<number>, out: interop.Reference<number>): void;

declare function uuid_unparse_upper(uu: interop.Reference<number>, out: interop.Reference<number>): void;

declare function valloc(p1: number): interop.Pointer | interop.Reference<any>;

declare function vallocFunction(p1: number): interop.Pointer | interop.Reference<any>;

declare function vfork(): number;

declare function vm_allocate(target_task: number, address: interop.Pointer | interop.Reference<number>, size: number, flags: number): number;

declare function vm_allocate_cpm(host_priv: number, task: number, address: interop.Pointer | interop.Reference<number>, size: number, flags: number): number;

declare function vm_behavior_set(target_task: number, address: number, size: number, new_behavior: number): number;

declare function vm_copy(target_task: number, source_address: number, size: number, dest_address: number): number;

declare function vm_deallocate(target_task: number, address: number, size: number): number;

interface vm_extmod_statistics {
	task_for_pid_count: number;
	task_for_pid_caller_count: number;
	thread_creation_count: number;
	thread_creation_caller_count: number;
	thread_set_state_count: number;
	thread_set_state_caller_count: number;
}
declare var vm_extmod_statistics: interop.StructType<vm_extmod_statistics>;

interface vm_info_object_t {
	vio_object: number;
	vio_size: number;
	vio_ref_count: number;
	vio_resident_page_count: number;
	vio_absent_count: number;
	vio_copy: number;
	vio_shadow: number;
	vio_shadow_offset: number;
	vio_paging_offset: number;
	vio_copy_strategy: number;
	vio_last_alloc: number;
	vio_paging_in_progress: number;
	vio_pager_created: number;
	vio_pager_initialized: number;
	vio_pager_ready: number;
	vio_can_persist: number;
	vio_internal: number;
	vio_temporary: number;
	vio_alive: number;
	vio_purgable: number;
	vio_purgable_volatile: number;
}
declare var vm_info_object_t: interop.StructType<vm_info_object_t>;

interface vm_info_region_64_t {
	vir_start: number;
	vir_end: number;
	vir_object: number;
	vir_offset: number;
	vir_needs_copy: number;
	vir_protection: number;
	vir_max_protection: number;
	vir_inheritance: number;
	vir_wired_count: number;
	vir_user_wired_count: number;
}
declare var vm_info_region_64_t: interop.StructType<vm_info_region_64_t>;

interface vm_info_region_t {
	vir_start: number;
	vir_end: number;
	vir_object: number;
	vir_offset: number;
	vir_needs_copy: number;
	vir_protection: number;
	vir_max_protection: number;
	vir_inheritance: number;
	vir_wired_count: number;
	vir_user_wired_count: number;
}
declare var vm_info_region_t: interop.StructType<vm_info_region_t>;

declare function vm_inherit(target_task: number, address: number, size: number, new_inheritance: number): number;

declare function vm_machine_attribute(target_task: number, address: number, size: number, attribute: number, value: interop.Pointer | interop.Reference<number>): number;

declare function vm_map(target_task: number, address: interop.Pointer | interop.Reference<number>, size: number, mask: number, flags: number, object: number, offset: number, copy: number, cur_protection: number, max_protection: number, inheritance: number): number;

declare function vm_map_64(target_task: number, address: interop.Pointer | interop.Reference<number>, size: number, mask: number, flags: number, object: number, offset: number, copy: number, cur_protection: number, max_protection: number, inheritance: number): number;

declare function vm_map_page_query(target_map: number, offset: number, disposition: interop.Pointer | interop.Reference<number>, ref_count: interop.Pointer | interop.Reference<number>): number;

declare function vm_mapped_pages_info(task: number, pages: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, pagesCnt: interop.Pointer | interop.Reference<number>): number;

declare function vm_msync(target_task: number, address: number, size: number, sync_flags: number): number;

interface vm_page_info_basic {
	disposition: number;
	ref_count: number;
	object_id: number;
	offset: number;
	depth: number;
	__pad: number;
}
declare var vm_page_info_basic: interop.StructType<vm_page_info_basic>;

declare function vm_protect(target_task: number, address: number, size: number, set_maximum: number, new_protection: number): number;

declare function vm_purgable_control(target_task: number, address: number, control: number, state: interop.Pointer | interop.Reference<number>): number;

interface vm_purgeable_info {
	fifo_data: interop.Reference<vm_purgeable_stat_t>;
	obsolete_data: vm_purgeable_stat_t;
	lifo_data: interop.Reference<vm_purgeable_stat_t>;
}
declare var vm_purgeable_info: interop.StructType<vm_purgeable_info>;

interface vm_purgeable_stat_t {
	count: number;
	size: number;
}
declare var vm_purgeable_stat_t: interop.StructType<vm_purgeable_stat_t>;

interface vm_range_t {
	address: number;
	size: number;
}
declare var vm_range_t: interop.StructType<vm_range_t>;

declare function vm_read(target_task: number, address: number, size: number, data: interop.Pointer | interop.Reference<number>, dataCnt: interop.Pointer | interop.Reference<number>): number;

interface vm_read_entry {
	address: number;
	size: number;
}
declare var vm_read_entry: interop.StructType<vm_read_entry>;

declare function vm_read_list(target_task: number, data_list: interop.Reference<vm_read_entry>, count: number): number;

declare function vm_read_overwrite(target_task: number, address: number, size: number, data: number, outsize: interop.Pointer | interop.Reference<number>): number;

declare function vm_region(target_task: number, address: interop.Pointer | interop.Reference<number>, size: interop.Pointer | interop.Reference<number>, flavor: number, info: interop.Pointer | interop.Reference<number>, infoCnt: interop.Pointer | interop.Reference<number>, object_name: interop.Pointer | interop.Reference<number>): number;

declare function vm_region_64(target_task: number, address: interop.Pointer | interop.Reference<number>, size: interop.Pointer | interop.Reference<number>, flavor: number, info: interop.Pointer | interop.Reference<number>, infoCnt: interop.Pointer | interop.Reference<number>, object_name: interop.Pointer | interop.Reference<number>): number;

interface vm_region_basic_info {
	protection: number;
	max_protection: number;
	inheritance: number;
	shared: number;
	reserved: number;
	offset: number;
	behavior: number;
	user_wired_count: number;
}
declare var vm_region_basic_info: interop.StructType<vm_region_basic_info>;

interface vm_region_basic_info_64 {
	protection: number;
	max_protection: number;
	inheritance: number;
	shared: number;
	reserved: number;
	offset: number;
	behavior: number;
	user_wired_count: number;
}
declare var vm_region_basic_info_64: interop.StructType<vm_region_basic_info_64>;

interface vm_region_extended_info {
	protection: number;
	user_tag: number;
	pages_resident: number;
	pages_shared_now_private: number;
	pages_swapped_out: number;
	pages_dirtied: number;
	ref_count: number;
	shadow_depth: number;
	external_pager: number;
	share_mode: number;
	pages_reusable: number;
}
declare var vm_region_extended_info: interop.StructType<vm_region_extended_info>;

declare function vm_region_recurse(target_task: number, address: interop.Pointer | interop.Reference<number>, size: interop.Pointer | interop.Reference<number>, nesting_depth: interop.Pointer | interop.Reference<number>, info: interop.Pointer | interop.Reference<number>, infoCnt: interop.Pointer | interop.Reference<number>): number;

declare function vm_region_recurse_64(target_task: number, address: interop.Pointer | interop.Reference<number>, size: interop.Pointer | interop.Reference<number>, nesting_depth: interop.Pointer | interop.Reference<number>, info: interop.Pointer | interop.Reference<number>, infoCnt: interop.Pointer | interop.Reference<number>): number;

interface vm_region_submap_info {
	protection: number;
	max_protection: number;
	inheritance: number;
	offset: number;
	user_tag: number;
	pages_resident: number;
	pages_shared_now_private: number;
	pages_swapped_out: number;
	pages_dirtied: number;
	ref_count: number;
	shadow_depth: number;
	external_pager: number;
	share_mode: number;
	is_submap: number;
	behavior: number;
	object_id: number;
	user_wired_count: number;
}
declare var vm_region_submap_info: interop.StructType<vm_region_submap_info>;

interface vm_region_submap_info_64 {
	protection: number;
	max_protection: number;
	inheritance: number;
	offset: number;
	user_tag: number;
	pages_resident: number;
	pages_shared_now_private: number;
	pages_swapped_out: number;
	pages_dirtied: number;
	ref_count: number;
	shadow_depth: number;
	external_pager: number;
	share_mode: number;
	is_submap: number;
	behavior: number;
	object_id: number;
	user_wired_count: number;
	pages_reusable: number;
}
declare var vm_region_submap_info_64: interop.StructType<vm_region_submap_info_64>;

interface vm_region_submap_short_info_64 {
	protection: number;
	max_protection: number;
	inheritance: number;
	offset: number;
	user_tag: number;
	ref_count: number;
	shadow_depth: number;
	external_pager: number;
	share_mode: number;
	is_submap: number;
	behavior: number;
	object_id: number;
	user_wired_count: number;
}
declare var vm_region_submap_short_info_64: interop.StructType<vm_region_submap_short_info_64>;

interface vm_region_top_info {
	obj_id: number;
	ref_count: number;
	private_pages_resident: number;
	shared_pages_resident: number;
	share_mode: number;
}
declare var vm_region_top_info: interop.StructType<vm_region_top_info>;

declare function vm_remap(target_task: number, target_address: interop.Pointer | interop.Reference<number>, size: number, mask: number, flags: number, src_task: number, src_address: number, copy: number, cur_protection: interop.Pointer | interop.Reference<number>, max_protection: interop.Pointer | interop.Reference<number>, inheritance: number): number;

interface vm_statistics {
	free_count: number;
	active_count: number;
	inactive_count: number;
	wire_count: number;
	zero_fill_count: number;
	reactivations: number;
	pageins: number;
	pageouts: number;
	faults: number;
	cow_faults: number;
	lookups: number;
	hits: number;
	purgeable_count: number;
	purges: number;
	speculative_count: number;
}
declare var vm_statistics: interop.StructType<vm_statistics>;

interface vm_statistics64 {
	free_count: number;
	active_count: number;
	inactive_count: number;
	wire_count: number;
	zero_fill_count: number;
	reactivations: number;
	pageins: number;
	pageouts: number;
	faults: number;
	cow_faults: number;
	lookups: number;
	hits: number;
	purges: number;
	purgeable_count: number;
	speculative_count: number;
	decompressions: number;
	compressions: number;
	swapins: number;
	swapouts: number;
	compressor_page_count: number;
	throttled_count: number;
	external_page_count: number;
	internal_page_count: number;
	total_uncompressed_pages_in_compressor: number;
}
declare var vm_statistics64: interop.StructType<vm_statistics64>;

declare function vm_wire(host_priv: number, task: number, address: number, size: number, desired_access: number): number;

declare function vm_write(target_task: number, address: number, data: number, dataCnt: number): number;

declare function voucher_mach_msg_adopt(msg: interop.Pointer | interop.Reference<mach_msg_header_t>): interop.Pointer | interop.Reference<any>;

declare function voucher_mach_msg_clear(msg: interop.Pointer | interop.Reference<mach_msg_header_t>): void;

declare function voucher_mach_msg_revert(state: interop.Pointer | interop.Reference<any>): void;

declare function voucher_mach_msg_set(msg: interop.Pointer | interop.Reference<mach_msg_header_t>): number;

declare function wait(p1: interop.Pointer | interop.Reference<number>): number;

declare function wait3(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: interop.Pointer | interop.Reference<rusage>): number;

declare function wait4(p1: number, p2: interop.Pointer | interop.Reference<number>, p3: number, p4: interop.Pointer | interop.Reference<rusage>): number;

declare function waitpid(p1: number, p2: interop.Pointer | interop.Reference<number>, p3: number): number;

declare function wcstoimax(__nptr: interop.Pointer | interop.Reference<number>, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, __base: number): number;

declare function wcstombs(p1: string, p2: interop.Pointer | interop.Reference<number>, p3: number): number;

declare function wcstoumax(__nptr: interop.Pointer | interop.Reference<number>, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, __base: number): number;

declare function wctomb(p1: string, p2: number): number;

interface wide {
	lo: number;
	hi: number;
}
declare var wide: interop.StructType<wide>;

declare function write(__fd: number, __buf: interop.Pointer | interop.Reference<any>, __nbyte: number): number;

declare function y0(p1: number): number;

declare function y1(p1: number): number;

declare function yn(p1: number, p2: number): number;

interface zone_info_t {
	zi_count: number;
	zi_cur_size: number;
	zi_max_size: number;
	zi_elem_size: number;
	zi_alloc_size: number;
	zi_pageable: number;
	zi_sleepable: number;
	zi_exhaustible: number;
	zi_collectable: number;
}
declare var zone_info_t: interop.StructType<zone_info_t>;

interface zone_name_t {
	zn_name: interop.Reference<number>;
}
declare var zone_name_t: interop.StructType<zone_name_t>;

declare function zopen(p1: string, p2: string, p3: number): interop.Pointer | interop.Reference<FILE>;
