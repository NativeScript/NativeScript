
declare const enum ACTION {

	FIND = 0,

	ENTER = 1
}

interface DBM {
	__opaque: interop.Reference<number>;
}
declare var DBM: interop.StructType<DBM>;

interface DIR {
	__dd_fd: number;
	__dd_loc: number;
	__dd_size: number;
	__dd_buf: string;
	__dd_len: number;
	__dd_seek: number;
	__padding: number;
	__dd_flags: number;
	__dd_lock: _opaque_pthread_mutex_t;
	__dd_td: interop.Pointer | interop.Reference<any>;
}
declare var DIR: interop.StructType<DIR>;

interface Dl_info {
	dli_fname: string;
	dli_fbase: interop.Pointer | interop.Reference<any>;
	dli_sname: string;
	dli_saddr: interop.Pointer | interop.Reference<any>;
}
declare var Dl_info: interop.StructType<Dl_info>;

interface ENTRY {
	key: string;
	data: interop.Pointer | interop.Reference<any>;
}
declare var ENTRY: interop.StructType<ENTRY>;

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

interface FTW {
	base: number;
	level: number;
}
declare var FTW: interop.StructType<FTW>;

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

declare function OSAtomicCompareAndSwap32(__oldValue: number, __newValue: number, __theValue: interop.Pointer | interop.Reference<number>): boolean;

declare function OSAtomicCompareAndSwap32Barrier(__oldValue: number, __newValue: number, __theValue: interop.Pointer | interop.Reference<number>): boolean;

declare function OSAtomicCompareAndSwap64(__oldValue: number, __newValue: number, __theValue: interop.Pointer | interop.Reference<number>): boolean;

declare function OSAtomicCompareAndSwap64Barrier(__oldValue: number, __newValue: number, __theValue: interop.Pointer | interop.Reference<number>): boolean;

declare function OSAtomicCompareAndSwapInt(__oldValue: number, __newValue: number, __theValue: interop.Pointer | interop.Reference<number>): boolean;

declare function OSAtomicCompareAndSwapIntBarrier(__oldValue: number, __newValue: number, __theValue: interop.Pointer | interop.Reference<number>): boolean;

declare function OSAtomicCompareAndSwapLong(__oldValue: number, __newValue: number, __theValue: interop.Pointer | interop.Reference<number>): boolean;

declare function OSAtomicCompareAndSwapLongBarrier(__oldValue: number, __newValue: number, __theValue: interop.Pointer | interop.Reference<number>): boolean;

declare function OSAtomicCompareAndSwapPtr(__oldValue: interop.Pointer | interop.Reference<any>, __newValue: interop.Pointer | interop.Reference<any>, __theValue: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

declare function OSAtomicCompareAndSwapPtrBarrier(__oldValue: interop.Pointer | interop.Reference<any>, __newValue: interop.Pointer | interop.Reference<any>, __theValue: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

declare function OSAtomicDecrement32(__theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicDecrement32Barrier(__theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicDecrement64(__theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicDecrement64Barrier(__theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicDequeue(__list: interop.Pointer | interop.Reference<OSQueueHead>, __offset: number): interop.Pointer | interop.Reference<any>;

declare function OSAtomicEnqueue(__list: interop.Pointer | interop.Reference<OSQueueHead>, __new: interop.Pointer | interop.Reference<any>, __offset: number): void;

declare function OSAtomicIncrement32(__theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicIncrement32Barrier(__theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicIncrement64(__theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicIncrement64Barrier(__theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicOr32(__theMask: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicOr32Barrier(__theMask: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicOr32Orig(__theMask: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicOr32OrigBarrier(__theMask: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicTestAndClear(__n: number, __theAddress: interop.Pointer | interop.Reference<any>): boolean;

declare function OSAtomicTestAndClearBarrier(__n: number, __theAddress: interop.Pointer | interop.Reference<any>): boolean;

declare function OSAtomicTestAndSet(__n: number, __theAddress: interop.Pointer | interop.Reference<any>): boolean;

declare function OSAtomicTestAndSetBarrier(__n: number, __theAddress: interop.Pointer | interop.Reference<any>): boolean;

declare function OSAtomicXor32(__theMask: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicXor32Barrier(__theMask: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicXor32Orig(__theMask: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare function OSAtomicXor32OrigBarrier(__theMask: number, __theValue: interop.Pointer | interop.Reference<number>): number;

declare const OSBigEndian: number;

interface OSFifoQueueHead {
	opaque1: interop.Pointer | interop.Reference<any>;
	opaque2: interop.Pointer | interop.Reference<any>;
	opaque3: number;
}
declare var OSFifoQueueHead: interop.StructType<OSFifoQueueHead>;

declare const OSLittleEndian: number;

declare function OSMemoryBarrier(): void;

interface OSQueueHead {
	opaque1: interop.Pointer | interop.Reference<any>;
	opaque2: number;
}
declare var OSQueueHead: interop.StructType<OSQueueHead>;

declare function OSSpinLockLock(__lock: interop.Pointer | interop.Reference<number>): void;

declare function OSSpinLockTry(__lock: interop.Pointer | interop.Reference<number>): boolean;

declare function OSSpinLockUnlock(__lock: interop.Pointer | interop.Reference<number>): void;

declare const OSUnknownByteOrder: number;

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

declare const enum VISIT {

	preorder = 0,

	postorder = 1,

	endorder = 2,

	leaf = 3
}

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

declare var _FE_DFL_DISABLE_SSE_DENORMS_ENV: fenv_t;

declare var _FE_DFL_ENV: fenv_t;

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

interface __Reply__clock_alarm_reply_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__clock_alarm_reply_t: interop.StructType<__Reply__clock_alarm_reply_t>;

interface __Reply__clock_alarm_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__clock_alarm_t: interop.StructType<__Reply__clock_alarm_t>;

interface __Reply__clock_get_attributes_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	clock_attrCnt: number;
	clock_attr: interop.Reference<number>;
}
declare var __Reply__clock_get_attributes_t: interop.StructType<__Reply__clock_get_attributes_t>;

interface __Reply__clock_get_time_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	cur_time: mach_timespec;
}
declare var __Reply__clock_get_time_t: interop.StructType<__Reply__clock_get_time_t>;

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

interface __Reply__exception_raise_state_identity_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	flavor: number;
	new_stateCnt: number;
	new_state: interop.Reference<number>;
}
declare var __Reply__exception_raise_state_identity_t: interop.StructType<__Reply__exception_raise_state_identity_t>;

interface __Reply__exception_raise_state_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	flavor: number;
	new_stateCnt: number;
	new_state: interop.Reference<number>;
}
declare var __Reply__exception_raise_state_t: interop.StructType<__Reply__exception_raise_state_t>;

interface __Reply__exception_raise_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__exception_raise_t: interop.StructType<__Reply__exception_raise_t>;

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

interface __Reply__mach_port_guard_with_flags_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__mach_port_guard_with_flags_t: interop.StructType<__Reply__mach_port_guard_with_flags_t>;

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

interface __Reply__mach_port_swap_guard_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__mach_port_swap_guard_t: interop.StructType<__Reply__mach_port_swap_guard_t>;

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

interface __Reply__mach_zone_info_for_zone_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	info: mach_zone_info_t;
}
declare var __Reply__mach_zone_info_for_zone_t: interop.StructType<__Reply__mach_zone_info_for_zone_t>;

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

interface __Reply__task_get_exc_guard_behavior_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	behavior: number;
}
declare var __Reply__task_get_exc_guard_behavior_t: interop.StructType<__Reply__task_get_exc_guard_behavior_t>;

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

interface __Reply__task_inspect_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
	info_outCnt: number;
	info_out: interop.Reference<number>;
}
declare var __Reply__task_inspect_t: interop.StructType<__Reply__task_inspect_t>;

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

interface __Reply__task_set_exc_guard_behavior_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__task_set_exc_guard_behavior_t: interop.StructType<__Reply__task_set_exc_guard_behavior_t>;

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

interface __Reply__vm_map_exec_lockdown_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	RetCode: number;
}
declare var __Reply__vm_map_exec_lockdown_t: interop.StructType<__Reply__vm_map_exec_lockdown_t>;

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

interface __Request__clock_alarm_reply_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	alarm_code: number;
	alarm_type: number;
	alarm_time: mach_timespec;
}
declare var __Request__clock_alarm_reply_t: interop.StructType<__Request__clock_alarm_reply_t>;

interface __Request__clock_alarm_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	alarm_port: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	alarm_type: number;
	alarm_time: mach_timespec;
}
declare var __Request__clock_alarm_t: interop.StructType<__Request__clock_alarm_t>;

interface __Request__clock_get_attributes_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	clock_attrCnt: number;
}
declare var __Request__clock_get_attributes_t: interop.StructType<__Request__clock_get_attributes_t>;

interface __Request__clock_get_time_t {
	Head: mach_msg_header_t;
}
declare var __Request__clock_get_time_t: interop.StructType<__Request__clock_get_time_t>;

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
	new_time: mach_timespec;
}
declare var __Request__clock_set_time_t: interop.StructType<__Request__clock_set_time_t>;

interface __Request__etap_trace_thread_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	trace_status: number;
}
declare var __Request__etap_trace_thread_t: interop.StructType<__Request__etap_trace_thread_t>;

interface __Request__exception_raise_state_identity_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	thread: mach_msg_port_descriptor_t;
	task: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	exception: number;
	codeCnt: number;
	code: interop.Reference<number>;
	flavor: number;
	old_stateCnt: number;
	old_state: interop.Reference<number>;
}
declare var __Request__exception_raise_state_identity_t: interop.StructType<__Request__exception_raise_state_identity_t>;

interface __Request__exception_raise_state_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	exception: number;
	codeCnt: number;
	code: interop.Reference<number>;
	flavor: number;
	old_stateCnt: number;
	old_state: interop.Reference<number>;
}
declare var __Request__exception_raise_state_t: interop.StructType<__Request__exception_raise_state_t>;

interface __Request__exception_raise_t {
	Head: mach_msg_header_t;
	msgh_body: mach_msg_body_t;
	thread: mach_msg_port_descriptor_t;
	task: mach_msg_port_descriptor_t;
	NDR: NDR_record_t;
	exception: number;
	codeCnt: number;
	code: interop.Reference<number>;
}
declare var __Request__exception_raise_t: interop.StructType<__Request__exception_raise_t>;

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

interface __Request__mach_port_guard_with_flags_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
	guard: number;
	flags: number;
}
declare var __Request__mach_port_guard_with_flags_t: interop.StructType<__Request__mach_port_guard_with_flags_t>;

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

interface __Request__mach_port_swap_guard_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: number;
	old_guard: number;
	new_guard: number;
}
declare var __Request__mach_port_swap_guard_t: interop.StructType<__Request__mach_port_swap_guard_t>;

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

interface __Request__mach_zone_info_for_zone_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	name: mach_zone_name_t;
}
declare var __Request__mach_zone_info_for_zone_t: interop.StructType<__Request__mach_zone_info_for_zone_t>;

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

interface __Request__task_get_exc_guard_behavior_t {
	Head: mach_msg_header_t;
}
declare var __Request__task_get_exc_guard_behavior_t: interop.StructType<__Request__task_get_exc_guard_behavior_t>;

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

interface __Request__task_inspect_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	flavor: number;
	info_outCnt: number;
}
declare var __Request__task_inspect_t: interop.StructType<__Request__task_inspect_t>;

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

interface __Request__task_set_exc_guard_behavior_t {
	Head: mach_msg_header_t;
	NDR: NDR_record_t;
	behavior: number;
}
declare var __Request__task_set_exc_guard_behavior_t: interop.StructType<__Request__task_set_exc_guard_behavior_t>;

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

interface __Request__vm_map_exec_lockdown_t {
	Head: mach_msg_header_t;
}
declare var __Request__vm_map_exec_lockdown_t: interop.StructType<__Request__vm_map_exec_lockdown_t>;

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

declare function ___mb_cur_max(): number;

declare function ___mb_cur_max_l(p1: interop.Pointer | interop.Reference<any>): number;

declare function ___runetype(p1: number): number;

declare function ___runetype_l(p1: number, p2: interop.Pointer | interop.Reference<any>): number;

declare function ___tolower(p1: number): number;

declare function ___tolower_l(p1: number, p2: interop.Pointer | interop.Reference<any>): number;

declare function ___toupper(p1: number): number;

declare function ___toupper_l(p1: number, p2: interop.Pointer | interop.Reference<any>): number;

declare function __cospi(p1: number): number;

declare function __cospif(p1: number): number;

interface __darwin_pthread_handler_rec {
	__routine: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	__arg: interop.Pointer | interop.Reference<any>;
	__next: interop.Pointer | interop.Reference<__darwin_pthread_handler_rec>;
}
declare var __darwin_pthread_handler_rec: interop.StructType<__darwin_pthread_handler_rec>;

interface __darwin_sigaltstack {
	ss_sp: interop.Pointer | interop.Reference<any>;
	ss_size: number;
	ss_flags: number;
}
declare var __darwin_sigaltstack: interop.StructType<__darwin_sigaltstack>;

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

declare function __maskrune_l(p1: number, p2: number, p3: interop.Pointer | interop.Reference<any>): number;

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

interface __msqid_ds_new {
	msg_perm: ipc_perm;
	msg_first: number;
	msg_last: number;
	msg_cbytes: number;
	msg_qnum: number;
	msg_qbytes: number;
	msg_lspid: number;
	msg_lrpid: number;
	msg_stime: number;
	msg_pad1: number;
	msg_rtime: number;
	msg_pad2: number;
	msg_ctime: number;
	msg_pad3: number;
	msg_pad4: interop.Reference<number>;
}
declare var __msqid_ds_new: interop.StructType<__msqid_ds_new>;

interface __nl_cat_d {
	__data: interop.Pointer | interop.Reference<any>;
	__size: number;
}
declare var __nl_cat_d: interop.StructType<__nl_cat_d>;

declare function __opendir2(p1: string | interop.Pointer | interop.Reference<any>, p2: number): interop.Pointer | interop.Reference<DIR>;

interface __sbuf {
	_base: string;
	_size: number;
}
declare var __sbuf: interop.StructType<__sbuf>;

interface __semid_ds_new {
	sem_perm: ipc_perm;
	sem_base: number;
	sem_nsems: number;
	sem_otime: number;
	sem_pad1: number;
	sem_ctime: number;
	sem_pad2: number;
	sem_pad3: interop.Reference<number>;
}
declare var __semid_ds_new: interop.StructType<__semid_ds_new>;

interface __shmid_ds_new {
	shm_perm: ipc_perm;
	shm_segsz: number;
	shm_lpid: number;
	shm_cpid: number;
	shm_nattch: number;
	shm_atime: number;
	shm_dtime: number;
	shm_ctime: number;
	shm_internal: interop.Pointer | interop.Reference<any>;
}
declare var __shmid_ds_new: interop.StructType<__shmid_ds_new>;

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

declare function _kernelrpc_mach_port_get_attributes_trap(target: number, name: number, flavor: number, port_info_out: interop.Pointer | interop.Reference<number>, port_info_outCnt: interop.Pointer | interop.Reference<number>): number;

declare function _kernelrpc_mach_port_guard_trap(target: number, name: number, guard: number, strict: number): number;

declare function _kernelrpc_mach_port_insert_member_trap(target: number, name: number, pset: number): number;

declare function _kernelrpc_mach_port_insert_right_trap(target: number, name: number, poly: number, polyPoly: number): number;

declare function _kernelrpc_mach_port_mod_refs_trap(target: number, name: number, right: number, delta: number): number;

declare function _kernelrpc_mach_port_move_member_trap(target: number, member: number, after: number): number;

declare function _kernelrpc_mach_port_request_notification_trap(task: number, name: number, msgid: number, sync: number, notify: number, notifyPoly: number, previous: interop.Pointer | interop.Reference<number>): number;

declare function _kernelrpc_mach_port_type_trap(task: number, name: number, ptype: interop.Pointer | interop.Reference<number>): number;

declare function _kernelrpc_mach_port_unguard_trap(target: number, name: number, guard: number): number;

declare function _kernelrpc_mach_vm_allocate_trap(target: number, addr: interop.Pointer | interop.Reference<number>, size: number, flags: number): number;

declare function _kernelrpc_mach_vm_deallocate_trap(target: number, address: number, size: number): number;

declare function _kernelrpc_mach_vm_map_trap(target: number, address: interop.Pointer | interop.Reference<number>, size: number, mask: number, flags: number, cur_protection: number): number;

declare function _kernelrpc_mach_vm_protect_trap(target: number, address: number, size: number, set_maximum: number, new_protection: number): number;

declare function _kernelrpc_mach_vm_purgable_control_trap(target: number, address: number, control: number, state: interop.Pointer | interop.Reference<number>): number;

declare var _libiconv_version: number;

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

interface _pcred {
	pc_lock: interop.Reference<number>;
	pc_ucred: interop.Pointer | interop.Reference<any>;
	p_ruid: number;
	p_svuid: number;
	p_rgid: number;
	p_svgid: number;
	p_refcnt: number;
}
declare var _pcred: interop.StructType<_pcred>;

declare function _pthread_mutex_enable_legacy_mode(): void;

declare function _setjmp(p1: interop.Reference<number>): number;

interface _ucred {
	cr_ref: number;
	cr_uid: number;
	cr_ngroups: number;
	cr_groups: interop.Reference<number>;
}
declare var _ucred: interop.StructType<_ucred>;

declare function a64l(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function abort(): void;

declare function abs(p1: number): number;

declare function accept(p1: number, p2: interop.Pointer | interop.Reference<sockaddr>, p3: interop.Pointer | interop.Reference<number>): number;

declare function access(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

interface accessx_descriptor {
	ad_name_offset: number;
	ad_flags: number;
	ad_pad: interop.Reference<number>;
}
declare var accessx_descriptor: interop.StructType<accessx_descriptor>;

declare function accessx_np(p1: interop.Pointer | interop.Reference<accessx_descriptor>, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: number): number;

declare function acct(p1: string | interop.Pointer | interop.Reference<any>): number;

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

declare function acl_delete_def_file(path_p: string | interop.Pointer | interop.Reference<any>): number;

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

declare function acl_from_text(buf_p: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function acl_get_entry(acl: interop.Pointer | interop.Reference<any>, entry_id: number, entry_p: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function acl_get_fd(fd: number): interop.Pointer | interop.Reference<any>;

declare function acl_get_fd_np(fd: number, type: acl_type_t): interop.Pointer | interop.Reference<any>;

declare function acl_get_file(path_p: string | interop.Pointer | interop.Reference<any>, type: acl_type_t): interop.Pointer | interop.Reference<any>;

declare function acl_get_flag_np(flagset_d: interop.Pointer | interop.Reference<any>, flag: acl_flag_t): number;

declare function acl_get_flagset_np(obj_p: interop.Pointer | interop.Reference<any>, flagset_p: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function acl_get_link_np(path_p: string | interop.Pointer | interop.Reference<any>, type: acl_type_t): interop.Pointer | interop.Reference<any>;

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

declare function acl_set_file(path_p: string | interop.Pointer | interop.Reference<any>, type: acl_type_t, acl: interop.Pointer | interop.Reference<any>): number;

declare function acl_set_flagset_np(obj_p: interop.Pointer | interop.Reference<any>, flagset_d: interop.Pointer | interop.Reference<any>): number;

declare function acl_set_link_np(path_p: string | interop.Pointer | interop.Reference<any>, type: acl_type_t, acl: interop.Pointer | interop.Reference<any>): number;

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

declare function acl_valid_file_np(path: string | interop.Pointer | interop.Reference<any>, type: acl_type_t, acl: interop.Pointer | interop.Reference<any>): number;

declare function acl_valid_link_np(path: string | interop.Pointer | interop.Reference<any>, type: acl_type_t, acl: interop.Pointer | interop.Reference<any>): number;

declare function acos(p1: number): number;

declare function acosf(p1: number): number;

declare function acosh(p1: number): number;

declare function acoshf(p1: number): number;

declare function acoshl(p1: number): number;

declare function acosl(p1: number): number;

declare function act_get_state(target_act: number, flavor: number, old_state: interop.Pointer | interop.Reference<number>, old_stateCnt: interop.Pointer | interop.Reference<number>): number;

declare function act_set_state(target_act: number, flavor: number, new_state: interop.Pointer | interop.Reference<number>, new_stateCnt: number): number;

declare function add_profil(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: number): number;

declare function addr2ascii(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: string | interop.Pointer | interop.Reference<any>): string;

interface addrinfo {
	ai_flags: number;
	ai_family: number;
	ai_socktype: number;
	ai_protocol: number;
	ai_addrlen: number;
	ai_canonname: string;
	ai_addr: interop.Pointer | interop.Reference<sockaddr>;
	ai_next: interop.Pointer | interop.Reference<addrinfo>;
}
declare var addrinfo: interop.StructType<addrinfo>;

declare function adjtime(p1: interop.Pointer | interop.Reference<timeval>, p2: interop.Pointer | interop.Reference<timeval>): number;

declare function alarm(p1: number): number;

declare function alloca(p1: number): interop.Pointer | interop.Reference<any>;

declare const alphaStage: number;

declare function alphasort(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<dirent>>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<dirent>>): number;

declare function arc4random(): number;

declare function arc4random_addrandom(p1: string | interop.Pointer | interop.Reference<any>, p2: number): void;

declare function arc4random_buf(__buf: interop.Pointer | interop.Reference<any>, __nbytes: number): void;

declare function arc4random_stir(): void;

declare function arc4random_uniform(__upper_bound: number): number;

declare function ascii2addr(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>): number;

declare function asctime(p1: interop.Pointer | interop.Reference<tm>): string;

declare function asctime_r(p1: interop.Pointer | interop.Reference<tm>, p2: string | interop.Pointer | interop.Reference<any>): string;

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

declare function atof(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function atof_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>): number;

declare function atoi(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function atoi_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>): number;

declare function atol(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function atol_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>): number;

declare function atoll(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function atoll_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>): number;

declare function atomic_signal_fence(p1: memory_order): void;

declare function atomic_thread_fence(p1: memory_order): void;

interface attribute_set_t {
	commonattr: number;
	volattr: number;
	dirattr: number;
	fileattr: number;
	forkattr: number;
}
declare var attribute_set_t: interop.StructType<attribute_set_t>;

interface attrlist {
	bitmapcount: number;
	reserved: number;
	commonattr: number;
	volattr: number;
	dirattr: number;
	fileattr: number;
	forkattr: number;
}
declare var attrlist: interop.StructType<attrlist>;

interface attrreference_t {
	attr_dataoffset: number;
	attr_length: number;
}
declare var attrreference_t: interop.StructType<attrreference_t>;

interface au_evclass_map {
	ec_number: number;
	ec_class: number;
}
declare var au_evclass_map: interop.StructType<au_evclass_map>;

interface au_expire_after {
	age: number;
	size: number;
	op_type: number;
}
declare var au_expire_after: interop.StructType<au_expire_after>;

interface au_mask {
	am_success: number;
	am_failure: number;
}
declare var au_mask: interop.StructType<au_mask>;

interface au_qctrl {
	aq_hiwater: number;
	aq_lowater: number;
	aq_bufsz: number;
	aq_delay: number;
	aq_minfree: number;
}
declare var au_qctrl: interop.StructType<au_qctrl>;

interface au_session {
	as_aia_p: interop.Pointer | interop.Reference<auditinfo_addr>;
	as_mask: au_mask;
}
declare var au_session: interop.StructType<au_session>;

interface au_tid {
	port: number;
	machine: number;
}
declare var au_tid: interop.StructType<au_tid>;

interface au_tid_addr {
	at_port: number;
	at_type: number;
	at_addr: interop.Reference<number>;
}
declare var au_tid_addr: interop.StructType<au_tid_addr>;

declare function audit(p1: interop.Pointer | interop.Reference<any>, p2: number): number;

interface audit_fstat {
	af_filesz: number;
	af_currsz: number;
}
declare var audit_fstat: interop.StructType<audit_fstat>;

declare function audit_session_join(port: number): number;

declare function audit_session_port(asid: number, portname: interop.Pointer | interop.Reference<number>): number;

declare function audit_session_self(): number;

interface audit_stat {
	as_version: number;
	as_numevent: number;
	as_generated: number;
	as_nonattrib: number;
	as_kernel: number;
	as_audit: number;
	as_auditctl: number;
	as_enqueue: number;
	as_written: number;
	as_wblocked: number;
	as_rblocked: number;
	as_dropped: number;
	as_totalsize: number;
	as_memused: number;
}
declare var audit_stat: interop.StructType<audit_stat>;

interface audit_token_t {
	val: interop.Reference<number>;
}
declare var audit_token_t: interop.StructType<audit_token_t>;

declare function auditctl(p1: string | interop.Pointer | interop.Reference<any>): number;

interface auditinfo {
	ai_auid: number;
	ai_mask: au_mask;
	ai_termid: au_tid;
	ai_asid: number;
}
declare var auditinfo: interop.StructType<auditinfo>;

interface auditinfo_addr {
	ai_auid: number;
	ai_mask: au_mask;
	ai_termid: au_tid_addr;
	ai_asid: number;
	ai_flags: number;
}
declare var auditinfo_addr: interop.StructType<auditinfo_addr>;

declare function auditon(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number): number;

interface auditpinfo {
	ap_pid: number;
	ap_auid: number;
	ap_mask: au_mask;
	ap_termid: au_tid;
	ap_asid: number;
}
declare var auditpinfo: interop.StructType<auditpinfo>;

interface auditpinfo_addr {
	ap_pid: number;
	ap_auid: number;
	ap_mask: au_mask;
	ap_termid: au_tid_addr;
	ap_asid: number;
	ap_flags: number;
}
declare var auditpinfo_addr: interop.StructType<auditpinfo_addr>;

declare var averunnable: loadavg;

declare function basename(p1: string | interop.Pointer | interop.Reference<any>): string;

declare function basename_r(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): string;

declare function bcmp(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number): number;

declare function bcopy(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number): void;

declare const betaStage: number;

declare function bind(p1: number, p2: interop.Pointer | interop.Reference<sockaddr>, p3: number): number;

declare function bindresvport(p1: number, p2: interop.Pointer | interop.Reference<sockaddr_in>): number;

declare function bindresvport_sa(p1: number, p2: interop.Pointer | interop.Reference<sockaddr>): number;

declare const bold: number;

declare var bootstrap_port: number;

declare function brk(p1: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function bsd_signal(p1: number, p2: interop.FunctionReference<(p1: number) => void>): interop.FunctionReference<(p1: number) => void>;

declare function bsearch(__key: interop.Pointer | interop.Reference<any>, __base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): interop.Pointer | interop.Reference<any>;

declare function bsearch_b(__key: interop.Pointer | interop.Reference<any>, __base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number): interop.Pointer | interop.Reference<any>;

declare function btowc(p1: number): number;

declare function btowc_l(p1: number, p2: interop.Pointer | interop.Reference<any>): number;

declare function bzero(p1: interop.Pointer | interop.Reference<any>, p2: number): void;

declare function calloc(__count: number, __size: number): interop.Pointer | interop.Reference<any>;

declare function catclose(p1: interop.Pointer | interop.Reference<__nl_cat_d>): number;

declare function catgets(p1: interop.Pointer | interop.Reference<__nl_cat_d>, p2: number, p3: number, p4: string | interop.Pointer | interop.Reference<any>): string;

declare function catopen(p1: string | interop.Pointer | interop.Reference<any>, p2: number): interop.Pointer | interop.Reference<__nl_cat_d>;

declare function cbrt(p1: number): number;

declare function cbrtf(p1: number): number;

declare function cbrtl(p1: number): number;

declare function ceil(p1: number): number;

declare function ceilf(p1: number): number;

declare function ceill(p1: number): number;

declare function cfgetispeed(p1: interop.Pointer | interop.Reference<termios>): number;

declare function cfgetospeed(p1: interop.Pointer | interop.Reference<termios>): number;

declare function cfmakeraw(p1: interop.Pointer | interop.Reference<termios>): void;

declare function cfsetispeed(p1: interop.Pointer | interop.Reference<termios>, p2: number): number;

declare function cfsetospeed(p1: interop.Pointer | interop.Reference<termios>, p2: number): number;

declare function cfsetspeed(p1: interop.Pointer | interop.Reference<termios>, p2: number): number;

declare function cgetcap(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): string;

declare function cgetclose(): number;

declare function cgetent(p1: interop.Pointer | interop.Reference<string>, p2: interop.Pointer | interop.Reference<string>, p3: string | interop.Pointer | interop.Reference<any>): number;

declare function cgetfirst(p1: interop.Pointer | interop.Reference<string>, p2: interop.Pointer | interop.Reference<string>): number;

declare function cgetmatch(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): number;

declare function cgetnext(p1: interop.Pointer | interop.Reference<string>, p2: interop.Pointer | interop.Reference<string>): number;

declare function cgetnum(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<number>): number;

declare function cgetset(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function cgetstr(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<string>): number;

declare function cgetustr(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<string>): number;

declare function chdir(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function chflags(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function chmod(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function chmodx_np(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>): number;

declare function chown(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: number): number;

declare function chroot(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function clearerr(p1: interop.Pointer | interop.Reference<FILE>): void;

declare function clock(): number;

declare function clock_alarm(clock_serv: number, alarm_type: number, alarm_time: mach_timespec, alarm_port: number): number;

declare function clock_alarm_reply(alarm_port: number, alarm_portPoly: number, alarm_code: number, alarm_type: number, alarm_time: mach_timespec): number;

declare function clock_get_attributes(clock_serv: number, flavor: number, clock_attr: interop.Pointer | interop.Reference<number>, clock_attrCnt: interop.Pointer | interop.Reference<number>): number;

declare function clock_get_res(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function clock_get_time(clock_serv: number, cur_time: interop.Pointer | interop.Reference<mach_timespec>): number;

declare function clock_getres(__clock_id: clockid_t, __res: interop.Pointer | interop.Reference<timespec>): number;

declare function clock_gettime(__clock_id: clockid_t, __tp: interop.Pointer | interop.Reference<timespec>): number;

declare function clock_gettime_nsec_np(__clock_id: clockid_t): number;

declare function clock_set_attributes(clock_ctrl: number, flavor: number, clock_attr: interop.Pointer | interop.Reference<number>, clock_attrCnt: number): number;

declare function clock_set_res(p1: number, p2: number): number;

declare function clock_set_time(clock_ctrl: number, new_time: mach_timespec): number;

declare function clock_sleep(p1: number, p2: number, p3: mach_timespec, p4: interop.Pointer | interop.Reference<mach_timespec>): number;

declare function clock_sleep_trap(clock_name: number, sleep_type: number, sleep_sec: number, sleep_nsec: number, wakeup_time: interop.Pointer | interop.Reference<mach_timespec>): number;

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

interface clockinfo {
	hz: number;
	tick: number;
	tickadj: number;
	stathz: number;
	profhz: number;
}
declare var clockinfo: interop.StructType<clockinfo>;

declare function clonefile(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function clonefileat(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: string | interop.Pointer | interop.Reference<any>, p5: number): number;

declare function close(p1: number): number;

declare function closedir(p1: interop.Pointer | interop.Reference<DIR>): number;

declare function closelog(): void;

interface cmsghdr {
	cmsg_len: number;
	cmsg_level: number;
	cmsg_type: number;
}
declare var cmsghdr: interop.StructType<cmsghdr>;

declare const condense: number;

declare function confstr(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function connect(p1: number, p2: interop.Pointer | interop.Reference<sockaddr>, p3: number): number;

declare function connectx(p1: number, p2: interop.Pointer | interop.Reference<sa_endpoints_t>, p3: number, p4: number, p5: interop.Pointer | interop.Reference<iovec>, p6: number, p7: interop.Pointer | interop.Reference<number>, p8: interop.Pointer | interop.Reference<number>): number;

declare function copyfile(from: string | interop.Pointer | interop.Reference<any>, to: string | interop.Pointer | interop.Reference<any>, state: interop.Pointer | interop.Reference<any>, flags: number): number;

declare function copyfile_state_alloc(): interop.Pointer | interop.Reference<any>;

declare function copyfile_state_free(p1: interop.Pointer | interop.Reference<any>): number;

declare function copyfile_state_get(s: interop.Pointer | interop.Reference<any>, flag: number, dst: interop.Pointer | interop.Reference<any>): number;

declare function copyfile_state_set(s: interop.Pointer | interop.Reference<any>, flag: number, src: interop.Pointer | interop.Reference<any>): number;

declare function copysign(p1: number, p2: number): number;

declare function copysignf(p1: number, p2: number): number;

declare function copysignl(p1: number, p2: number): number;

declare function cos(p1: number): number;

declare function cosf(p1: number): number;

declare function cosh(p1: number): number;

declare function coshf(p1: number): number;

declare function coshl(p1: number): number;

declare function cosl(p1: number): number;

declare function creat(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function crypt(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): string;

declare function ctermid(p1: string | interop.Pointer | interop.Reference<any>): string;

declare function ctermid_r(p1: string | interop.Pointer | interop.Reference<any>): string;

declare function ctime(p1: interop.Pointer | interop.Reference<number>): string;

declare function ctime_r(p1: interop.Pointer | interop.Reference<number>, p2: string | interop.Pointer | interop.Reference<any>): string;

interface ctlname {
	ctl_name: string;
	ctl_type: number;
}
declare var ctlname: interop.StructType<ctlname>;

declare function daemon(p1: number, p2: number): number;

interface datum {
	dptr: interop.Pointer | interop.Reference<any>;
	dsize: number;
}
declare var datum: interop.StructType<datum>;

declare var daylight: number;

declare function dbm_clearerr(p1: interop.Pointer | interop.Reference<DBM>): number;

declare function dbm_close(p1: interop.Pointer | interop.Reference<DBM>): void;

declare function dbm_delete(p1: interop.Pointer | interop.Reference<DBM>, p2: datum): number;

declare function dbm_dirfno(p1: interop.Pointer | interop.Reference<DBM>): number;

declare function dbm_error(p1: interop.Pointer | interop.Reference<DBM>): number;

declare function dbm_fetch(p1: interop.Pointer | interop.Reference<DBM>, p2: datum): datum;

declare function dbm_firstkey(p1: interop.Pointer | interop.Reference<DBM>): datum;

declare function dbm_forder(p1: interop.Pointer | interop.Reference<DBM>, p2: datum): number;

declare function dbm_nextkey(p1: interop.Pointer | interop.Reference<DBM>): datum;

declare function dbm_open(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: number): interop.Pointer | interop.Reference<DBM>;

declare function dbm_store(p1: interop.Pointer | interop.Reference<DBM>, p2: datum, p3: datum, p4: number): number;

declare function debug_control_port_for_pid(target_tport: number, pid: number, t: interop.Pointer | interop.Reference<number>): number;

declare const developStage: number;

declare function devname(p1: number, p2: number): string;

declare function devname_r(p1: number, p2: number, buf: string | interop.Pointer | interop.Reference<any>, len: number): string;

declare function difftime(p1: number, p2: number): number;

interface dirent {
	d_ino: number;
	d_seekoff: number;
	d_reclen: number;
	d_namlen: number;
	d_type: number;
	d_name: interop.Reference<number>;
}
declare var dirent: interop.StructType<dirent>;

declare function dirfd(dirp: interop.Pointer | interop.Reference<DIR>): number;

declare function dirname(p1: string | interop.Pointer | interop.Reference<any>): string;

declare function dirname_r(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): string;

declare function disconnectx(p1: number, p2: number, p3: number): number;

interface diskextent {
	startblock: number;
	blockcount: number;
}
declare var diskextent: interop.StructType<diskextent>;

declare function div(p1: number, p2: number): div_t;

interface div_t {
	quot: number;
	rem: number;
}
declare var div_t: interop.StructType<div_t>;

declare function dladdr(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<Dl_info>): number;

declare function dlclose(__handle: interop.Pointer | interop.Reference<any>): number;

declare function dlerror(): string;

declare function dlopen(__path: string | interop.Pointer | interop.Reference<any>, __mode: number): interop.Pointer | interop.Reference<any>;

declare function dlopen_preflight(__path: string | interop.Pointer | interop.Reference<any>): boolean;

declare function dlsym(__handle: interop.Pointer | interop.Reference<any>, __symbol: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

interface dqblk {
	dqb_bhardlimit: number;
	dqb_bsoftlimit: number;
	dqb_curbytes: number;
	dqb_ihardlimit: number;
	dqb_isoftlimit: number;
	dqb_curinodes: number;
	dqb_btime: number;
	dqb_itime: number;
	dqb_id: number;
	dqb_spare: interop.Reference<number>;
}
declare var dqblk: interop.StructType<dqblk>;

interface dqfilehdr {
	dqh_magic: number;
	dqh_version: number;
	dqh_maxentries: number;
	dqh_entrycnt: number;
	dqh_flags: number;
	dqh_chktime: number;
	dqh_btime: number;
	dqh_itime: number;
	dqh_string: interop.Reference<number>;
	dqh_spare: interop.Reference<number>;
}
declare var dqfilehdr: interop.StructType<dqfilehdr>;

declare function dqhashshift(p1: number): number;

declare function drand48(): number;

declare function dup(p1: number): number;

declare function dup2(p1: number, p2: number): number;

declare const eNoteExitReparentedDeprecated: number;

declare const eNoteReapDeprecated: number;

declare function ecvt(p1: number, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>): string;

declare function encrypt(p1: string | interop.Pointer | interop.Reference<any>, p2: number): void;

declare function endgrent(): void;

declare function endhostent(): void;

declare function endnetent(): void;

declare function endnetgrent(): void;

declare function endprotoent(): void;

declare function endpwent(): void;

declare function endrpcent(): void;

declare function endservent(): void;

declare function endusershell(): void;

declare function endutxent(): void;

declare function endutxent_wtmp(): void;

interface eproc {
	e_paddr: interop.Pointer | interop.Reference<any>;
	e_sess: interop.Pointer | interop.Reference<any>;
	e_pcred: _pcred;
	e_ucred: _ucred;
	e_vm: vmspace;
	e_ppid: number;
	e_pgid: number;
	e_jobc: number;
	e_tdev: number;
	e_tpgid: number;
	e_tsess: interop.Pointer | interop.Reference<any>;
	e_wmesg: interop.Reference<number>;
	e_xsize: number;
	e_xrssize: number;
	e_xccount: number;
	e_xswrss: number;
	e_flag: number;
	e_login: interop.Reference<number>;
	e_spare: interop.Reference<number>;
}
declare var eproc: interop.StructType<eproc>;

declare function erand48(p1: interop.Reference<number>): number;

declare function erf(p1: number): number;

declare function erfc(p1: number): number;

declare function erfcf(p1: number): number;

declare function erfcl(p1: number): number;

declare function erff(p1: number): number;

declare function erfl(p1: number): number;

declare function err_set_exit(p1: interop.FunctionReference<(p1: number) => void>): void;

declare function err_set_exit_b(p1: (p1: number) => void): void;

declare function err_set_file(p1: interop.Pointer | interop.Reference<any>): void;

declare function etap_trace_thread(target_act: number, trace_status: number): number;

interface exception {
	type: number;
	name: string;
	arg1: number;
	arg2: number;
	retval: number;
}
declare var exception: interop.StructType<exception>;

declare function exception_raise(exception_port: number, thread: number, task: number, exception: number, code: interop.Pointer | interop.Reference<number>, codeCnt: number): number;

declare function exception_raise_state(exception_port: number, exception: number, code: interop.Pointer | interop.Reference<number>, codeCnt: number, flavor: interop.Pointer | interop.Reference<number>, old_state: interop.Pointer | interop.Reference<number>, old_stateCnt: number, new_state: interop.Pointer | interop.Reference<number>, new_stateCnt: interop.Pointer | interop.Reference<number>): number;

declare function exception_raise_state_identity(exception_port: number, thread: number, task: number, exception: number, code: interop.Pointer | interop.Reference<number>, codeCnt: number, flavor: interop.Pointer | interop.Reference<number>, old_state: interop.Pointer | interop.Reference<number>, old_stateCnt: number, new_state: interop.Pointer | interop.Reference<number>, new_stateCnt: interop.Pointer | interop.Reference<number>): number;

declare function exchangedata(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function execv(__path: string | interop.Pointer | interop.Reference<any>, __argv: interop.Pointer | interop.Reference<string>): number;

declare function execvP(__file: string | interop.Pointer | interop.Reference<any>, __searchpath: string | interop.Pointer | interop.Reference<any>, __argv: interop.Pointer | interop.Reference<string>): number;

declare function execve(__file: string | interop.Pointer | interop.Reference<any>, __argv: interop.Pointer | interop.Reference<string>, __envp: interop.Pointer | interop.Reference<string>): number;

declare function execvp(__file: string | interop.Pointer | interop.Reference<any>, __argv: interop.Pointer | interop.Reference<string>): number;

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

declare const extend: number;

declare function fabs(p1: number): number;

declare function fabsf(p1: number): number;

declare function fabsl(p1: number): number;

declare function faccessat(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: number): number;

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

declare function fchflags(p1: number, p2: number): number;

declare function fchmod(p1: number, p2: number): number;

declare function fchmodat(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: number): number;

declare function fchmodx_np(p1: number, p2: interop.Pointer | interop.Reference<any>): number;

declare function fchown(p1: number, p2: number, p3: number): number;

declare function fchownat(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: number, p5: number): number;

declare function fclonefileat(p1: number, p2: number, p3: string | interop.Pointer | interop.Reference<any>, p4: number): number;

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

declare function fcopyfile(from_fd: number, to_fd: number, p3: interop.Pointer | interop.Reference<any>, flags: number): number;

declare function fcvt(p1: number, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>): string;

interface fd_set {
	fds_bits: interop.Reference<number>;
}
declare var fd_set: interop.StructType<fd_set>;

declare function fdim(p1: number, p2: number): number;

declare function fdimf(p1: number, p2: number): number;

declare function fdiml(p1: number, p2: number): number;

declare function fdopen(p1: number, p2: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<FILE>;

declare function fdopendir(p1: number): interop.Pointer | interop.Reference<DIR>;

declare function feclearexcept(p1: number): number;

declare function fegetenv(p1: interop.Pointer | interop.Reference<fenv_t>): number;

declare function fegetexceptflag(p1: interop.Pointer | interop.Reference<number>, p2: number): number;

declare function fegetround(): number;

declare function feholdexcept(p1: interop.Pointer | interop.Reference<fenv_t>): number;

interface fenv_t {
	__control: number;
	__status: number;
	__mxcsr: number;
	__reserved: interop.Reference<number>;
}
declare var fenv_t: interop.StructType<fenv_t>;

declare function feof(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function feraiseexcept(p1: number): number;

declare function ferror(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function fesetenv(p1: interop.Pointer | interop.Reference<fenv_t>): number;

declare function fesetexceptflag(p1: interop.Pointer | interop.Reference<number>, p2: number): number;

declare function fesetround(p1: number): number;

declare function fetestexcept(p1: number): number;

declare function feupdateenv(p1: interop.Pointer | interop.Reference<fenv_t>): number;

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

declare function fgets(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<FILE>): string;

declare function fgetwc(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function fgetwc_l(p1: interop.Pointer | interop.Reference<FILE>, p2: interop.Pointer | interop.Reference<any>): number;

declare function fgetwln(p1: interop.Pointer | interop.Reference<FILE>, p2: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function fgetwln_l(p1: interop.Pointer | interop.Reference<FILE>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<number>;

declare function fgetws(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: interop.Pointer | interop.Reference<FILE>): interop.Pointer | interop.Reference<number>;

declare function fgetws_l(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: interop.Pointer | interop.Reference<FILE>, p4: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<number>;

declare function fgetxattr(fd: number, name: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>, size: number, position: number, options: number): number;

interface fhandle {
	fh_len: number;
	fh_data: interop.Reference<number>;
}
declare var fhandle: interop.StructType<fhandle>;

declare function fhopen(p1: interop.Pointer | interop.Reference<fhandle>, p2: number): number;

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

declare const finalStage: number;

declare function flistxattr(fd: number, namebuff: string | interop.Pointer | interop.Reference<any>, size: number, options: number): number;

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

declare function fmemopen(__buf: interop.Pointer | interop.Reference<any>, __size: number, __mode: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<FILE>;

declare function fmin(p1: number, p2: number): number;

declare function fminf(p1: number, p2: number): number;

declare function fminl(p1: number, p2: number): number;

declare function fmod(p1: number, p2: number): number;

declare function fmodf(p1: number, p2: number): number;

declare function fmodl(p1: number, p2: number): number;

declare function fmount(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function fmtcheck(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): string;

declare function fmtmsg(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: string | interop.Pointer | interop.Reference<any>, p5: string | interop.Pointer | interop.Reference<any>, p6: string | interop.Pointer | interop.Reference<any>): number;

declare function fnmatch(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function fopen(__filename: string | interop.Pointer | interop.Reference<any>, __mode: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<FILE>;

declare function fork(): number;

declare function forkpty(p1: interop.Pointer | interop.Reference<number>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<termios>, p4: interop.Pointer | interop.Reference<winsize>): number;

declare function fparseln(p1: interop.Pointer | interop.Reference<FILE>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>, p4: interop.Reference<number>, p5: number): string;

declare function fpathconf(p1: number, p2: number): number;

interface fpunchhole_t {
	fp_flags: number;
	reserved: number;
	fp_offset: number;
	fp_length: number;
}
declare var fpunchhole_t: interop.StructType<fpunchhole_t>;

declare function fpurge(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function fputc(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function fputs(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function fputwc(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function fputwc_l(p1: number, p2: interop.Pointer | interop.Reference<FILE>, p3: interop.Pointer | interop.Reference<any>): number;

declare function fputws(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function fputws_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<FILE>, p3: interop.Pointer | interop.Reference<any>): number;

declare function fread(__ptr: interop.Pointer | interop.Reference<any>, __size: number, __nitems: number, __stream: interop.Pointer | interop.Reference<FILE>): number;

declare function free(p1: interop.Pointer | interop.Reference<any>): void;

declare function freeaddrinfo(p1: interop.Pointer | interop.Reference<addrinfo>): void;

declare function freehostent(p1: interop.Pointer | interop.Reference<hostent>): void;

declare function freeifaddrs(p1: interop.Pointer | interop.Reference<ifaddrs>): void;

declare function freeifmaddrs(p1: interop.Pointer | interop.Reference<ifmaddrs>): void;

declare function fremovexattr(fd: number, name: string | interop.Pointer | interop.Reference<any>, options: number): number;

declare function freopen(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<FILE>): interop.Pointer | interop.Reference<FILE>;

declare function frexp(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function frexpf(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function frexpl(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function fsctl(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<any>, p4: number): number;

declare function fseek(p1: interop.Pointer | interop.Reference<FILE>, p2: number, p3: number): number;

declare function fseeko(__stream: interop.Pointer | interop.Reference<FILE>, __offset: number, __whence: number): number;

declare function fsetattrlist(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: number): number;

declare function fsetpos(p1: interop.Pointer | interop.Reference<FILE>, p2: interop.Pointer | interop.Reference<number>): number;

declare function fsetxattr(fd: number, name: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>, size: number, position: number, options: number): number;

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

interface fspecread_t {
	fsr_flags: number;
	reserved: number;
	fsr_offset: number;
	fsr_length: number;
}
declare var fspecread_t: interop.StructType<fspecread_t>;

interface fssearchblock {
	returnattrs: interop.Pointer | interop.Reference<attrlist>;
	returnbuffer: interop.Pointer | interop.Reference<any>;
	returnbuffersize: number;
	maxmatches: number;
	timelimit: timeval;
	searchparams1: interop.Pointer | interop.Reference<any>;
	sizeofsearchparams1: number;
	searchparams2: interop.Pointer | interop.Reference<any>;
	sizeofsearchparams2: number;
	searchattrs: attrlist;
}
declare var fssearchblock: interop.StructType<fssearchblock>;

declare function fstat(p1: number, p2: interop.Pointer | interop.Reference<statStruct>): number;

declare function fstatat(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<statStruct>, p4: number): number;

declare function fstatfs(p1: number, p2: interop.Pointer | interop.Reference<statfsStruct>): number;

declare function fstatvfs(p1: number, p2: interop.Pointer | interop.Reference<statvfsStruct>): number;

declare function fstatx_np(p1: number, p2: interop.Pointer | interop.Reference<statStruct>, p3: interop.Pointer | interop.Reference<any>): number;

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

declare function ftime(p1: interop.Pointer | interop.Reference<timeb>): number;

declare function ftok(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

interface ftrimactivefile_t {
	fta_offset: number;
	fta_length: number;
}
declare var ftrimactivefile_t: interop.StructType<ftrimactivefile_t>;

declare function ftruncate(p1: number, p2: number): number;

declare function ftrylockfile(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function ftw(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<statStruct>, p3: number) => number>, p3: number): number;

declare function funlockfile(p1: interop.Pointer | interop.Reference<FILE>): void;

declare function funopen(p1: interop.Pointer | interop.Reference<any>, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number) => number>, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>): interop.Pointer | interop.Reference<FILE>;

declare function futimens(__fd: number, __times: interop.Reference<timespec>): number;

declare function futimes(p1: number, p2: interop.Pointer | interop.Reference<timeval>): number;

declare function fwide(p1: interop.Pointer | interop.Reference<FILE>, p2: number): number;

declare function fwrite(__ptr: interop.Pointer | interop.Reference<any>, __size: number, __nitems: number, __stream: interop.Pointer | interop.Reference<FILE>): number;

declare function gai_strerror(p1: number): string;

declare function gcvt(p1: number, p2: number, p3: string | interop.Pointer | interop.Reference<any>): string;

declare function getaddrinfo(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<addrinfo>, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<addrinfo>>): number;

declare function getattrlist(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: number): number;

declare function getattrlistat(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<any>, p5: number, p6: number): number;

declare function getattrlistbulk(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: number): number;

declare function getaudit(p1: interop.Pointer | interop.Reference<auditinfo>): number;

declare function getaudit_addr(p1: interop.Pointer | interop.Reference<auditinfo_addr>, p2: number): number;

declare function getauid(p1: interop.Pointer | interop.Reference<number>): number;

declare function getbsize(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): string;

declare function getc(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function getc_unlocked(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function getchar(): number;

declare function getchar_unlocked(): number;

declare function getcwd(p1: string | interop.Pointer | interop.Reference<any>, p2: number): string;

declare function getdate(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<tm>;

declare var getdate_err: number;

declare function getdelim(__linep: interop.Pointer | interop.Reference<string>, __linecapp: interop.Pointer | interop.Reference<number>, __delimiter: number, __stream: interop.Pointer | interop.Reference<FILE>): number;

declare function getdirentries(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<number>): number;

declare function getdirentriesattr(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: interop.Pointer | interop.Reference<number>, p6: interop.Pointer | interop.Reference<number>, p7: interop.Pointer | interop.Reference<number>, p8: number): number;

declare function getdomainname(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function getdtablesize(): number;

declare function getegid(): number;

declare function getenv(p1: string | interop.Pointer | interop.Reference<any>): string;

declare function geteuid(): number;

declare function getfh(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<fhandle>): number;

declare function getfsstat(p1: interop.Pointer | interop.Reference<statfsStruct>, p2: number, p3: number): number;

declare function getgid(): number;

declare function getgrent(): interop.Pointer | interop.Reference<group>;

declare function getgrgid(p1: number): interop.Pointer | interop.Reference<group>;

declare function getgrgid_r(p1: number, p2: interop.Pointer | interop.Reference<group>, p3: string | interop.Pointer | interop.Reference<any>, p4: number, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<group>>): number;

declare function getgrnam(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<group>;

declare function getgrnam_r(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<group>, p3: string | interop.Pointer | interop.Reference<any>, p4: number, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<group>>): number;

declare function getgrouplist(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>): number;

declare function getgroups(p1: number, p2: interop.Reference<number>): number;

declare function getgruuid(p1: interop.Reference<number>): interop.Pointer | interop.Reference<group>;

declare function getgruuid_r(p1: interop.Reference<number>, p2: interop.Pointer | interop.Reference<group>, p3: string | interop.Pointer | interop.Reference<any>, p4: number, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<group>>): number;

declare function gethostbyaddr(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number): interop.Pointer | interop.Reference<hostent>;

declare function gethostbyname(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<hostent>;

declare function gethostbyname2(p1: string | interop.Pointer | interop.Reference<any>, p2: number): interop.Pointer | interop.Reference<hostent>;

declare function gethostent(): interop.Pointer | interop.Reference<hostent>;

declare function gethostid(): number;

declare function gethostname(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function getifaddrs(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<ifaddrs>>): number;

declare function getifmaddrs(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<ifmaddrs>>): number;

declare function getiopolicy_np(p1: number, p2: number): number;

declare function getipnodebyaddr(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<hostent>;

declare function getipnodebyname(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<hostent>;

declare function getipv4sourcefilter(p1: number, p2: in_addr, p3: in_addr, p4: interop.Pointer | interop.Reference<number>, p5: interop.Pointer | interop.Reference<number>, p6: interop.Pointer | interop.Reference<in_addr>): number;

declare function getitimer(p1: number, p2: interop.Pointer | interop.Reference<itimerval>): number;

declare function getlastlogx(p1: number, p2: interop.Pointer | interop.Reference<lastlogx>): interop.Pointer | interop.Reference<lastlogx>;

declare function getlastlogxbyname(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<lastlogx>): interop.Pointer | interop.Reference<lastlogx>;

declare function getline(__linep: interop.Pointer | interop.Reference<string>, __linecapp: interop.Pointer | interop.Reference<number>, __stream: interop.Pointer | interop.Reference<FILE>): number;

declare function getloadavg(p1: interop.Reference<number>, p2: number): number;

declare function getlogin(): string;

declare function getlogin_r(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function getmntinfo(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<statfsStruct>>, p2: number): number;

declare function getmntinfo_r_np(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<statfsStruct>>, p2: number): number;

declare function getmode(p1: interop.Pointer | interop.Reference<any>, p2: number): number;

declare function getnameinfo(p1: interop.Pointer | interop.Reference<sockaddr>, p2: number, p3: string | interop.Pointer | interop.Reference<any>, p4: number, p5: string | interop.Pointer | interop.Reference<any>, p6: number, p7: number): number;

declare function getnetbyaddr(p1: number, p2: number): interop.Pointer | interop.Reference<netent>;

declare function getnetbyname(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<netent>;

declare function getnetent(): interop.Pointer | interop.Reference<netent>;

declare function getnetgrent(p1: interop.Pointer | interop.Reference<string>, p2: interop.Pointer | interop.Reference<string>, p3: interop.Pointer | interop.Reference<string>): number;

declare function getopt(p1: number, p2: interop.Reference<string>, p3: string | interop.Pointer | interop.Reference<any>): number;

declare function getoptFunction(p1: number, p2: interop.Reference<string>, p3: string | interop.Pointer | interop.Reference<any>): number;

declare function getopt_long(p1: number, p2: interop.Pointer | interop.Reference<string>, p3: string | interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<option>, p5: interop.Pointer | interop.Reference<number>): number;

declare function getopt_long_only(p1: number, p2: interop.Pointer | interop.Reference<string>, p3: string | interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<option>, p5: interop.Pointer | interop.Reference<number>): number;

declare function getpagesize(): number;

declare function getpass(p1: string | interop.Pointer | interop.Reference<any>): string;

declare function getpeereid(p1: number, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>): number;

declare function getpeername(p1: number, p2: interop.Pointer | interop.Reference<sockaddr>, p3: interop.Pointer | interop.Reference<number>): number;

declare function getpgid(p1: number): number;

declare function getpgrp(): number;

declare function getpid(): number;

declare function getppid(): number;

declare function getpriority(p1: number, p2: number): number;

declare function getprogname(): string;

declare function getprotobyname(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<protoent>;

declare function getprotobynumber(p1: number): interop.Pointer | interop.Reference<protoent>;

declare function getprotoent(): interop.Pointer | interop.Reference<protoent>;

declare function getpwent(): interop.Pointer | interop.Reference<passwd>;

declare function getpwnam(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<passwd>;

declare function getpwnam_r(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<passwd>, p3: string | interop.Pointer | interop.Reference<any>, p4: number, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<passwd>>): number;

declare function getpwuid(p1: number): interop.Pointer | interop.Reference<passwd>;

declare function getpwuid_r(p1: number, p2: interop.Pointer | interop.Reference<passwd>, p3: string | interop.Pointer | interop.Reference<any>, p4: number, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<passwd>>): number;

declare function getpwuuid(p1: interop.Reference<number>): interop.Pointer | interop.Reference<passwd>;

declare function getpwuuid_r(p1: interop.Reference<number>, p2: interop.Pointer | interop.Reference<passwd>, p3: string | interop.Pointer | interop.Reference<any>, p4: number, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<passwd>>): number;

declare function getrlimit(p1: number, p2: interop.Pointer | interop.Reference<rlimit>): number;

declare function getrpcbyname(name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<rpcent>;

declare function getrpcbynumber(number: number): interop.Pointer | interop.Reference<rpcent>;

declare function getrpcent(): interop.Pointer | interop.Reference<rpcent>;

declare function getrusage(p1: number, p2: interop.Pointer | interop.Reference<rusage>): number;

declare function gets(p1: string | interop.Pointer | interop.Reference<any>): string;

declare function getservbyname(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<servent>;

declare function getservbyport(p1: number, p2: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<servent>;

declare function getservent(): interop.Pointer | interop.Reference<servent>;

declare function getsgroups_np(p1: interop.Pointer | interop.Reference<number>, p2: interop.Reference<number>): number;

declare function getsid(p1: number): number;

declare function getsockname(p1: number, p2: interop.Pointer | interop.Reference<sockaddr>, p3: interop.Pointer | interop.Reference<number>): number;

declare function getsockopt(p1: number, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>, p5: interop.Pointer | interop.Reference<number>): number;

declare function getsourcefilter(p1: number, p2: number, p3: interop.Pointer | interop.Reference<sockaddr>, p4: number, p5: interop.Pointer | interop.Reference<number>, p6: interop.Pointer | interop.Reference<number>, p7: interop.Pointer | interop.Reference<sockaddr_storage>): number;

declare function getsubopt(p1: interop.Pointer | interop.Reference<string>, p2: interop.Pointer | interop.Reference<string>, p3: interop.Pointer | interop.Reference<string>): number;

declare function getsuboptFunction(p1: interop.Pointer | interop.Reference<string>, p2: interop.Pointer | interop.Reference<string>, p3: interop.Pointer | interop.Reference<string>): number;

declare function gettimeofday(p1: interop.Pointer | interop.Reference<timeval>, p2: interop.Pointer | interop.Reference<any>): number;

declare function getuid(): number;

declare function getusershell(): string;

declare function getutxent(): interop.Pointer | interop.Reference<utmpx>;

declare function getutxent_wtmp(): interop.Pointer | interop.Reference<utmpx>;

declare function getutxid(p1: interop.Pointer | interop.Reference<utmpx>): interop.Pointer | interop.Reference<utmpx>;

declare function getutxline(p1: interop.Pointer | interop.Reference<utmpx>): interop.Pointer | interop.Reference<utmpx>;

declare function getvfsbyname(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<vfsconf>): number;

declare function getw(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function getwc(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function getwc_l(p1: interop.Pointer | interop.Reference<FILE>, p2: interop.Pointer | interop.Reference<any>): number;

declare function getwchar(): number;

declare function getwchar_l(p1: interop.Pointer | interop.Reference<any>): number;

declare function getwd(p1: string | interop.Pointer | interop.Reference<any>): string;

declare function getwgroups_np(p1: interop.Pointer | interop.Reference<number>, p2: interop.Reference<number>): number;

declare function getxattr(path: string | interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>, size: number, position: number, options: number): number;

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

interface group {
	gr_name: string;
	gr_passwd: string;
	gr_gid: number;
	gr_mem: interop.Pointer | interop.Reference<string>;
}
declare var group: interop.StructType<group>;

declare function group_from_gid(p1: number, p2: number): string;

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

declare var h_errno: number;

interface hash_info_bucket_t {
	hib_count: number;
}
declare var hash_info_bucket_t: interop.StructType<hash_info_bucket_t>;

declare function hcreate(p1: number): number;

declare function hdestroy(): void;

declare function heapsort(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): number;

declare function heapsort_b(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number): number;

declare function herror(p1: string | interop.Pointer | interop.Reference<any>): void;

interface host_basic_info {
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
declare var host_basic_info: interop.StructType<host_basic_info>;

interface host_can_has_debugger_info {
	can_has_debugger: number;
}
declare var host_can_has_debugger_info: interop.StructType<host_can_has_debugger_info>;

declare function host_check_multiuser_mode(host: number, multiuser_mode: interop.Pointer | interop.Reference<number>): number;

interface host_cpu_load_info {
	cpu_ticks: interop.Reference<number>;
}
declare var host_cpu_load_info: interop.StructType<host_cpu_load_info>;

declare function host_create_mach_voucher(host: number, recipes: string | interop.Pointer | interop.Reference<any>, recipesCnt: number, voucher: interop.Pointer | interop.Reference<number>): number;

declare function host_create_mach_voucher_trap(host: number, recipes: string | interop.Pointer | interop.Reference<any>, recipes_size: number, voucher: interop.Pointer | interop.Reference<number>): number;

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

interface host_load_info {
	avenrun: interop.Reference<number>;
	mach_factor: interop.Reference<number>;
}
declare var host_load_info: interop.StructType<host_load_info>;

declare function host_lockgroup_info(host: number, lockgroup_info: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<lockgroup_info_t>>, lockgroup_infoCnt: interop.Pointer | interop.Reference<number>): number;

declare function host_page_size(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

interface host_preferred_user_arch {
	cpu_type: number;
	cpu_subtype: number;
}
declare var host_preferred_user_arch: interop.StructType<host_preferred_user_arch>;

interface host_priority_info {
	kernel_priority: number;
	system_priority: number;
	server_priority: number;
	user_priority: number;
	depress_priority: number;
	idle_priority: number;
	minimum_priority: number;
	maximum_priority: number;
}
declare var host_priority_info: interop.StructType<host_priority_info>;

declare function host_priv_statistics(host_priv: number, flavor: number, host_info_out: interop.Pointer | interop.Reference<number>, host_info_outCnt: interop.Pointer | interop.Reference<number>): number;

declare function host_processor_info(host: number, flavor: number, out_processor_count: interop.Pointer | interop.Reference<number>, out_processor_info: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, out_processor_infoCnt: interop.Pointer | interop.Reference<number>): number;

declare function host_processor_set_priv(host_priv: number, set_name: number, set: interop.Pointer | interop.Reference<number>): number;

declare function host_processor_sets(host_priv: number, processor_sets: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, processor_setsCnt: interop.Pointer | interop.Reference<number>): number;

declare function host_processors(host_priv: number, out_processor_list: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, out_processor_listCnt: interop.Pointer | interop.Reference<number>): number;

declare function host_reboot(host_priv: number, options: number): number;

declare function host_register_mach_voucher_attr_manager(host: number, attr_manager: number, default_value: number, new_key: interop.Pointer | interop.Reference<number>, new_attr_control: interop.Pointer | interop.Reference<number>): number;

declare function host_register_well_known_mach_voucher_attr_manager(host: number, attr_manager: number, default_value: number, key: number, new_attr_control: interop.Pointer | interop.Reference<number>): number;

declare function host_request_notification(host: number, notify_type: number, notify_port: number): number;

interface host_sched_info {
	min_timeout: number;
	min_quantum: number;
}
declare var host_sched_info: interop.StructType<host_sched_info>;

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

interface hostent {
	h_name: string;
	h_aliases: interop.Pointer | interop.Reference<string>;
	h_addrtype: number;
	h_length: number;
	h_addr_list: interop.Pointer | interop.Reference<string>;
}
declare var hostent: interop.StructType<hostent>;

declare function hsearch(p1: ENTRY, p2: ACTION): interop.Pointer | interop.Reference<ENTRY>;

declare function hstrerror(p1: number): string;

declare function hypot(p1: number, p2: number): number;

declare function hypotf(p1: number, p2: number): number;

declare function hypotl(p1: number, p2: number): number;

declare function iconv(__cd: interop.Pointer | interop.Reference<any>, __inbuf: interop.Pointer | interop.Reference<string>, __inbytesleft: interop.Pointer | interop.Reference<number>, __outbuf: interop.Pointer | interop.Reference<string>, __outbytesleft: interop.Pointer | interop.Reference<number>): number;

declare function iconv_canonicalize(name: string | interop.Pointer | interop.Reference<any>): string;

declare function iconv_close(_cd: interop.Pointer | interop.Reference<any>): number;

interface iconv_fallbacks {
	mb_to_uc_fallback: interop.FunctionReference<(p1: string, p2: number, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: interop.Pointer | interop.Reference<any>) => void>, p4: interop.Pointer | interop.Reference<any>, p5: interop.Pointer | interop.Reference<any>) => void>;
	uc_to_mb_fallback: interop.FunctionReference<(p1: number, p2: interop.FunctionReference<(p1: string, p2: number, p3: interop.Pointer | interop.Reference<any>) => void>, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<any>) => void>;
	mb_to_wc_fallback: interop.FunctionReference<(p1: string, p2: number, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: interop.Pointer | interop.Reference<any>) => void>, p4: interop.Pointer | interop.Reference<any>, p5: interop.Pointer | interop.Reference<any>) => void>;
	wc_to_mb_fallback: interop.FunctionReference<(p1: number, p2: interop.FunctionReference<(p1: string, p2: number, p3: interop.Pointer | interop.Reference<any>) => void>, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<any>) => void>;
	data: interop.Pointer | interop.Reference<any>;
}
declare var iconv_fallbacks: interop.StructType<iconv_fallbacks>;

interface iconv_hooks {
	uc_hook: interop.FunctionReference<(p1: number, p2: interop.Pointer | interop.Reference<any>) => void>;
	wc_hook: interop.FunctionReference<(p1: number, p2: interop.Pointer | interop.Reference<any>) => void>;
	data: interop.Pointer | interop.Reference<any>;
}
declare var iconv_hooks: interop.StructType<iconv_hooks>;

declare function iconv_open(__tocode: string | interop.Pointer | interop.Reference<any>, __fromcode: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function iconvctl(cd: interop.Pointer | interop.Reference<any>, request: number, argument: interop.Pointer | interop.Reference<any>): number;

declare function iconvlist(do_one: interop.FunctionReference<(p1: number, p2: interop.Pointer | interop.Reference<string>, p3: interop.Pointer | interop.Reference<any>) => number>, data: interop.Pointer | interop.Reference<any>): void;

declare const enum idtype_t {

	P_ALL = 0,

	P_PID = 1,

	P_PGID = 2
}

interface if_clonereq {
	ifcr_total: number;
	ifcr_count: number;
	ifcr_buffer: string;
}
declare var if_clonereq: interop.StructType<if_clonereq>;

interface if_data {
	ifi_type: number;
	ifi_typelen: number;
	ifi_physical: number;
	ifi_addrlen: number;
	ifi_hdrlen: number;
	ifi_recvquota: number;
	ifi_xmitquota: number;
	ifi_unused1: number;
	ifi_mtu: number;
	ifi_metric: number;
	ifi_baudrate: number;
	ifi_ipackets: number;
	ifi_ierrors: number;
	ifi_opackets: number;
	ifi_oerrors: number;
	ifi_collisions: number;
	ifi_ibytes: number;
	ifi_obytes: number;
	ifi_imcasts: number;
	ifi_omcasts: number;
	ifi_iqdrops: number;
	ifi_noproto: number;
	ifi_recvtiming: number;
	ifi_xmittiming: number;
	ifi_lastchange: timeval32;
	ifi_unused2: number;
	ifi_hwassist: number;
	ifi_reserved1: number;
	ifi_reserved2: number;
}
declare var if_data: interop.StructType<if_data>;

interface if_data64 {
	ifi_type: number;
	ifi_typelen: number;
	ifi_physical: number;
	ifi_addrlen: number;
	ifi_hdrlen: number;
	ifi_recvquota: number;
	ifi_xmitquota: number;
	ifi_unused1: number;
	ifi_mtu: number;
	ifi_metric: number;
	ifi_baudrate: number;
	ifi_ipackets: number;
	ifi_ierrors: number;
	ifi_opackets: number;
	ifi_oerrors: number;
	ifi_collisions: number;
	ifi_ibytes: number;
	ifi_obytes: number;
	ifi_imcasts: number;
	ifi_omcasts: number;
	ifi_iqdrops: number;
	ifi_noproto: number;
	ifi_recvtiming: number;
	ifi_xmittiming: number;
	ifi_lastchange: timeval32;
}
declare var if_data64: interop.StructType<if_data64>;

declare function if_freenameindex(p1: interop.Pointer | interop.Reference<if_nameindexStruct>): void;

declare function if_indextoname(p1: number, p2: string | interop.Pointer | interop.Reference<any>): string;

interface if_msghdr {
	ifm_msglen: number;
	ifm_version: number;
	ifm_type: number;
	ifm_addrs: number;
	ifm_flags: number;
	ifm_index: number;
	ifm_data: if_data;
}
declare var if_msghdr: interop.StructType<if_msghdr>;

interface if_msghdr2 {
	ifm_msglen: number;
	ifm_version: number;
	ifm_type: number;
	ifm_addrs: number;
	ifm_flags: number;
	ifm_index: number;
	ifm_snd_len: number;
	ifm_snd_maxlen: number;
	ifm_snd_drops: number;
	ifm_timer: number;
	ifm_data: if_data64;
}
declare var if_msghdr2: interop.StructType<if_msghdr2>;

declare function if_nameindex(): interop.Pointer | interop.Reference<if_nameindexStruct>;

interface if_nameindexStruct {
	if_index: number;
	if_name: string;
}
declare var if_nameindexStruct: interop.StructType<if_nameindexStruct>;

declare function if_nametoindex(p1: string | interop.Pointer | interop.Reference<any>): number;

interface ifa_msghdr {
	ifam_msglen: number;
	ifam_version: number;
	ifam_type: number;
	ifam_addrs: number;
	ifam_flags: number;
	ifam_index: number;
	ifam_metric: number;
}
declare var ifa_msghdr: interop.StructType<ifa_msghdr>;

interface ifaddrs {
	ifa_next: interop.Pointer | interop.Reference<ifaddrs>;
	ifa_name: string;
	ifa_flags: number;
	ifa_addr: interop.Pointer | interop.Reference<sockaddr>;
	ifa_netmask: interop.Pointer | interop.Reference<sockaddr>;
	ifa_dstaddr: interop.Pointer | interop.Reference<sockaddr>;
	ifa_data: interop.Pointer | interop.Reference<any>;
}
declare var ifaddrs: interop.StructType<ifaddrs>;

interface ifaliasreq {
	ifra_name: interop.Reference<number>;
	ifra_addr: sockaddr;
	ifra_broadaddr: sockaddr;
	ifra_mask: sockaddr;
}
declare var ifaliasreq: interop.StructType<ifaliasreq>;

interface ifdevmtu {
	ifdm_current: number;
	ifdm_min: number;
	ifdm_max: number;
}
declare var ifdevmtu: interop.StructType<ifdevmtu>;

interface ifdrv {
	ifd_name: interop.Reference<number>;
	ifd_cmd: number;
	ifd_len: number;
	ifd_data: interop.Pointer | interop.Reference<any>;
}
declare var ifdrv: interop.StructType<ifdrv>;

interface ifma_msghdr {
	ifmam_msglen: number;
	ifmam_version: number;
	ifmam_type: number;
	ifmam_addrs: number;
	ifmam_flags: number;
	ifmam_index: number;
}
declare var ifma_msghdr: interop.StructType<ifma_msghdr>;

interface ifma_msghdr2 {
	ifmam_msglen: number;
	ifmam_version: number;
	ifmam_type: number;
	ifmam_addrs: number;
	ifmam_flags: number;
	ifmam_index: number;
	ifmam_refcount: number;
}
declare var ifma_msghdr2: interop.StructType<ifma_msghdr2>;

interface ifmaddrs {
	ifma_next: interop.Pointer | interop.Reference<ifmaddrs>;
	ifma_name: interop.Pointer | interop.Reference<sockaddr>;
	ifma_addr: interop.Pointer | interop.Reference<sockaddr>;
	ifma_lladdr: interop.Pointer | interop.Reference<sockaddr>;
}
declare var ifmaddrs: interop.StructType<ifmaddrs>;

interface ifmediareq {
	ifm_name: interop.Reference<number>;
	ifm_current: number;
	ifm_mask: number;
	ifm_status: number;
	ifm_active: number;
	ifm_count: number;
	ifm_ulist: interop.Pointer | interop.Reference<number>;
}
declare var ifmediareq: interop.StructType<ifmediareq>;

interface ifqueue {
	ifq_head: interop.Pointer | interop.Reference<any>;
	ifq_tail: interop.Pointer | interop.Reference<any>;
	ifq_len: number;
	ifq_maxlen: number;
	ifq_drops: number;
}
declare var ifqueue: interop.StructType<ifqueue>;

interface ifstat {
	ifs_name: interop.Reference<number>;
	ascii: interop.Reference<number>;
}
declare var ifstat: interop.StructType<ifstat>;

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

declare function index(p1: string | interop.Pointer | interop.Reference<any>, p2: number): string;

declare function inet_addr(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function inet_aton(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<in_addr>): number;

declare function inet_lnaof(p1: in_addr): number;

declare function inet_makeaddr(p1: number, p2: number): in_addr;

declare function inet_net_ntop(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: string | interop.Pointer | interop.Reference<any>, p5: number): string;

declare function inet_net_pton(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number): number;

declare function inet_neta(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number): string;

declare function inet_netof(p1: in_addr): number;

declare function inet_network(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function inet_nsap_addr(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function inet_nsap_ntoa(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: string | interop.Pointer | interop.Reference<any>): string;

declare function inet_ntoa(p1: in_addr): string;

declare function inet_ntop(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: string | interop.Pointer | interop.Reference<any>, p4: number): string;

declare function inet_pton(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>): number;

declare function initgroups(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function initstate(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number): string;

declare function innetgr(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: string | interop.Pointer | interop.Reference<any>, p4: string | interop.Pointer | interop.Reference<any>): number;

declare function insque(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>): void;

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

interface ipc_perm {
	uid: number;
	gid: number;
	cuid: number;
	cgid: number;
	mode: number;
	_seq: number;
	_key: number;
}
declare var ipc_perm: interop.StructType<ipc_perm>;

declare function iruserok(p1: number, p2: number, p3: string | interop.Pointer | interop.Reference<any>, p4: string | interop.Pointer | interop.Reference<any>): number;

declare function iruserok_sa(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: string | interop.Pointer | interop.Reference<any>, p5: string | interop.Pointer | interop.Reference<any>): number;

declare function isatty(p1: number): number;

declare function issetugid(): number;

declare const italic: number;

interface itimerval {
	it_interval: timeval;
	it_value: timeval;
}
declare var itimerval: interop.StructType<itimerval>;

declare function j0(p1: number): number;

declare function j1(p1: number): number;

declare function jn(p1: number, p2: number): number;

declare function jrand48(p1: interop.Reference<number>): number;

declare const kNilOptions: number;

declare const kUnknownType: number;

declare const kVariableLengthArray: number;

interface kauth_cache_sizes {
	kcs_group_size: number;
	kcs_id_size: number;
}
declare var kauth_cache_sizes: interop.StructType<kauth_cache_sizes>;

declare function kdebug_signpost(code: number, arg1: number, arg2: number, arg3: number, arg4: number): number;

declare function kdebug_signpost_end(code: number, arg1: number, arg2: number, arg3: number, arg4: number): number;

declare function kdebug_signpost_start(code: number, arg1: number, arg2: number, arg3: number, arg4: number): number;

interface kernel_resource_sizes {
	task: number;
	thread: number;
	port: number;
	memory_region: number;
	memory_object: number;
}
declare var kernel_resource_sizes: interop.StructType<kernel_resource_sizes>;

interface kev_dl_proto_data {
	link_data: net_event_data;
	proto_family: number;
	proto_remaining_count: number;
}
declare var kev_dl_proto_data: interop.StructType<kev_dl_proto_data>;

declare function kevent(kq: number, changelist: interop.Pointer | interop.Reference<keventStruct>, nchanges: number, eventlist: interop.Pointer | interop.Reference<keventStruct>, nevents: number, timeout: interop.Pointer | interop.Reference<timespec>): number;

declare function kevent64(kq: number, changelist: interop.Pointer | interop.Reference<kevent64_s>, nchanges: number, eventlist: interop.Pointer | interop.Reference<kevent64_s>, nevents: number, flags: number, timeout: interop.Pointer | interop.Reference<timespec>): number;

interface kevent64_s {
	ident: number;
	filter: number;
	flags: number;
	fflags: number;
	data: number;
	udata: number;
	ext: interop.Reference<number>;
}
declare var kevent64_s: interop.StructType<kevent64_s>;

interface keventStruct {
	ident: number;
	filter: number;
	flags: number;
	fflags: number;
	data: number;
	udata: interop.Pointer | interop.Reference<any>;
}
declare var keventStruct: interop.StructType<keventStruct>;

declare function kext_request(host_priv: number, user_log_flags: number, request_data: number, request_dataCnt: number, response_data: interop.Pointer | interop.Reference<number>, response_dataCnt: interop.Pointer | interop.Reference<number>, log_data: interop.Pointer | interop.Reference<number>, log_dataCnt: interop.Pointer | interop.Reference<number>, op_result: interop.Pointer | interop.Reference<number>): number;

declare function kill(p1: number, p2: number): number;

declare function killpg(p1: number, p2: number): number;

interface klist {
	slh_first: interop.Pointer | interop.Reference<any>;
}
declare var klist: interop.StructType<klist>;

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

declare function kqueue(): number;

declare function l64a(p1: number): string;

declare function labs(p1: number): number;

interface lastlogx {
	ll_tv: timeval;
	ll_line: interop.Reference<number>;
	ll_host: interop.Reference<number>;
}
declare var lastlogx: interop.StructType<lastlogx>;

declare function lchflags(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function lchmod(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function lchown(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: number): number;

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

declare function lfind(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<number>, p4: number, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): interop.Pointer | interop.Reference<any>;

declare function lgamma(p1: number): number;

declare function lgammaf(p1: number): number;

declare function lgammal(p1: number): number;

declare function libiconv_set_relocation_prefix(orig_prefix: string | interop.Pointer | interop.Reference<any>, curr_prefix: string | interop.Pointer | interop.Reference<any>): void;

interface linger {
	l_onoff: number;
	l_linger: number;
}
declare var linger: interop.StructType<linger>;

declare function link(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): number;

declare function link_addr(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<sockaddr_dl>): void;

declare function link_ntoa(p1: interop.Pointer | interop.Reference<sockaddr_dl>): string;

declare function linkat(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: string | interop.Pointer | interop.Reference<any>, p5: number): number;

declare function listen(p1: number, p2: number): number;

declare function listxattr(path: string | interop.Pointer | interop.Reference<any>, namebuff: string | interop.Pointer | interop.Reference<any>, size: number, options: number): number;

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

interface loadavg {
	ldavg: interop.Reference<number>;
	fscale: number;
}
declare var loadavg: interop.StructType<loadavg>;

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

declare function login_tty(p1: number): number;

declare function logl(p1: number): number;

declare function logwtmp(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: string | interop.Pointer | interop.Reference<any>): void;

declare function longjmp(p1: interop.Reference<number>, p2: number): void;

declare function longjmperror(): void;

declare function lrand48(): number;

declare function lrint(p1: number): number;

declare function lrintf(p1: number): number;

declare function lrintl(p1: number): number;

declare function lround(p1: number): number;

declare function lroundf(p1: number): number;

declare function lroundl(p1: number): number;

declare function lsearch(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<number>, p4: number, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): interop.Pointer | interop.Reference<any>;

declare function lseek(p1: number, p2: number, p3: number): number;

declare function lstat(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<statStruct>): number;

declare function lstatx_np(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<statStruct>, p3: interop.Pointer | interop.Reference<any>): number;

declare function lutimes(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<timeval>): number;

declare function mach_absolute_time(): number;

declare function mach_approximate_time(): number;

declare function mach_continuous_approximate_time(): number;

declare function mach_continuous_time(): number;

interface mach_core_details {
	gzip_offset: number;
	gzip_length: number;
	core_name: interop.Reference<number>;
}
declare var mach_core_details: interop.StructType<mach_core_details>;

interface mach_core_fileheader {
	signature: number;
	log_offset: number;
	log_length: number;
	num_files: number;
	files: interop.Reference<mach_core_details>;
}
declare var mach_core_fileheader: interop.StructType<mach_core_fileheader>;

interface mach_dead_name_notification_t {
	not_header: mach_msg_header_t;
	NDR: NDR_record_t;
	not_port: number;
	trailer: mach_msg_security_trailer_t;
}
declare var mach_dead_name_notification_t: interop.StructType<mach_dead_name_notification_t>;

declare function mach_error(str: string | interop.Pointer | interop.Reference<any>, error_value: number): void;

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
	mapped: number;
	peak: number;
	tag: number;
	zone: number;
	_resvA: interop.Reference<number>;
	_resv: interop.Reference<number>;
	name: interop.Reference<number>;
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

interface mach_msg_guarded_port_descriptor32_t {
	context: number;
	name: number;
	flags: number;
	disposition: number;
	type: number;
}
declare var mach_msg_guarded_port_descriptor32_t: interop.StructType<mach_msg_guarded_port_descriptor32_t>;

interface mach_msg_guarded_port_descriptor64_t {
	context: number;
	flags: number;
	disposition: number;
	type: number;
	name: number;
}
declare var mach_msg_guarded_port_descriptor64_t: interop.StructType<mach_msg_guarded_port_descriptor64_t>;

interface mach_msg_guarded_port_descriptor_t {
	context: number;
	flags: number;
	disposition: number;
	type: number;
	name: number;
}
declare var mach_msg_guarded_port_descriptor_t: interop.StructType<mach_msg_guarded_port_descriptor_t>;

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
	deallocate: number;
	copy: number;
	pad1: number;
	type: number;
	size: number;
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
	deallocate: number;
	copy: number;
	disposition: number;
	type: number;
	count: number;
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

	kGUARD_EXC_INCORRECT_GUARD = 16,

	kGUARD_EXC_IMMOVABLE = 32,

	kGUARD_EXC_STRICT_REPLY = 64,

	kGUARD_EXC_INVALID_RIGHT = 256,

	kGUARD_EXC_INVALID_NAME = 512,

	kGUARD_EXC_INVALID_VALUE = 1024,

	kGUARD_EXC_INVALID_ARGUMENT = 2048,

	kGUARD_EXC_RIGHT_EXISTS = 4096,

	kGUARD_EXC_KERN_NO_SPACE = 8192,

	kGUARD_EXC_KERN_FAILURE = 16384,

	kGUARD_EXC_KERN_RESOURCE = 32768,

	kGUARD_EXC_SEND_INVALID_REPLY = 65536,

	kGUARD_EXC_SEND_INVALID_VOUCHER = 131072,

	kGUARD_EXC_SEND_INVALID_RIGHT = 262144,

	kGUARD_EXC_RCV_INVALID_NAME = 524288,

	kGUARD_EXC_RCV_GUARDED_DESC = 1048576
}

declare function mach_port_guard_with_flags(task: number, name: number, guard: number, flags: number): number;

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

declare function mach_port_peek(task: number, name: number, trailer_type: number, request_seqnop: interop.Pointer | interop.Reference<number>, msg_sizep: interop.Pointer | interop.Reference<number>, msg_idp: interop.Pointer | interop.Reference<number>, trailer_infop: string | interop.Pointer | interop.Reference<any>, trailer_infopCnt: interop.Pointer | interop.Reference<number>): number;

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

declare function mach_port_swap_guard(task: number, name: number, old_guard: number, new_guard: number): number;

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

interface mach_task_basic_info {
	virtual_size: number;
	resident_size: number;
	resident_size_max: number;
	user_time: time_value;
	system_time: time_value;
	policy: number;
	suspend_count: number;
}
declare var mach_task_basic_info: interop.StructType<mach_task_basic_info>;

declare var mach_task_self_: number;

declare function mach_thread_self(): number;

declare function mach_timebase_info(info: interop.Pointer | interop.Reference<mach_timebase_infoStruct>): number;

interface mach_timebase_infoStruct {
	numer: number;
	denom: number;
}
declare var mach_timebase_infoStruct: interop.StructType<mach_timebase_infoStruct>;

interface mach_timespec {
	tv_sec: number;
	tv_nsec: number;
}
declare var mach_timespec: interop.StructType<mach_timespec>;

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

declare function mach_voucher_extract_attr_recipe_trap(voucher_name: number, key: number, recipe: string | interop.Pointer | interop.Reference<any>, recipe_size: interop.Pointer | interop.Reference<number>): number;

declare function mach_wait_until(deadline: number): number;

declare function mach_zone_info(host: number, names: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<mach_zone_name_t>>, namesCnt: interop.Pointer | interop.Reference<number>, info: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<mach_zone_info_t>>, infoCnt: interop.Pointer | interop.Reference<number>): number;

declare function mach_zone_info_for_zone(host: number, name: mach_zone_name_t, info: interop.Pointer | interop.Reference<mach_zone_info_t>): number;

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

declare function madvise(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number): number;

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
	print_task: interop.FunctionReference<(p1: number, p2: number, p3: number, p4: interop.FunctionReference<(p1: number, p2: number, p3: number, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => number>, p5: interop.FunctionReference<(p1: string) => void>) => void>;
	task_statistics: interop.FunctionReference<(p1: number, p2: number, p3: interop.FunctionReference<(p1: number, p2: number, p3: number, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => number>, p4: interop.Pointer | interop.Reference<malloc_statistics_t>) => void>;
}
declare var malloc_introspection_t: interop.StructType<malloc_introspection_t>;

declare function malloc_make_nonpurgeable(ptr: interop.Pointer | interop.Reference<any>): number;

declare function malloc_make_purgeable(ptr: interop.Pointer | interop.Reference<any>): void;

declare function malloc_set_zone_name(zone: interop.Pointer | interop.Reference<malloc_zone_t>, name: string | interop.Pointer | interop.Reference<any>): void;

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
	claimed_address: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<malloc_zone_t>, p2: interop.Pointer | interop.Reference<any>) => number>;
}
declare var malloc_zone_t: interop.StructType<malloc_zone_t>;

declare function malloc_zone_unregister(zone: interop.Pointer | interop.Reference<malloc_zone_t>): void;

declare function malloc_zone_valloc(zone: interop.Pointer | interop.Reference<malloc_zone_t>, size: number): interop.Pointer | interop.Reference<any>;

declare function mblen(__s: string | interop.Pointer | interop.Reference<any>, __n: number): number;

declare function mblen_l(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<any>): number;

declare function mbstowcs(p1: interop.Pointer | interop.Reference<number>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function mbstowcs_l(p1: interop.Pointer | interop.Reference<number>, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function mbtowc(p1: interop.Pointer | interop.Reference<number>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function mbtowc_l(p1: interop.Pointer | interop.Reference<number>, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

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

declare const enum memory_order {

	relaxed = 0,

	consume = 1,

	acquire = 2,

	release = 3,

	acq_rel = 4,

	seq_cst = 5
}

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

declare function mig_strncpy(dest: string | interop.Pointer | interop.Reference<any>, src: string | interop.Pointer | interop.Reference<any>, len: number): number;

declare function mig_strncpy_zerofill(dest: string | interop.Pointer | interop.Reference<any>, src: string | interop.Pointer | interop.Reference<any>, len: number): number;

declare function mig_strncpy_zerofillFunction(dest: string | interop.Pointer | interop.Reference<any>, src: string | interop.Pointer | interop.Reference<any>, len: number): number;

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

declare function mincore(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: string | interop.Pointer | interop.Reference<any>): number;

declare function minherit(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number): number;

declare function mkdir(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function mkdirat(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function mkdirx_np(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>): number;

declare function mkdtemp(p1: string | interop.Pointer | interop.Reference<any>): string;

declare function mkdtempat_np(dfd: number, path: string | interop.Pointer | interop.Reference<any>): string;

declare function mkfifo(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function mkfifox_np(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>): number;

declare function mknod(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: number): number;

declare function mknodFunction(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: number): number;

declare function mkostemp(path: string | interop.Pointer | interop.Reference<any>, oflags: number): number;

declare function mkostemps(path: string | interop.Pointer | interop.Reference<any>, slen: number, oflags: number): number;

declare function mkostempsat_np(dfd: number, path: string | interop.Pointer | interop.Reference<any>, slen: number, oflags: number): number;

declare function mkpath_np(path: string | interop.Pointer | interop.Reference<any>, omode: number): number;

declare function mkpathat_np(dfd: number, path: string | interop.Pointer | interop.Reference<any>, omode: number): number;

declare function mkstemp(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function mkstempFunction(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function mkstemp_dprotected_np(path: string | interop.Pointer | interop.Reference<any>, dpclass: number, dpflags: number): number;

declare function mkstemps(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function mkstempsat_np(dfd: number, path: string | interop.Pointer | interop.Reference<any>, slen: number): number;

declare function mktemp(p1: string | interop.Pointer | interop.Reference<any>): string;

declare function mktempFunction(p1: string | interop.Pointer | interop.Reference<any>): string;

declare function mktime(p1: interop.Pointer | interop.Reference<tm>): number;

declare function mlock(p1: interop.Pointer | interop.Reference<any>, p2: number): number;

declare function mlockall(p1: number): number;

declare function mmap(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: number, p5: number, p6: number): interop.Pointer | interop.Reference<any>;

declare function modf(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function modff(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function modfl(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function mount(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function mprotect(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number): number;

declare function mrand48(): number;

interface msg {
	msg_next: interop.Pointer | interop.Reference<msg>;
	msg_type: number;
	msg_ts: number;
	msg_spot: number;
	label: interop.Pointer | interop.Reference<any>;
}
declare var msg: interop.StructType<msg>;

interface msg_labels_t {
	sender: number;
}
declare var msg_labels_t: interop.StructType<msg_labels_t>;

declare function msgctl(p1: number, p2: number, p3: interop.Pointer | interop.Reference<__msqid_ds_new>): number;

declare function msgget(p1: number, p2: number): number;

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

interface msginfo {
	msgmax: number;
	msgmni: number;
	msgmnb: number;
	msgtql: number;
	msgssz: number;
	msgseg: number;
}
declare var msginfo: interop.StructType<msginfo>;

declare function msgrcv(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number, p5: number): number;

declare function msgsnd(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number): number;

declare function mstats(): mstatsStruct;

interface mstatsStruct {
	bytes_total: number;
	chunks_used: number;
	bytes_used: number;
	chunks_free: number;
	bytes_free: number;
}
declare var mstatsStruct: interop.StructType<mstatsStruct>;

declare function msync(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number): number;

declare function munlock(p1: interop.Pointer | interop.Reference<any>, p2: number): number;

declare function munlockall(): number;

declare function munmap(p1: interop.Pointer | interop.Reference<any>, p2: number): number;

interface mymsg {
	mtype: number;
	mtext: interop.Reference<number>;
}
declare var mymsg: interop.StructType<mymsg>;

declare function nan(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function nanf(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function nanl(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function nanosleep(__rqtp: interop.Pointer | interop.Reference<timespec>, __rmtp: interop.Pointer | interop.Reference<timespec>): number;

declare function nearbyint(p1: number): number;

declare function nearbyintf(p1: number): number;

declare function nearbyintl(p1: number): number;

interface net_event_data {
	if_family: number;
	if_unit: number;
	if_name: interop.Reference<number>;
}
declare var net_event_data: interop.StructType<net_event_data>;

interface netent {
	n_name: string;
	n_aliases: interop.Pointer | interop.Reference<string>;
	n_addrtype: number;
	n_net: number;
}
declare var netent: interop.StructType<netent>;

interface netfs_status {
	ns_status: number;
	ns_mountopts: interop.Reference<number>;
	ns_waittime: number;
	ns_threadcount: number;
	ns_threadids: interop.Reference<number>;
}
declare var netfs_status: interop.StructType<netfs_status>;

declare function nextafter(p1: number, p2: number): number;

declare function nextafterf(p1: number, p2: number): number;

declare function nextafterl(p1: number, p2: number): number;

declare function nexttoward(p1: number, p2: number): number;

declare function nexttowardf(p1: number, p2: number): number;

declare function nexttowardl(p1: number, p2: number): number;

declare function nextwctype(p1: number, p2: number): number;

declare function nextwctype_l(p1: number, p2: number, p3: interop.Pointer | interop.Reference<any>): number;

declare function nfssvc(p1: number, p2: interop.Pointer | interop.Reference<any>): number;

declare function nftw(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<statStruct>, p3: number, p4: interop.Pointer | interop.Reference<FTW>) => number>, p3: number, p4: number): number;

declare function nice(p1: number): number;

declare function nl_langinfo(p1: number): string;

declare function nl_langinfo_l(p1: number, p2: interop.Pointer | interop.Reference<any>): string;

declare const noErr: number;

declare const normal: number;

declare function nrand48(p1: interop.Reference<number>): number;

interface ntsid_t {
	sid_kind: number;
	sid_authcount: number;
	sid_authority: interop.Reference<number>;
	sid_authorities: interop.Reference<number>;
}
declare var ntsid_t: interop.StructType<ntsid_t>;

declare function open_memstream(__bufp: interop.Pointer | interop.Reference<string>, __sizep: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<FILE>;

declare function open_wmemstream(__bufp: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, __sizep: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<FILE>;

declare function opendev(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<string>): number;

declare function opendir(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<DIR>;

declare function openlog(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: number): void;

declare function openpty(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: string | interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<termios>, p5: interop.Pointer | interop.Reference<winsize>): number;

declare function openx_np(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<any>): number;

declare var optarg: string;

declare var optargVar: string;

declare var opterr: number;

declare var opterrVar: number;

declare var optind: number;

declare var optindVar: number;

interface option {
	name: string;
	has_arg: number;
	flag: interop.Pointer | interop.Reference<number>;
	val: number;
}
declare var option: interop.StructType<option>;

declare var optopt: number;

declare var optoptVar: number;

declare var optreset: number;

declare var optresetVar: number;

interface os_unfair_lock {
	_os_unfair_lock_opaque: number;
}
declare var os_unfair_lock: interop.StructType<os_unfair_lock>;

declare function os_unfair_lock_assert_not_owner(lock: interop.Pointer | interop.Reference<os_unfair_lock>): void;

declare function os_unfair_lock_assert_owner(lock: interop.Pointer | interop.Reference<os_unfair_lock>): void;

declare function os_unfair_lock_lock(lock: interop.Pointer | interop.Reference<os_unfair_lock>): void;

declare function os_unfair_lock_trylock(lock: interop.Pointer | interop.Reference<os_unfair_lock>): boolean;

declare function os_unfair_lock_unlock(lock: interop.Pointer | interop.Reference<os_unfair_lock>): void;

interface ostat {
	st_dev: number;
	st_ino: number;
	st_mode: number;
	st_nlink: number;
	st_uid: number;
	st_gid: number;
	st_rdev: number;
	st_size: number;
	st_atimespec: timespec;
	st_mtimespec: timespec;
	st_ctimespec: timespec;
	st_blksize: number;
	st_blocks: number;
	st_flags: number;
	st_gen: number;
}
declare var ostat: interop.StructType<ostat>;

declare const outline: number;

declare function panic_init(p1: number): void;

interface passwd {
	pw_name: string;
	pw_passwd: string;
	pw_uid: number;
	pw_gid: number;
	pw_change: number;
	pw_class: string;
	pw_gecos: string;
	pw_dir: string;
	pw_shell: string;
	pw_expire: number;
}
declare var passwd: interop.StructType<passwd>;

declare function pathconf(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function pause(): number;

declare function pclose(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function perror(p1: string | interop.Pointer | interop.Reference<any>): void;

declare function pfctlinput(p1: number, p2: interop.Pointer | interop.Reference<sockaddr>): void;

declare function pid_for_task(t: number, x: interop.Pointer | interop.Reference<number>): number;

declare function pidlock(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: string | interop.Pointer | interop.Reference<any>): number;

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

declare function poll(p1: interop.Pointer | interop.Reference<pollfd>, p2: number, p3: number): number;

interface pollfd {
	fd: number;
	events: number;
	revents: number;
}
declare var pollfd: interop.StructType<pollfd>;

declare function popen(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<FILE>;

declare function port_obj_init(p1: number): void;

declare var port_obj_table: interop.Pointer | interop.Reference<port_obj_tentry>;

declare var port_obj_table_size: number;

interface port_obj_tentry {
	pos_value: interop.Pointer | interop.Reference<any>;
	pos_type: number;
}
declare var port_obj_tentry: interop.StructType<port_obj_tentry>;

declare function posix2time(p1: number): number;

declare function posix_madvise(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number): number;

declare function posix_memalign(__memptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __alignment: number, __size: number): number;

declare function posix_openpt(p1: number): number;

declare function posix_spawn(p1: interop.Pointer | interop.Reference<number>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __argv: interop.Reference<string>, __envp: interop.Reference<string>): number;

declare function posix_spawn_file_actions_addclose(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: number): number;

declare function posix_spawn_file_actions_adddup2(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: number, p3: number): number;

declare function posix_spawn_file_actions_addinherit_np(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: number): number;

declare function posix_spawn_file_actions_addopen(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: number, p3: string | interop.Pointer | interop.Reference<any>, p4: number, p5: number): number;

declare function posix_spawn_file_actions_destroy(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function posix_spawn_file_actions_init(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function posix_spawnattr_destroy(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function posix_spawnattr_get_qos_class_np(__attr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __qos_class: interop.Pointer | interop.Reference<qos_class_t>): number;

declare function posix_spawnattr_getbinpref_np(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>): number;

declare function posix_spawnattr_getflags(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: interop.Pointer | interop.Reference<number>): number;

declare function posix_spawnattr_getpgroup(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: interop.Pointer | interop.Reference<number>): number;

declare function posix_spawnattr_getsigdefault(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: interop.Pointer | interop.Reference<number>): number;

declare function posix_spawnattr_getsigmask(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: interop.Pointer | interop.Reference<number>): number;

declare function posix_spawnattr_init(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function posix_spawnattr_set_qos_class_np(__attr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __qos_class: qos_class_t): number;

declare function posix_spawnattr_setauditsessionport_np(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: number): number;

declare function posix_spawnattr_setbinpref_np(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>): number;

declare function posix_spawnattr_setexceptionports_np(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: number, p3: number, p4: number, p5: number): number;

declare function posix_spawnattr_setflags(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: number): number;

declare function posix_spawnattr_setpgroup(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: number): number;

declare function posix_spawnattr_setsigdefault(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: interop.Pointer | interop.Reference<number>): number;

declare function posix_spawnattr_setsigmask(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: interop.Pointer | interop.Reference<number>): number;

declare function posix_spawnattr_setspecialport_np(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: number, p3: number): number;

declare function posix_spawnp(p1: interop.Pointer | interop.Reference<number>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __argv: interop.Reference<string>, __envp: interop.Reference<string>): number;

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

interface processor_basic_info {
	cpu_type: number;
	cpu_subtype: number;
	running: number;
	slot_num: number;
	is_master: number;
}
declare var processor_basic_info: interop.StructType<processor_basic_info>;

declare function processor_control(processor: number, processor_cmd: interop.Pointer | interop.Reference<number>, processor_cmdCnt: number): number;

interface processor_cpu_load_info {
	cpu_ticks: interop.Reference<number>;
}
declare var processor_cpu_load_info: interop.StructType<processor_cpu_load_info>;

declare function processor_exit(processor: number): number;

declare function processor_get_assignment(processor: number, assigned_set: interop.Pointer | interop.Reference<number>): number;

declare function processor_info(processor: number, flavor: number, host: interop.Pointer | interop.Reference<number>, processor_info_out: interop.Pointer | interop.Reference<number>, processor_info_outCnt: interop.Pointer | interop.Reference<number>): number;

interface processor_set_basic_info {
	processor_count: number;
	default_policy: number;
}
declare var processor_set_basic_info: interop.StructType<processor_set_basic_info>;

declare function processor_set_create(host: number, new_set: interop.Pointer | interop.Reference<number>, new_name: interop.Pointer | interop.Reference<number>): number;

declare function processor_set_default(host: number, default_set: interop.Pointer | interop.Reference<number>): number;

declare function processor_set_destroy(set: number): number;

declare function processor_set_info(set_name: number, flavor: number, host: interop.Pointer | interop.Reference<number>, info_out: interop.Pointer | interop.Reference<number>, info_outCnt: interop.Pointer | interop.Reference<number>): number;

interface processor_set_load_info {
	task_count: number;
	thread_count: number;
	load_average: number;
	mach_factor: number;
}
declare var processor_set_load_info: interop.StructType<processor_set_load_info>;

declare function processor_set_max_priority(processor_set: number, max_priority: number, change_threads: number): number;

declare function processor_set_policy_control(pset: number, flavor: number, policy_info: interop.Pointer | interop.Reference<number>, policy_infoCnt: number, change: number): number;

declare function processor_set_policy_disable(processor_set: number, policy: number, change_threads: number): number;

declare function processor_set_policy_enable(processor_set: number, policy: number): number;

declare function processor_set_stack_usage(pset: number, ltotal: interop.Pointer | interop.Reference<number>, space: interop.Pointer | interop.Reference<number>, resident: interop.Pointer | interop.Reference<number>, maxusage: interop.Pointer | interop.Reference<number>, maxstack: interop.Pointer | interop.Reference<number>): number;

declare function processor_set_statistics(pset: number, flavor: number, info_out: interop.Pointer | interop.Reference<number>, info_outCnt: interop.Pointer | interop.Reference<number>): number;

declare function processor_set_tasks(processor_set: number, task_list: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, task_listCnt: interop.Pointer | interop.Reference<number>): number;

declare function processor_set_threads(processor_set: number, thread_list: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, thread_listCnt: interop.Pointer | interop.Reference<number>): number;

declare function processor_start(processor: number): number;

declare function profil(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: number): number;

interface protoent {
	p_name: string;
	p_aliases: interop.Pointer | interop.Reference<string>;
	p_proto: number;
}
declare var protoent: interop.StructType<protoent>;

declare function pselect(p1: number, p2: interop.Pointer | interop.Reference<fd_set>, p3: interop.Pointer | interop.Reference<fd_set>, p4: interop.Pointer | interop.Reference<fd_set>, p5: interop.Pointer | interop.Reference<timespec>, p6: interop.Pointer | interop.Reference<number>): number;

declare function psignal(p1: number, p2: string | interop.Pointer | interop.Reference<any>): void;

declare function psort(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): void;

declare function psort_b(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number): void;

declare function psort_r(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, p4: interop.Pointer | interop.Reference<any>, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => number>): void;

declare function pthread_atfork(p1: interop.FunctionReference<() => void>, p2: interop.FunctionReference<() => void>, p3: interop.FunctionReference<() => void>): number;

declare function pthread_attr_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>): number;

declare function pthread_attr_get_qos_class_np(__attr: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, __qos_class: interop.Pointer | interop.Reference<qos_class_t>, __relative_priority: interop.Pointer | interop.Reference<number>): number;

declare function pthread_attr_getdetachstate(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<number>): number;

declare function pthread_attr_getguardsize(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<number>): number;

declare function pthread_attr_getinheritsched(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<number>): number;

declare function pthread_attr_getschedparam(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<sched_param>): number;

declare function pthread_attr_getschedpolicy(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<number>): number;

declare function pthread_attr_getscope(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<number>): number;

declare function pthread_attr_getstack(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: interop.Pointer | interop.Reference<number>): number;

declare function pthread_attr_getstackaddr(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function pthread_attr_getstacksize(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<number>): number;

declare function pthread_attr_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>): number;

declare function pthread_attr_set_qos_class_np(__attr: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, __qos_class: qos_class_t, __relative_priority: number): number;

declare function pthread_attr_setdetachstate(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: number): number;

declare function pthread_attr_setguardsize(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: number): number;

declare function pthread_attr_setinheritsched(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: number): number;

declare function pthread_attr_setschedparam(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<sched_param>): number;

declare function pthread_attr_setschedpolicy(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: number): number;

declare function pthread_attr_setscope(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: number): number;

declare function pthread_attr_setstack(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<any>, p3: number): number;

declare function pthread_attr_setstackaddr(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<any>): number;

declare function pthread_attr_setstacksize(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: number): number;

declare function pthread_cancel(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>): number;

declare function pthread_cond_broadcast(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t>): number;

declare function pthread_cond_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t>): number;

declare function pthread_cond_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t>, p2: interop.Pointer | interop.Reference<_opaque_pthread_condattr_t>): number;

declare function pthread_cond_signal(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t>): number;

declare function pthread_cond_signal_thread_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t>, p2: interop.Pointer | interop.Reference<_opaque_pthread_t>): number;

declare function pthread_cond_timedwait(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t>, p2: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t>, p3: interop.Pointer | interop.Reference<timespec>): number;

declare function pthread_cond_timedwait_relative_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t>, p2: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t>, p3: interop.Pointer | interop.Reference<timespec>): number;

declare function pthread_cond_wait(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t>, p2: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t>): number;

declare function pthread_condattr_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_condattr_t>): number;

declare function pthread_condattr_getpshared(p1: interop.Pointer | interop.Reference<_opaque_pthread_condattr_t>, p2: interop.Pointer | interop.Reference<number>): number;

declare function pthread_condattr_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_condattr_t>): number;

declare function pthread_condattr_setpshared(p1: interop.Pointer | interop.Reference<_opaque_pthread_condattr_t>, p2: number): number;

declare function pthread_create(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_opaque_pthread_t>>, p2: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>, p4: interop.Pointer | interop.Reference<any>): number;

declare function pthread_create_from_mach_thread(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_opaque_pthread_t>>, p2: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>, p4: interop.Pointer | interop.Reference<any>): number;

declare function pthread_create_suspended_np(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_opaque_pthread_t>>, p2: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>, p4: interop.Pointer | interop.Reference<any>): number;

declare function pthread_detach(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>): number;

declare function pthread_equal(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>, p2: interop.Pointer | interop.Reference<_opaque_pthread_t>): number;

declare function pthread_exit(p1: interop.Pointer | interop.Reference<any>): void;

declare function pthread_from_mach_thread_np(p1: number): interop.Pointer | interop.Reference<_opaque_pthread_t>;

declare function pthread_get_qos_class_np(__pthread: interop.Pointer | interop.Reference<_opaque_pthread_t>, __qos_class: interop.Pointer | interop.Reference<qos_class_t>, __relative_priority: interop.Pointer | interop.Reference<number>): number;

declare function pthread_get_stackaddr_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>): interop.Pointer | interop.Reference<any>;

declare function pthread_get_stacksize_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>): number;

declare function pthread_getconcurrency(): number;

declare function pthread_getname_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function pthread_getschedparam(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<sched_param>): number;

declare function pthread_getspecific(p1: number): interop.Pointer | interop.Reference<any>;

declare function pthread_getugid_np(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): number;

declare function pthread_is_threaded_np(): number;

declare function pthread_join(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function pthread_key_create(p1: interop.Pointer | interop.Reference<number>, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): number;

declare function pthread_key_delete(p1: number): number;

declare function pthread_kill(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>, p2: number): number;

declare function pthread_killFunction(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>, p2: number): number;

declare function pthread_mach_thread_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>): number;

declare function pthread_main_np(): number;

declare function pthread_mutex_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t>): number;

declare function pthread_mutex_getprioceiling(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t>, p2: interop.Pointer | interop.Reference<number>): number;

declare function pthread_mutex_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t>, p2: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>): number;

declare function pthread_mutex_lock(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t>): number;

declare function pthread_mutex_setprioceiling(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t>, p2: number, p3: interop.Pointer | interop.Reference<number>): number;

declare function pthread_mutex_trylock(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t>): number;

declare function pthread_mutex_unlock(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t>): number;

declare function pthread_mutexattr_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>): number;

declare function pthread_mutexattr_getpolicy_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>, p2: interop.Pointer | interop.Reference<number>): number;

declare function pthread_mutexattr_getprioceiling(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>, p2: interop.Pointer | interop.Reference<number>): number;

declare function pthread_mutexattr_getprotocol(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>, p2: interop.Pointer | interop.Reference<number>): number;

declare function pthread_mutexattr_getpshared(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>, p2: interop.Pointer | interop.Reference<number>): number;

declare function pthread_mutexattr_gettype(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>, p2: interop.Pointer | interop.Reference<number>): number;

declare function pthread_mutexattr_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>): number;

declare function pthread_mutexattr_setpolicy_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>, p2: number): number;

declare function pthread_mutexattr_setprioceiling(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>, p2: number): number;

declare function pthread_mutexattr_setprotocol(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>, p2: number): number;

declare function pthread_mutexattr_setpshared(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>, p2: number): number;

declare function pthread_mutexattr_settype(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>, p2: number): number;

declare function pthread_once(p1: interop.Pointer | interop.Reference<_opaque_pthread_once_t>, p2: interop.FunctionReference<() => void>): number;

declare function pthread_override_qos_class_end_np(__override: interop.Pointer | interop.Reference<any>): number;

declare function pthread_override_qos_class_start_np(__pthread: interop.Pointer | interop.Reference<_opaque_pthread_t>, __qos_class: qos_class_t, __relative_priority: number): interop.Pointer | interop.Reference<any>;

declare function pthread_rwlock_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t>): number;

declare function pthread_rwlock_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t>, p2: interop.Pointer | interop.Reference<_opaque_pthread_rwlockattr_t>): number;

declare function pthread_rwlock_rdlock(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t>): number;

declare function pthread_rwlock_tryrdlock(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t>): number;

declare function pthread_rwlock_trywrlock(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t>): number;

declare function pthread_rwlock_unlock(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t>): number;

declare function pthread_rwlock_wrlock(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t>): number;

declare function pthread_rwlockattr_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlockattr_t>): number;

declare function pthread_rwlockattr_getpshared(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlockattr_t>, p2: interop.Pointer | interop.Reference<number>): number;

declare function pthread_rwlockattr_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlockattr_t>): number;

declare function pthread_rwlockattr_setpshared(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlockattr_t>, p2: number): number;

declare function pthread_self(): interop.Pointer | interop.Reference<_opaque_pthread_t>;

declare function pthread_set_qos_class_self_np(__qos_class: qos_class_t, __relative_priority: number): number;

declare function pthread_setcancelstate(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function pthread_setcanceltype(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function pthread_setconcurrency(p1: number): number;

declare function pthread_setname_np(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function pthread_setschedparam(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>, p2: number, p3: interop.Pointer | interop.Reference<sched_param>): number;

declare function pthread_setspecific(p1: number, p2: interop.Pointer | interop.Reference<any>): number;

declare function pthread_setugid_np(p1: number, p2: number): number;

declare function pthread_sigmask(p1: number, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>): number;

declare function pthread_sigmaskFunction(p1: number, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>): number;

declare function pthread_testcancel(): void;

declare function pthread_threadid_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>, p2: interop.Pointer | interop.Reference<number>): number;

declare function pthread_yield_np(): void;

declare function ptsname(p1: number): string;

declare function ptsname_r(fildes: number, buffer: string | interop.Pointer | interop.Reference<any>, buflen: number): number;

declare function putc(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function putc_unlocked(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function putchar(p1: number): number;

declare function putchar_unlocked(p1: number): number;

declare function putenv(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function puts(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function pututxline(p1: interop.Pointer | interop.Reference<utmpx>): interop.Pointer | interop.Reference<utmpx>;

declare function putw(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function putwc(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function putwc_l(p1: number, p2: interop.Pointer | interop.Reference<FILE>, p3: interop.Pointer | interop.Reference<any>): number;

declare function putwchar(p1: number): number;

declare function putwchar_l(p1: number, p2: interop.Pointer | interop.Reference<any>): number;

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

declare function quotactl(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: string | interop.Pointer | interop.Reference<any>): number;

declare function radixsort(__base: interop.Pointer | interop.Reference<string>, __nel: number, __table: string | interop.Pointer | interop.Reference<any>, __endbyte: number): number;

interface radvisory {
	ra_offset: number;
	ra_count: number;
}
declare var radvisory: interop.StructType<radvisory>;

declare function raise(p1: number): number;

declare function rand(): number;

declare function rand_r(p1: interop.Pointer | interop.Reference<number>): number;

declare function random(): number;

interface rb_node_t {
	opaque: interop.Reference<interop.Pointer | interop.Reference<any>>;
}
declare var rb_node_t: interop.StructType<rb_node_t>;

declare function rb_tree_count(p1: interop.Pointer | interop.Reference<rb_tree_t>): number;

declare function rb_tree_find_node(p1: interop.Pointer | interop.Reference<rb_tree_t>, p2: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function rb_tree_find_node_geq(p1: interop.Pointer | interop.Reference<rb_tree_t>, p2: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function rb_tree_find_node_leq(p1: interop.Pointer | interop.Reference<rb_tree_t>, p2: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function rb_tree_init(p1: interop.Pointer | interop.Reference<rb_tree_t>, p2: interop.Pointer | interop.Reference<rb_tree_ops_t>): void;

declare function rb_tree_insert_node(p1: interop.Pointer | interop.Reference<rb_tree_t>, p2: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function rb_tree_iterate(p1: interop.Pointer | interop.Reference<rb_tree_t>, p2: interop.Pointer | interop.Reference<any>, p3: number): interop.Pointer | interop.Reference<any>;

interface rb_tree_ops_t {
	rbto_compare_nodes: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => number>;
	rbto_compare_key: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => number>;
	rbto_node_offset: number;
	rbto_context: interop.Pointer | interop.Reference<any>;
}
declare var rb_tree_ops_t: interop.StructType<rb_tree_ops_t>;

declare function rb_tree_remove_node(p1: interop.Pointer | interop.Reference<rb_tree_t>, p2: interop.Pointer | interop.Reference<any>): void;

interface rb_tree_t {
	opaque: interop.Reference<interop.Pointer | interop.Reference<any>>;
}
declare var rb_tree_t: interop.StructType<rb_tree_t>;

declare function rcmd(p1: interop.Pointer | interop.Reference<string>, p2: number, p3: string | interop.Pointer | interop.Reference<any>, p4: string | interop.Pointer | interop.Reference<any>, p5: string | interop.Pointer | interop.Reference<any>, p6: interop.Pointer | interop.Reference<number>): number;

declare function rcmd_af(p1: interop.Pointer | interop.Reference<string>, p2: number, p3: string | interop.Pointer | interop.Reference<any>, p4: string | interop.Pointer | interop.Reference<any>, p5: string | interop.Pointer | interop.Reference<any>, p6: interop.Pointer | interop.Reference<number>, p7: number): number;

declare function read(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number): number;

declare function readdir(p1: interop.Pointer | interop.Reference<DIR>): interop.Pointer | interop.Reference<dirent>;

declare function readdir_r(p1: interop.Pointer | interop.Reference<DIR>, p2: interop.Pointer | interop.Reference<dirent>, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<dirent>>): number;

declare function readlink(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function readlinkat(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: string | interop.Pointer | interop.Reference<any>, p4: number): number;

declare function readpassphrase(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: number): string;

declare function readv(p1: number, p2: interop.Pointer | interop.Reference<iovec>, p3: number): number;

declare function realloc(__ptr: interop.Pointer | interop.Reference<any>, __size: number): interop.Pointer | interop.Reference<any>;

declare function reallocf(__ptr: interop.Pointer | interop.Reference<any>, __size: number): interop.Pointer | interop.Reference<any>;

declare function realpath(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): string;

declare function reboot(p1: number): number;

declare function recv(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number): number;

declare function recvfrom(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number, p5: interop.Pointer | interop.Reference<sockaddr>, p6: interop.Pointer | interop.Reference<number>): number;

declare function recvmsg(p1: number, p2: interop.Pointer | interop.Reference<msghdr>, p3: number): number;

declare function regcomp(p1: interop.Pointer | interop.Reference<regex_t>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function regerror(p1: number, p2: interop.Pointer | interop.Reference<regex_t>, p3: string | interop.Pointer | interop.Reference<any>, p4: number): number;

interface regex_t {
	re_magic: number;
	re_nsub: number;
	re_endp: string;
	re_g: interop.Pointer | interop.Reference<any>;
}
declare var regex_t: interop.StructType<regex_t>;

declare function regexec(p1: interop.Pointer | interop.Reference<regex_t>, p2: string | interop.Pointer | interop.Reference<any>, p3: number, __pmatch: interop.Reference<regmatch_t>, p5: number): number;

declare function regfree(p1: interop.Pointer | interop.Reference<regex_t>): void;

interface regmatch_t {
	rm_so: number;
	rm_eo: number;
}
declare var regmatch_t: interop.StructType<regmatch_t>;

declare function regncomp(p1: interop.Pointer | interop.Reference<regex_t>, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: number): number;

declare function regnexec(p1: interop.Pointer | interop.Reference<regex_t>, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: number, __pmatch: interop.Reference<regmatch_t>, p6: number): number;

declare function regwcomp(p1: interop.Pointer | interop.Reference<regex_t>, p2: interop.Pointer | interop.Reference<number>, p3: number): number;

declare function regwexec(p1: interop.Pointer | interop.Reference<regex_t>, p2: interop.Pointer | interop.Reference<number>, p3: number, __pmatch: interop.Reference<regmatch_t>, p5: number): number;

declare function regwncomp(p1: interop.Pointer | interop.Reference<regex_t>, p2: interop.Pointer | interop.Reference<number>, p3: number, p4: number): number;

declare function regwnexec(p1: interop.Pointer | interop.Reference<regex_t>, p2: interop.Pointer | interop.Reference<number>, p3: number, p4: number, __pmatch: interop.Reference<regmatch_t>, p6: number): number;

declare function remainder(p1: number, p2: number): number;

declare function remainderf(p1: number, p2: number): number;

declare function remainderl(p1: number, p2: number): number;

declare function remove(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function removexattr(path: string | interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, options: number): number;

declare function remque(p1: interop.Pointer | interop.Reference<any>): void;

declare function remquo(p1: number, p2: number, p3: interop.Pointer | interop.Reference<number>): number;

declare function remquof(p1: number, p2: number, p3: interop.Pointer | interop.Reference<number>): number;

declare function remquol(p1: number, p2: number, p3: interop.Pointer | interop.Reference<number>): number;

declare function rename(__old: string | interop.Pointer | interop.Reference<any>, __new: string | interop.Pointer | interop.Reference<any>): number;

declare function revoke(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function rewind(p1: interop.Pointer | interop.Reference<FILE>): void;

declare function rewinddir(p1: interop.Pointer | interop.Reference<DIR>): void;

declare function rindex(p1: string | interop.Pointer | interop.Reference<any>, p2: number): string;

declare function rint(p1: number): number;

declare function rintf(p1: number): number;

declare function rintl(p1: number): number;

interface rlimit {
	rlim_cur: number;
	rlim_max: number;
}
declare var rlimit: interop.StructType<rlimit>;

declare function rmdir(p1: string | interop.Pointer | interop.Reference<any>): number;

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

interface rpcent {
	r_name: string;
	r_aliases: interop.Pointer | interop.Reference<string>;
	r_number: number;
}
declare var rpcent: interop.StructType<rpcent>;

declare function rpmatch(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function rresvport(p1: interop.Pointer | interop.Reference<number>): number;

declare function rresvport_af(p1: interop.Pointer | interop.Reference<number>, p2: number): number;

interface rslvmulti_req {
	sa: interop.Pointer | interop.Reference<sockaddr>;
	llsa: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<sockaddr>>;
}
declare var rslvmulti_req: interop.StructType<rslvmulti_req>;

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

interface rusage_info_v3 {
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
declare var rusage_info_v3: interop.StructType<rusage_info_v3>;

interface rusage_info_v4 {
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
	ri_logical_writes: number;
	ri_lifetime_max_phys_footprint: number;
	ri_instructions: number;
	ri_cycles: number;
	ri_billed_energy: number;
	ri_serviced_energy: number;
	ri_interval_max_phys_footprint: number;
	ri_runnable_time: number;
}
declare var rusage_info_v4: interop.StructType<rusage_info_v4>;

declare function ruserok(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: string | interop.Pointer | interop.Reference<any>, p4: string | interop.Pointer | interop.Reference<any>): number;

interface sa_endpoints_t {
	sae_srcif: number;
	sae_srcaddr: interop.Pointer | interop.Reference<sockaddr>;
	sae_srcaddrlen: number;
	sae_dstaddr: interop.Pointer | interop.Reference<sockaddr>;
	sae_dstaddrlen: number;
}
declare var sa_endpoints_t: interop.StructType<sa_endpoints_t>;

declare function safe_gets(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): void;

declare function sbrk(p1: number): interop.Pointer | interop.Reference<any>;

declare function scalb(p1: number, p2: number): number;

declare function scalbln(p1: number, p2: number): number;

declare function scalblnf(p1: number, p2: number): number;

declare function scalblnl(p1: number, p2: number): number;

declare function scalbn(p1: number, p2: number): number;

declare function scalbnf(p1: number, p2: number): number;

declare function scalbnl(p1: number, p2: number): number;

declare function scandir(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<dirent>>>, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<dirent>) => number>, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<dirent>>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<dirent>>) => number>): number;

declare function scandir_b(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<dirent>>>, p3: (p1: interop.Pointer | interop.Reference<dirent>) => number, p4: (p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<dirent>>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<dirent>>) => number): number;

declare function sched_get_priority_max(p1: number): number;

declare function sched_get_priority_min(p1: number): number;

interface sched_param {
	sched_priority: number;
	__opaque: interop.Reference<number>;
}
declare var sched_param: interop.StructType<sched_param>;

declare function sched_yield(): number;

declare function searchfs(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<fssearchblock>, p3: interop.Pointer | interop.Reference<number>, p4: number, p5: number, p6: interop.Pointer | interop.Reference<searchstate>): number;

interface searchstate {
	ss_union_flags: number;
	ss_union_layer: number;
	ss_fsstate: interop.Reference<number>;
}
declare var searchstate: interop.StructType<searchstate>;

interface security_token_t {
	val: interop.Reference<number>;
}
declare var security_token_t: interop.StructType<security_token_t>;

declare function seed48(p1: interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function seekdir(p1: interop.Pointer | interop.Reference<DIR>, p2: number): void;

interface sem {
	semval: number;
	sempid: number;
	semncnt: number;
	semzcnt: number;
}
declare var sem: interop.StructType<sem>;

declare function sem_close(p1: interop.Pointer | interop.Reference<number>): number;

declare function sem_destroy(p1: interop.Pointer | interop.Reference<number>): number;

declare function sem_getvalue(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): number;

declare function sem_init(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: number): number;

declare function sem_post(p1: interop.Pointer | interop.Reference<number>): number;

declare function sem_trywait(p1: interop.Pointer | interop.Reference<number>): number;

declare function sem_unlink(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function sem_wait(p1: interop.Pointer | interop.Reference<number>): number;

declare function semaphore_create(task: number, semaphore: interop.Pointer | interop.Reference<number>, policy: number, value: number): number;

declare function semaphore_destroy(task: number, semaphore: number): number;

declare function semaphore_signal(semaphore: number): number;

declare function semaphore_signal_all(semaphore: number): number;

declare function semaphore_signal_thread(semaphore: number, thread: number): number;

declare function semaphore_timedwait(semaphore: number, wait_time: mach_timespec): number;

declare function semaphore_timedwait_signal(wait_semaphore: number, signal_semaphore: number, wait_time: mach_timespec): number;

declare function semaphore_wait(semaphore: number): number;

declare function semaphore_wait_signal(wait_semaphore: number, signal_semaphore: number): number;

interface sembuf {
	sem_num: number;
	sem_op: number;
	sem_flg: number;
}
declare var sembuf: interop.StructType<sembuf>;

declare function semget(p1: number, p2: number, p3: number): number;

declare function semop(p1: number, p2: interop.Pointer | interop.Reference<sembuf>, p3: number): number;

declare function send(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number): number;

declare function sendfile(p1: number, p2: number, p3: number, p4: interop.Pointer | interop.Reference<number>, p5: interop.Pointer | interop.Reference<sf_hdtr>, p6: number): number;

declare function sendmsg(p1: number, p2: interop.Pointer | interop.Reference<msghdr>, p3: number): number;

declare function sendto(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number, p5: interop.Pointer | interop.Reference<sockaddr>, p6: number): number;

interface servent {
	s_name: string;
	s_aliases: interop.Pointer | interop.Reference<string>;
	s_port: number;
	s_proto: string;
}
declare var servent: interop.StructType<servent>;

declare function setattrlist(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: number): number;

declare function setattrlistat(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<any>, p5: number, p6: number): number;

declare function setaudit(p1: interop.Pointer | interop.Reference<auditinfo>): number;

declare function setaudit_addr(p1: interop.Pointer | interop.Reference<auditinfo_addr>, p2: number): number;

declare function setauid(p1: interop.Pointer | interop.Reference<number>): number;

declare function setbuf(p1: interop.Pointer | interop.Reference<FILE>, p2: string | interop.Pointer | interop.Reference<any>): void;

declare function setbuffer(p1: interop.Pointer | interop.Reference<FILE>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): void;

declare function setdomainname(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function setegid(p1: number): number;

declare function setenv(__name: string | interop.Pointer | interop.Reference<any>, __value: string | interop.Pointer | interop.Reference<any>, __overwrite: number): number;

declare function seteuid(p1: number): number;

declare function setgid(p1: number): number;

declare function setgrent(): void;

declare function setgrfile(p1: string | interop.Pointer | interop.Reference<any>): void;

declare function setgroupent(p1: number): number;

declare function setgroups(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function sethostent(p1: number): void;

declare function sethostid(p1: number): void;

declare function sethostname(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function setiopolicy_np(p1: number, p2: number, p3: number): number;

declare function setipv4sourcefilter(p1: number, p2: in_addr, p3: in_addr, p4: number, p5: number, p6: interop.Pointer | interop.Reference<in_addr>): number;

declare function setitimer(p1: number, p2: interop.Pointer | interop.Reference<itimerval>, p3: interop.Pointer | interop.Reference<itimerval>): number;

declare function setjmp(p1: interop.Reference<number>): number;

declare function setkey(p1: string | interop.Pointer | interop.Reference<any>): void;

declare function setkeyFunction(p1: string | interop.Pointer | interop.Reference<any>): void;

declare function setlinebuf(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function setlocale(p1: number, p2: string | interop.Pointer | interop.Reference<any>): string;

declare function setlogin(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function setlogmask(p1: number): number;

declare function setmode(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function setnetent(p1: number): void;

declare function setnetgrent(p1: string | interop.Pointer | interop.Reference<any>): void;

declare function setpassent(p1: number): number;

declare function setpgid(p1: number, p2: number): number;

declare function setpgrp(): number;

declare function setpriority(p1: number, p2: number, p3: number): number;

declare function setprogname(p1: string | interop.Pointer | interop.Reference<any>): void;

declare function setprotoent(p1: number): void;

declare function setpwent(): void;

declare function setregid(p1: number, p2: number): number;

declare function setreuid(p1: number, p2: number): number;

declare function setrgid(p1: number): number;

declare function setrlimit(p1: number, p2: interop.Pointer | interop.Reference<rlimit>): number;

declare function setrpcent(stayopen: number): void;

declare function setruid(p1: number): number;

declare function setservent(p1: number): void;

declare function setsgroups_np(p1: number, p2: interop.Reference<number>): number;

declare function setsid(): number;

declare function setsockopt(p1: number, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>, p5: number): number;

declare function setsourcefilter(p1: number, p2: number, p3: interop.Pointer | interop.Reference<sockaddr>, p4: number, p5: number, p6: number, p7: interop.Pointer | interop.Reference<sockaddr_storage>): number;

declare function setstate(p1: string | interop.Pointer | interop.Reference<any>): string;

declare function settimeofday(p1: interop.Pointer | interop.Reference<timeval>, p2: interop.Pointer | interop.Reference<timezoneStruct>): number;

declare function setuid(p1: number): number;

declare function setusershell(): void;

declare function setutxent(): void;

declare function setutxent_wtmp(p1: number): void;

declare function setvbuf(p1: interop.Pointer | interop.Reference<FILE>, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: number): number;

declare function setwgroups_np(p1: number, p2: interop.Reference<number>): number;

declare function setxattr(path: string | interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>, size: number, position: number, options: number): number;

interface sf_hdtr {
	headers: interop.Pointer | interop.Reference<iovec>;
	hdr_cnt: number;
	trailers: interop.Pointer | interop.Reference<iovec>;
	trl_cnt: number;
}
declare var sf_hdtr: interop.StructType<sf_hdtr>;

declare const shadow: number;

declare function shm_unlink(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function shmat(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number): interop.Pointer | interop.Reference<any>;

declare function shmctl(p1: number, p2: number, p3: interop.Pointer | interop.Reference<__shmid_ds_new>): number;

declare function shmdt(p1: interop.Pointer | interop.Reference<any>): number;

declare function shmget(p1: number, p2: number, p3: number): number;

declare function shutdown(p1: number, p2: number): number;

declare function sigaddset(p1: interop.Pointer | interop.Reference<number>, p2: number): number;

declare function sigaltstack(p1: interop.Pointer | interop.Reference<__darwin_sigaltstack>, p2: interop.Pointer | interop.Reference<__darwin_sigaltstack>): number;

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

interface sockaddr_dl {
	sdl_len: number;
	sdl_family: number;
	sdl_index: number;
	sdl_type: number;
	sdl_nlen: number;
	sdl_alen: number;
	sdl_slen: number;
	sdl_data: interop.Reference<number>;
}
declare var sockaddr_dl: interop.StructType<sockaddr_dl>;

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

interface sockaddr_un {
	sun_len: number;
	sun_family: number;
	sun_path: interop.Reference<number>;
}
declare var sockaddr_un: interop.StructType<sockaddr_un>;

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

declare function sradixsort(__base: interop.Pointer | interop.Reference<string>, __nel: number, __table: string | interop.Pointer | interop.Reference<any>, __endbyte: number): number;

declare function srand(p1: number): void;

declare function srand48(p1: number): void;

declare function sranddev(): void;

declare function srandom(p1: number): void;

declare function srandomdev(): void;

declare function stat(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<statStruct>): number;

interface statStruct {
	st_dev: number;
	st_mode: number;
	st_nlink: number;
	st_ino: number;
	st_uid: number;
	st_gid: number;
	st_rdev: number;
	st_atimespec: timespec;
	st_mtimespec: timespec;
	st_ctimespec: timespec;
	st_birthtimespec: timespec;
	st_size: number;
	st_blocks: number;
	st_blksize: number;
	st_flags: number;
	st_gen: number;
	st_lspare: number;
	st_qspare: interop.Reference<number>;
}
declare var statStruct: interop.StructType<statStruct>;

declare function statfs(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<statfsStruct>): number;

interface statfsStruct {
	f_bsize: number;
	f_iosize: number;
	f_blocks: number;
	f_bfree: number;
	f_bavail: number;
	f_files: number;
	f_ffree: number;
	f_fsid: fsid_t;
	f_owner: number;
	f_type: number;
	f_flags: number;
	f_fssubtype: number;
	f_fstypename: interop.Reference<number>;
	f_mntonname: interop.Reference<number>;
	f_mntfromname: interop.Reference<number>;
	f_flags_ext: number;
	f_reserved: interop.Reference<number>;
}
declare var statfsStruct: interop.StructType<statfsStruct>;

declare function statvfs(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<statvfsStruct>): number;

interface statvfsStruct {
	f_bsize: number;
	f_frsize: number;
	f_blocks: number;
	f_bfree: number;
	f_bavail: number;
	f_files: number;
	f_ffree: number;
	f_favail: number;
	f_fsid: number;
	f_flag: number;
	f_namemax: number;
}
declare var statvfsStruct: interop.StructType<statvfsStruct>;

declare function statx_np(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<statStruct>, p3: interop.Pointer | interop.Reference<any>): number;

declare function stpcpy(__dst: string | interop.Pointer | interop.Reference<any>, __src: string | interop.Pointer | interop.Reference<any>): string;

declare function stpncpy(__dst: string | interop.Pointer | interop.Reference<any>, __src: string | interop.Pointer | interop.Reference<any>, __n: number): string;

declare function strcasecmp(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): number;

declare function strcasecmp_l(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>): number;

declare function strcasestr(__big: string | interop.Pointer | interop.Reference<any>, __little: string | interop.Pointer | interop.Reference<any>): string;

declare function strcasestr_l(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>): string;

declare function strcat(__s1: string | interop.Pointer | interop.Reference<any>, __s2: string | interop.Pointer | interop.Reference<any>): string;

declare function strchr(__s: string | interop.Pointer | interop.Reference<any>, __c: number): string;

declare function strcmp(__s1: string | interop.Pointer | interop.Reference<any>, __s2: string | interop.Pointer | interop.Reference<any>): number;

declare function strcoll(__s1: string | interop.Pointer | interop.Reference<any>, __s2: string | interop.Pointer | interop.Reference<any>): number;

declare function strcoll_l(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>): number;

declare function strcpy(__dst: string | interop.Pointer | interop.Reference<any>, __src: string | interop.Pointer | interop.Reference<any>): string;

declare function strcspn(__s: string | interop.Pointer | interop.Reference<any>, __charset: string | interop.Pointer | interop.Reference<any>): number;

declare function strdup(__s1: string | interop.Pointer | interop.Reference<any>): string;

declare function strerror(__errnum: number): string;

declare function strerror_r(__errnum: number, __strerrbuf: string | interop.Pointer | interop.Reference<any>, __buflen: number): number;

declare function strftime(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: string | interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<tm>): number;

declare function strftime_l(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: string | interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<tm>, p5: interop.Pointer | interop.Reference<any>): number;

declare function strlcat(__dst: string | interop.Pointer | interop.Reference<any>, __source: string | interop.Pointer | interop.Reference<any>, __size: number): number;

declare function strlcpy(__dst: string | interop.Pointer | interop.Reference<any>, __source: string | interop.Pointer | interop.Reference<any>, __size: number): number;

declare function strlen(__s: string | interop.Pointer | interop.Reference<any>): number;

declare function strmode(__mode: number, __bp: string | interop.Pointer | interop.Reference<any>): void;

declare function strncasecmp(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function strncasecmp_l(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function strncat(__s1: string | interop.Pointer | interop.Reference<any>, __s2: string | interop.Pointer | interop.Reference<any>, __n: number): string;

declare function strncmp(__s1: string | interop.Pointer | interop.Reference<any>, __s2: string | interop.Pointer | interop.Reference<any>, __n: number): number;

declare function strncpy(__dst: string | interop.Pointer | interop.Reference<any>, __src: string | interop.Pointer | interop.Reference<any>, __n: number): string;

declare function strndup(__s1: string | interop.Pointer | interop.Reference<any>, __n: number): string;

declare function strnlen(__s1: string | interop.Pointer | interop.Reference<any>, __n: number): number;

declare function strnstr(__big: string | interop.Pointer | interop.Reference<any>, __little: string | interop.Pointer | interop.Reference<any>, __len: number): string;

declare function strpbrk(__s: string | interop.Pointer | interop.Reference<any>, __charset: string | interop.Pointer | interop.Reference<any>): string;

declare function strptime(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<tm>): string;

declare function strptime_l(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<tm>, p4: interop.Pointer | interop.Reference<any>): string;

declare function strrchr(__s: string | interop.Pointer | interop.Reference<any>, __c: number): string;

declare function strsep(__stringp: interop.Pointer | interop.Reference<string>, __delim: string | interop.Pointer | interop.Reference<any>): string;

declare function strsignal(__sig: number): string;

declare function strspn(__s: string | interop.Pointer | interop.Reference<any>, __charset: string | interop.Pointer | interop.Reference<any>): number;

declare function strstr(__big: string | interop.Pointer | interop.Reference<any>, __little: string | interop.Pointer | interop.Reference<any>): string;

declare function strtod(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<string>): number;

declare function strtod_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<string>, p3: interop.Pointer | interop.Reference<any>): number;

declare function strtof(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<string>): number;

declare function strtof_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<string>, p3: interop.Pointer | interop.Reference<any>): number;

declare function strtofflags(p1: interop.Pointer | interop.Reference<string>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>): number;

declare function strtoimax(__nptr: string | interop.Pointer | interop.Reference<any>, __endptr: interop.Pointer | interop.Reference<string>, __base: number): number;

declare function strtoimax_l(nptr: string | interop.Pointer | interop.Reference<any>, endptr: interop.Pointer | interop.Reference<string>, base: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function strtok(__str: string | interop.Pointer | interop.Reference<any>, __sep: string | interop.Pointer | interop.Reference<any>): string;

declare function strtok_r(__str: string | interop.Pointer | interop.Reference<any>, __sep: string | interop.Pointer | interop.Reference<any>, __lasts: interop.Pointer | interop.Reference<string>): string;

declare function strtol(__str: string | interop.Pointer | interop.Reference<any>, __endptr: interop.Pointer | interop.Reference<string>, __base: number): number;

declare function strtol_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<string>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function strtold(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<string>): number;

declare function strtold_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<string>, p3: interop.Pointer | interop.Reference<any>): number;

declare function strtoll(__str: string | interop.Pointer | interop.Reference<any>, __endptr: interop.Pointer | interop.Reference<string>, __base: number): number;

declare function strtoll_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<string>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function strtoq(__str: string | interop.Pointer | interop.Reference<any>, __endptr: interop.Pointer | interop.Reference<string>, __base: number): number;

declare function strtoq_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<string>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function strtoul(__str: string | interop.Pointer | interop.Reference<any>, __endptr: interop.Pointer | interop.Reference<string>, __base: number): number;

declare function strtoul_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<string>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function strtoull(__str: string | interop.Pointer | interop.Reference<any>, __endptr: interop.Pointer | interop.Reference<string>, __base: number): number;

declare function strtoull_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<string>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function strtoumax(__nptr: string | interop.Pointer | interop.Reference<any>, __endptr: interop.Pointer | interop.Reference<string>, __base: number): number;

declare function strtoumax_l(nptr: string | interop.Pointer | interop.Reference<any>, endptr: interop.Pointer | interop.Reference<string>, base: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function strtouq(__str: string | interop.Pointer | interop.Reference<any>, __endptr: interop.Pointer | interop.Reference<string>, __base: number): number;

declare function strtouq_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<string>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function strxfrm(__s1: string | interop.Pointer | interop.Reference<any>, __s2: string | interop.Pointer | interop.Reference<any>, __n: number): number;

declare function strxfrm_l(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare var suboptarg: string;

declare var suboptargVar: string;

declare function swab(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number): void;

declare function swabFunction(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number): void;

declare function swapon(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function swtch(): number;

declare function swtch_pri(pri: number): number;

declare function symlink(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): number;

declare function symlinkat(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: string | interop.Pointer | interop.Reference<any>): number;

declare function sync(): void;

declare function sync_volume_np(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare var sys_errlist: interop.Reference<string>;

declare var sys_nerr: number;

declare var sys_siglist: interop.Reference<string>;

declare var sys_signame: interop.Reference<string>;

declare function sysconf(p1: number): number;

declare function sysctl(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<number>, p5: interop.Pointer | interop.Reference<any>, p6: number): number;

declare function sysctlbyname(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<any>, p5: number): number;

declare function sysctlnametomib(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>): number;

declare function tan(p1: number): number;

declare function tanf(p1: number): number;

declare function tanh(p1: number): number;

declare function tanhf(p1: number): number;

declare function tanhl(p1: number): number;

declare function tanl(p1: number): number;

interface task_absolutetime_info {
	total_user: number;
	total_system: number;
	threads_user: number;
	threads_system: number;
}
declare var task_absolutetime_info: interop.StructType<task_absolutetime_info>;

interface task_affinity_tag_info {
	set_count: number;
	min: number;
	max: number;
	task_count: number;
}
declare var task_affinity_tag_info: interop.StructType<task_affinity_tag_info>;

declare function task_assign(task: number, new_set: number, assign_threads: number): number;

declare function task_assign_default(task: number, assign_threads: number): number;

interface task_basic_info {
	suspend_count: number;
	virtual_size: number;
	resident_size: number;
	user_time: time_value;
	system_time: time_value;
	policy: number;
}
declare var task_basic_info: interop.StructType<task_basic_info>;

interface task_basic_info_32 {
	suspend_count: number;
	virtual_size: number;
	resident_size: number;
	user_time: time_value;
	system_time: time_value;
	policy: number;
}
declare var task_basic_info_32: interop.StructType<task_basic_info_32>;

interface task_basic_info_64 {
	suspend_count: number;
	virtual_size: number;
	resident_size: number;
	user_time: time_value;
	system_time: time_value;
	policy: number;
}
declare var task_basic_info_64: interop.StructType<task_basic_info_64>;

interface task_category_policy {
	role: number;
}
declare var task_category_policy: interop.StructType<task_category_policy>;

declare function task_create(target_task: number, ledgers: interop.Pointer | interop.Reference<number>, ledgersCnt: number, inherit_memory: number, child_task: interop.Pointer | interop.Reference<number>): number;

interface task_dyld_info {
	all_image_info_addr: number;
	all_image_info_size: number;
	all_image_info_format: number;
}
declare var task_dyld_info: interop.StructType<task_dyld_info>;

interface task_events_info {
	faults: number;
	pageins: number;
	cow_faults: number;
	messages_sent: number;
	messages_received: number;
	syscalls_mach: number;
	syscalls_unix: number;
	csw: number;
}
declare var task_events_info: interop.StructType<task_events_info>;

interface task_extmod_info {
	task_uuid: interop.Reference<number>;
	extmod_statistics: vm_extmod_statistics;
}
declare var task_extmod_info: interop.StructType<task_extmod_info>;

interface task_flags_info {
	flags: number;
}
declare var task_flags_info: interop.StructType<task_flags_info>;

declare function task_for_pid(target_tport: number, pid: number, t: interop.Pointer | interop.Reference<number>): number;

declare function task_generate_corpse(task: number, corpse_task_port: interop.Pointer | interop.Reference<number>): number;

declare function task_get_assignment(task: number, assigned_set: interop.Pointer | interop.Reference<number>): number;

declare function task_get_emulation_vector(task: number, vector_start: interop.Pointer | interop.Reference<number>, emulation_vector: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, emulation_vectorCnt: interop.Pointer | interop.Reference<number>): number;

declare function task_get_exc_guard_behavior(task: number, behavior: interop.Pointer | interop.Reference<number>): number;

declare function task_get_exception_ports(task: number, exception_mask: number, masks: interop.Pointer | interop.Reference<number>, masksCnt: interop.Pointer | interop.Reference<number>, old_handlers: interop.Pointer | interop.Reference<number>, old_behaviors: interop.Pointer | interop.Reference<number>, old_flavors: interop.Pointer | interop.Reference<number>): number;

declare function task_get_mach_voucher(task: number, which: number, voucher: interop.Pointer | interop.Reference<number>): number;

declare function task_get_special_port(task: number, which_port: number, special_port: interop.Pointer | interop.Reference<number>): number;

declare function task_get_state(task: number, flavor: number, old_state: interop.Pointer | interop.Reference<number>, old_stateCnt: interop.Pointer | interop.Reference<number>): number;

declare function task_info(target_task: number, flavor: number, task_info_out: interop.Pointer | interop.Reference<number>, task_info_outCnt: interop.Pointer | interop.Reference<number>): number;

declare function task_inspect(task: number, flavor: number, info_out: interop.Pointer | interop.Reference<number>, info_outCnt: interop.Pointer | interop.Reference<number>): number;

interface task_kernelmemory_info {
	total_palloc: number;
	total_pfree: number;
	total_salloc: number;
	total_sfree: number;
}
declare var task_kernelmemory_info: interop.StructType<task_kernelmemory_info>;

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

interface task_power_info {
	total_user: number;
	total_system: number;
	task_interrupt_wakeups: number;
	task_platform_idle_wakeups: number;
	task_timer_wakeups_bin_1: number;
	task_timer_wakeups_bin_2: number;
}
declare var task_power_info: interop.StructType<task_power_info>;

interface task_power_info_v2 {
	cpu_energy: task_power_info;
	gpu_energy: gpu_energy_data;
	task_ptime: number;
	task_pset_switches: number;
}
declare var task_power_info_v2: interop.StructType<task_power_info_v2>;

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

	TASK_DEFAULT_APPLICATION = 7,

	TASK_DARWINBG_APPLICATION = 8
}

declare function task_sample(task: number, reply: number): number;

declare function task_self_trap(): number;

declare function task_set_emulation(target_port: number, routine_entry_pt: number, routine_number: number): number;

declare function task_set_emulation_vector(task: number, vector_start: number, emulation_vector: interop.Pointer | interop.Reference<number>, emulation_vectorCnt: number): number;

declare function task_set_exc_guard_behavior(task: number, behavior: number): number;

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

interface task_thread_times_info {
	user_time: time_value;
	system_time: time_value;
}
declare var task_thread_times_info: interop.StructType<task_thread_times_info>;

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

interface task_trace_memory_info {
	user_memory_address: number;
	buffer_size: number;
	mailbox_array_size: number;
}
declare var task_trace_memory_info: interop.StructType<task_trace_memory_info>;

interface task_vm_info {
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
	ledger_phys_footprint_peak: number;
	ledger_purgeable_nonvolatile: number;
	ledger_purgeable_novolatile_compressed: number;
	ledger_purgeable_volatile: number;
	ledger_purgeable_volatile_compressed: number;
	ledger_tag_network_nonvolatile: number;
	ledger_tag_network_nonvolatile_compressed: number;
	ledger_tag_network_volatile: number;
	ledger_tag_network_volatile_compressed: number;
	ledger_tag_media_footprint: number;
	ledger_tag_media_footprint_compressed: number;
	ledger_tag_media_nofootprint: number;
	ledger_tag_media_nofootprint_compressed: number;
	ledger_tag_graphics_footprint: number;
	ledger_tag_graphics_footprint_compressed: number;
	ledger_tag_graphics_nofootprint: number;
	ledger_tag_graphics_nofootprint_compressed: number;
	ledger_tag_neural_footprint: number;
	ledger_tag_neural_footprint_compressed: number;
	ledger_tag_neural_nofootprint: number;
	ledger_tag_neural_nofootprint_compressed: number;
	limit_bytes_remaining: number;
	decompressions: number;
}
declare var task_vm_info: interop.StructType<task_vm_info>;

interface task_wait_state_info {
	total_wait_state_time: number;
	total_wait_sfi_state_time: number;
	_reserved: interop.Reference<number>;
}
declare var task_wait_state_info: interop.StructType<task_wait_state_info>;

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

declare function tcdrain(p1: number): number;

declare function tcflow(p1: number, p2: number): number;

declare function tcflush(p1: number, p2: number): number;

declare function tcgetattr(p1: number, p2: interop.Pointer | interop.Reference<termios>): number;

declare function tcgetpgrp(p1: number): number;

declare function tcgetsid(p1: number): number;

interface tcp_connection_info {
	tcpi_state: number;
	tcpi_snd_wscale: number;
	tcpi_rcv_wscale: number;
	__pad1: number;
	tcpi_options: number;
	tcpi_flags: number;
	tcpi_rto: number;
	tcpi_maxseg: number;
	tcpi_snd_ssthresh: number;
	tcpi_snd_cwnd: number;
	tcpi_snd_wnd: number;
	tcpi_snd_sbbytes: number;
	tcpi_rcv_wnd: number;
	tcpi_rttcur: number;
	tcpi_srtt: number;
	tcpi_rttvar: number;
	tcpi_tfo_cookie_req: number;
	tcpi_tfo_cookie_rcv: number;
	tcpi_tfo_syn_loss: number;
	tcpi_tfo_syn_data_sent: number;
	tcpi_tfo_syn_data_acked: number;
	tcpi_tfo_syn_data_rcv: number;
	tcpi_tfo_cookie_req_rcv: number;
	tcpi_tfo_cookie_sent: number;
	tcpi_tfo_cookie_invalid: number;
	tcpi_tfo_cookie_wrong: number;
	tcpi_tfo_no_cookie_rcv: number;
	tcpi_tfo_heuristics_disable: number;
	tcpi_tfo_send_blackhole: number;
	tcpi_tfo_recv_blackhole: number;
	tcpi_tfo_onebyte_proxy: number;
	__pad2: number;
	tcpi_txpackets: number;
	tcpi_txbytes: number;
	tcpi_txretransmitbytes: number;
	tcpi_rxpackets: number;
	tcpi_rxbytes: number;
	tcpi_rxoutoforderbytes: number;
	tcpi_txretransmitpackets: number;
}
declare var tcp_connection_info: interop.StructType<tcp_connection_info>;

interface tcphdr {
	th_sport: number;
	th_dport: number;
	th_seq: number;
	th_ack: number;
	th_x2: number;
	th_off: number;
	th_flags: number;
	th_win: number;
	th_sum: number;
	th_urp: number;
}
declare var tcphdr: interop.StructType<tcphdr>;

declare function tcsendbreak(p1: number, p2: number): number;

declare function tcsetattr(p1: number, p2: number, p3: interop.Pointer | interop.Reference<termios>): number;

declare function tcsetpgrp(p1: number, p2: number): number;

declare function tdelete(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): interop.Pointer | interop.Reference<any>;

declare function telldir(p1: interop.Pointer | interop.Reference<DIR>): number;

declare function tempnam(__dir: string | interop.Pointer | interop.Reference<any>, __prefix: string | interop.Pointer | interop.Reference<any>): string;

interface termios {
	c_iflag: number;
	c_oflag: number;
	c_cflag: number;
	c_lflag: number;
	c_cc: interop.Reference<number>;
	c_ispeed: number;
	c_ospeed: number;
}
declare var termios: interop.StructType<termios>;

declare function tfind(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): interop.Pointer | interop.Reference<any>;

declare function tgamma(p1: number): number;

declare function tgammaf(p1: number): number;

declare function tgammal(p1: number): number;

declare function thread_abort(target_act: number): number;

declare function thread_abort_safely(target_act: number): number;

interface thread_affinity_policy {
	affinity_tag: number;
}
declare var thread_affinity_policy: interop.StructType<thread_affinity_policy>;

declare function thread_assign(thread: number, new_set: number): number;

declare function thread_assign_default(thread: number): number;

interface thread_background_policy {
	priority: number;
}
declare var thread_background_policy: interop.StructType<thread_background_policy>;

interface thread_basic_info {
	user_time: time_value;
	system_time: time_value;
	cpu_usage: number;
	policy: number;
	run_state: number;
	flags: number;
	suspend_count: number;
	sleep_time: number;
}
declare var thread_basic_info: interop.StructType<thread_basic_info>;

declare function thread_create(parent_task: number, child_act: interop.Pointer | interop.Reference<number>): number;

declare function thread_create_running(parent_task: number, flavor: number, new_state: interop.Pointer | interop.Reference<number>, new_stateCnt: number, child_act: interop.Pointer | interop.Reference<number>): number;

declare function thread_depress_abort(thread: number): number;

interface thread_extended_info {
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
declare var thread_extended_info: interop.StructType<thread_extended_info>;

interface thread_extended_policy {
	timeshare: number;
}
declare var thread_extended_policy: interop.StructType<thread_extended_policy>;

declare function thread_get_assignment(thread: number, assigned_set: interop.Pointer | interop.Reference<number>): number;

declare function thread_get_exception_ports(thread: number, exception_mask: number, masks: interop.Pointer | interop.Reference<number>, masksCnt: interop.Pointer | interop.Reference<number>, old_handlers: interop.Pointer | interop.Reference<number>, old_behaviors: interop.Pointer | interop.Reference<number>, old_flavors: interop.Pointer | interop.Reference<number>): number;

declare function thread_get_mach_voucher(thr_act: number, which: number, voucher: interop.Pointer | interop.Reference<number>): number;

declare function thread_get_special_port(thr_act: number, which_port: number, special_port: interop.Pointer | interop.Reference<number>): number;

declare function thread_get_state(target_act: number, flavor: number, old_state: interop.Pointer | interop.Reference<number>, old_stateCnt: interop.Pointer | interop.Reference<number>): number;

interface thread_identifier_info {
	thread_id: number;
	thread_handle: number;
	dispatch_qaddr: number;
}
declare var thread_identifier_info: interop.StructType<thread_identifier_info>;

declare function thread_info(target_act: number, flavor: number, thread_info_out: interop.Pointer | interop.Reference<number>, thread_info_outCnt: interop.Pointer | interop.Reference<number>): number;

interface thread_latency_qos_policy {
	thread_latency_qos_tier: number;
}
declare var thread_latency_qos_policy: interop.StructType<thread_latency_qos_policy>;

declare function thread_policy(thr_act: number, policy: number, base: interop.Pointer | interop.Reference<number>, baseCnt: number, set_limit: number): number;

declare function thread_policy_get(thread: number, flavor: number, policy_info: interop.Pointer | interop.Reference<number>, policy_infoCnt: interop.Pointer | interop.Reference<number>, get_default: interop.Pointer | interop.Reference<number>): number;

declare function thread_policy_set(thread: number, flavor: number, policy_info: interop.Pointer | interop.Reference<number>, policy_infoCnt: number): number;

interface thread_precedence_policy {
	importance: number;
}
declare var thread_precedence_policy: interop.StructType<thread_precedence_policy>;

declare function thread_resume(target_act: number): number;

declare function thread_sample(thread: number, reply: number): number;

declare function thread_set_exception_ports(thread: number, exception_mask: number, new_port: number, behavior: number, new_flavor: number): number;

declare function thread_set_mach_voucher(thr_act: number, voucher: number): number;

declare function thread_set_policy(thr_act: number, pset: number, policy: number, base: interop.Pointer | interop.Reference<number>, baseCnt: number, limit: interop.Pointer | interop.Reference<number>, limitCnt: number): number;

declare function thread_set_special_port(thr_act: number, which_port: number, special_port: number): number;

declare function thread_set_state(target_act: number, flavor: number, new_state: interop.Pointer | interop.Reference<number>, new_stateCnt: number): number;

interface thread_standard_policy {
	no_data: number;
}
declare var thread_standard_policy: interop.StructType<thread_standard_policy>;

declare function thread_suspend(target_act: number): number;

declare function thread_swap_exception_ports(thread: number, exception_mask: number, new_port: number, behavior: number, new_flavor: number, masks: interop.Pointer | interop.Reference<number>, masksCnt: interop.Pointer | interop.Reference<number>, old_handlers: interop.Pointer | interop.Reference<number>, old_behaviors: interop.Pointer | interop.Reference<number>, old_flavors: interop.Pointer | interop.Reference<number>): number;

declare function thread_swap_mach_voucher(thr_act: number, new_voucher: number, old_voucher: interop.Pointer | interop.Reference<number>): number;

declare function thread_switch(thread_name: number, option: number, option_time: number): number;

declare function thread_terminate(target_act: number): number;

interface thread_throughput_qos_policy {
	thread_throughput_qos_tier: number;
}
declare var thread_throughput_qos_policy: interop.StructType<thread_throughput_qos_policy>;

interface thread_time_constraint_policy {
	period: number;
	computation: number;
	constraint: number;
	preemptible: number;
}
declare var thread_time_constraint_policy: interop.StructType<thread_time_constraint_policy>;

declare function thread_wire(host_priv: number, thread: number, wired: number): number;

declare function time(p1: interop.Pointer | interop.Reference<number>): number;

declare function time2posix(p1: number): number;

interface time_value {
	seconds: number;
	microseconds: number;
}
declare var time_value: interop.StructType<time_value>;

interface timeb {
	time: number;
	millitm: number;
	timezone: number;
	dstflag: number;
}
declare var timeb: interop.StructType<timeb>;

declare function timegm(p1: interop.Pointer | interop.Reference<tm>): number;

declare function timelocal(p1: interop.Pointer | interop.Reference<tm>): number;

declare function times(p1: interop.Pointer | interop.Reference<tms>): number;

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

interface timeval32 {
	tv_sec: number;
	tv_usec: number;
}
declare var timeval32: interop.StructType<timeval32>;

interface timeval64 {
	tv_sec: number;
	tv_usec: number;
}
declare var timeval64: interop.StructType<timeval64>;

declare var timezone: number;

interface timezoneStruct {
	tz_minuteswest: number;
	tz_dsttime: number;
}
declare var timezoneStruct: interop.StructType<timezoneStruct>;

declare function timingsafe_bcmp(__b1: interop.Pointer | interop.Reference<any>, __b2: interop.Pointer | interop.Reference<any>, __len: number): number;

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

declare function tmpnam(p1: string | interop.Pointer | interop.Reference<any>): string;

interface tms {
	tms_utime: number;
	tms_stime: number;
	tms_cutime: number;
	tms_cstime: number;
}
declare var tms: interop.StructType<tms>;

declare function towctrans(p1: number, p2: number): number;

declare function towctrans_l(p1: number, p2: number, p3: interop.Pointer | interop.Reference<any>): number;

declare function trunc(p1: number): number;

declare function truncate(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function truncf(p1: number): number;

declare function truncl(p1: number): number;

declare function tsearch(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): interop.Pointer | interop.Reference<any>;

declare function ttyaction(tty: string | interop.Pointer | interop.Reference<any>, act: string | interop.Pointer | interop.Reference<any>, user: string | interop.Pointer | interop.Reference<any>): number;

declare function ttylock(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<number>): number;

declare function ttymsg(p1: interop.Pointer | interop.Reference<iovec>, p2: number, p3: string | interop.Pointer | interop.Reference<any>, p4: number): string;

declare function ttyname(p1: number): string;

declare function ttyname_r(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

interface ttysize {
	ts_lines: number;
	ts_cols: number;
	ts_xxx: number;
	ts_yyy: number;
}
declare var ttysize: interop.StructType<ttysize>;

declare function ttyslot(): number;

declare function ttyunlock(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function twalk(p1: interop.Pointer | interop.Reference<any>, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: VISIT, p3: number) => void>): void;

declare var tzname: interop.Reference<string>;

declare function tzset(): void;

declare function tzsetwall(): void;

declare function ualarm(p1: number, p2: number): number;

declare const enum uio_rw {

	UIO_READ = 0,

	UIO_WRITE = 1
}

declare function umask(p1: number): number;

declare function uname(p1: interop.Pointer | interop.Reference<utsname>): number;

declare function undelete(p1: string | interop.Pointer | interop.Reference<any>): number;

declare const underline: number;

declare function ungetc(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function ungetwc(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function ungetwc_l(p1: number, p2: interop.Pointer | interop.Reference<FILE>, p3: interop.Pointer | interop.Reference<any>): number;

declare function unlink(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function unlinkat(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function unlockpt(p1: number): number;

declare function unmount(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function unsetenv(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function unwhiteout(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function user_from_uid(p1: number, p2: number): string;

declare function usleep(p1: number): number;

interface utimbuf {
	actime: number;
	modtime: number;
}
declare var utimbuf: interop.StructType<utimbuf>;

declare function utime(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<utimbuf>): number;

declare function utimensat(__fd: number, __path: string | interop.Pointer | interop.Reference<any>, __times: interop.Reference<timespec>, __flag: number): number;

declare function utimes(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<timeval>): number;

interface utmpx {
	ut_user: interop.Reference<number>;
	ut_id: interop.Reference<number>;
	ut_line: interop.Reference<number>;
	ut_pid: number;
	ut_type: number;
	ut_tv: timeval;
	ut_host: interop.Reference<number>;
	ut_pad: interop.Reference<number>;
}
declare var utmpx: interop.StructType<utmpx>;

declare function utmpxname(p1: string | interop.Pointer | interop.Reference<any>): number;

interface utsname {
	sysname: interop.Reference<number>;
	nodename: interop.Reference<number>;
	release: interop.Reference<number>;
	version: interop.Reference<number>;
	machine: interop.Reference<number>;
}
declare var utsname: interop.StructType<utsname>;

declare function uuid_clear(uu: interop.Reference<number>): void;

declare function uuid_compare(uu1: interop.Reference<number>, uu2: interop.Reference<number>): number;

declare function uuid_copy(dst: interop.Reference<number>, src: interop.Reference<number>): void;

declare function uuid_generate(out: interop.Reference<number>): void;

declare function uuid_generate_early_random(out: interop.Reference<number>): void;

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

interface vfs_server {
	vs_minutes: number;
	vs_server_name: interop.Reference<number>;
}
declare var vfs_server: interop.StructType<vfs_server>;

interface vfsconf {
	vfc_reserved1: number;
	vfc_name: interop.Reference<number>;
	vfc_typenum: number;
	vfc_refcount: number;
	vfc_flags: number;
	vfc_reserved2: number;
	vfc_reserved3: number;
}
declare var vfsconf: interop.StructType<vfsconf>;

interface vfsidctl {
	vc_vers: number;
	vc_fsid: fsid_t;
	vc_ptr: interop.Pointer | interop.Reference<any>;
	vc_len: number;
	vc_spare: interop.Reference<number>;
}
declare var vfsidctl: interop.StructType<vfsidctl>;

interface vfsquery {
	vq_flags: number;
	vq_spare: interop.Reference<number>;
}
declare var vfsquery: interop.StructType<vfsquery>;

interface vfsstatfs {
	f_bsize: number;
	f_iosize: number;
	f_blocks: number;
	f_bfree: number;
	f_bavail: number;
	f_bused: number;
	f_files: number;
	f_ffree: number;
	f_fsid: fsid_t;
	f_owner: number;
	f_flags: number;
	f_fstypename: interop.Reference<number>;
	f_mntonname: interop.Reference<number>;
	f_mntfromname: interop.Reference<number>;
	f_fssubtype: number;
	f_reserved: interop.Reference<interop.Pointer | interop.Reference<any>>;
}
declare var vfsstatfs: interop.StructType<vfsstatfs>;

declare const enum virtual_memory_guard_exception_codes {

	kGUARD_EXC_DEALLOC_GAP = 1
}

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

declare function vm_map_exec_lockdown(target_task: number): number;

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
	object_id_full: number;
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

interface vmspace {
	dummy: number;
	dummy2: string;
	dummy3: interop.Reference<number>;
	dummy4: interop.Reference<string>;
}
declare var vmspace: interop.StructType<vmspace>;

interface vol_attributes_attr_t {
	validattr: attribute_set_t;
	nativeattr: attribute_set_t;
}
declare var vol_attributes_attr_t: interop.StructType<vol_attributes_attr_t>;

interface vol_capabilities_attr_t {
	capabilities: interop.Reference<number>;
	valid: interop.Reference<number>;
}
declare var vol_capabilities_attr_t: interop.StructType<vol_capabilities_attr_t>;

declare function voucher_mach_msg_adopt(msg: interop.Pointer | interop.Reference<mach_msg_header_t>): interop.Pointer | interop.Reference<any>;

declare function voucher_mach_msg_clear(msg: interop.Pointer | interop.Reference<mach_msg_header_t>): void;

declare function voucher_mach_msg_revert(state: interop.Pointer | interop.Reference<any>): void;

declare function voucher_mach_msg_set(msg: interop.Pointer | interop.Reference<mach_msg_header_t>): number;

declare function wait(p1: interop.Pointer | interop.Reference<number>): number;

declare function wait3(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: interop.Pointer | interop.Reference<rusage>): number;

declare function wait4(p1: number, p2: interop.Pointer | interop.Reference<number>, p3: number, p4: interop.Pointer | interop.Reference<rusage>): number;

declare function waitpid(p1: number, p2: interop.Pointer | interop.Reference<number>, p3: number): number;

declare function wcpcpy(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function wcpncpy(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number): interop.Pointer | interop.Reference<number>;

declare function wcscasecmp(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): number;

declare function wcscasecmp_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<any>): number;

declare function wcscat(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function wcschr(p1: interop.Pointer | interop.Reference<number>, p2: number): interop.Pointer | interop.Reference<number>;

declare function wcscmp(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): number;

declare function wcscoll(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): number;

declare function wcscoll_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<any>): number;

declare function wcscpy(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function wcscspn(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): number;

declare function wcsdup(p1: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function wcsftime(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<tm>): number;

declare function wcsftime_l(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<tm>, p5: interop.Pointer | interop.Reference<any>): number;

declare function wcslcat(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number): number;

declare function wcslcpy(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number): number;

declare function wcslen(p1: interop.Pointer | interop.Reference<number>): number;

declare function wcsncasecmp(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, n: number): number;

declare function wcsncasecmp_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, n: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function wcsncat(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number): interop.Pointer | interop.Reference<number>;

declare function wcsncmp(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number): number;

declare function wcsncpy(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number): interop.Pointer | interop.Reference<number>;

declare function wcsnlen(p1: interop.Pointer | interop.Reference<number>, p2: number): number;

declare function wcspbrk(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function wcsrchr(p1: interop.Pointer | interop.Reference<number>, p2: number): interop.Pointer | interop.Reference<number>;

declare function wcsspn(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): number;

declare function wcsstr(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function wcstod(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>): number;

declare function wcstod_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: interop.Pointer | interop.Reference<any>): number;

declare function wcstof(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>): number;

declare function wcstof_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: interop.Pointer | interop.Reference<any>): number;

declare function wcstoimax(__nptr: interop.Pointer | interop.Reference<number>, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, __base: number): number;

declare function wcstoimax_l(nptr: interop.Pointer | interop.Reference<number>, endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, base: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function wcstok(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>): interop.Pointer | interop.Reference<number>;

declare function wcstol(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: number): number;

declare function wcstol_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function wcstold(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>): number;

declare function wcstold_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: interop.Pointer | interop.Reference<any>): number;

declare function wcstoll(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: number): number;

declare function wcstoll_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function wcstombs(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: number): number;

declare function wcstombs_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function wcstoul(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: number): number;

declare function wcstoul_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function wcstoull(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: number): number;

declare function wcstoull_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function wcstoumax(__nptr: interop.Pointer | interop.Reference<number>, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, __base: number): number;

declare function wcstoumax_l(nptr: interop.Pointer | interop.Reference<number>, endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, base: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function wcswidth(p1: interop.Pointer | interop.Reference<number>, p2: number): number;

declare function wcswidth_l(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: interop.Pointer | interop.Reference<any>): number;

declare function wcsxfrm(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number): number;

declare function wcsxfrm_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function wctob(p1: number): number;

declare function wctob_l(p1: number, p2: interop.Pointer | interop.Reference<any>): number;

declare function wctomb(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function wctomb_l(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<any>): number;

declare function wctrans(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function wctrans_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>): number;

declare function wctype(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function wctype_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>): number;

declare function wcwidth(p1: number): number;

declare function wcwidth_l(p1: number, p2: interop.Pointer | interop.Reference<any>): number;

interface wide {
	lo: number;
	hi: number;
}
declare var wide: interop.StructType<wide>;

interface winsize {
	ws_row: number;
	ws_col: number;
	ws_xpixel: number;
	ws_ypixel: number;
}
declare var winsize: interop.StructType<winsize>;

declare function wmemchr(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: number): interop.Pointer | interop.Reference<number>;

declare function wmemcmp(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number): number;

declare function wmemcpy(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number): interop.Pointer | interop.Reference<number>;

declare function wmemmove(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number): interop.Pointer | interop.Reference<number>;

declare function wmemset(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: number): interop.Pointer | interop.Reference<number>;

interface wordexp_t {
	we_wordc: number;
	we_wordv: interop.Pointer | interop.Reference<string>;
	we_offs: number;
}
declare var wordexp_t: interop.StructType<wordexp_t>;

declare function write(__fd: number, __buf: interop.Pointer | interop.Reference<any>, __nbyte: number): number;

declare function writev(p1: number, p2: interop.Pointer | interop.Reference<iovec>, p3: number): number;

declare function wtmpxname(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function xattr_flags_from_name(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function xattr_intent_with_flags(p1: number, p2: number): number;

declare function xattr_name_with_flags(p1: string | interop.Pointer | interop.Reference<any>, p2: number): string;

declare function xattr_name_without_flags(p1: string | interop.Pointer | interop.Reference<any>): string;

declare function xattr_preserve_for_intent(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

interface xsw_usage {
	xsu_total: number;
	xsu_avail: number;
	xsu_used: number;
	xsu_pagesize: number;
	xsu_encrypted: number;
}
declare var xsw_usage: interop.StructType<xsw_usage>;

interface xucred {
	cr_version: number;
	cr_uid: number;
	cr_ngroups: number;
	cr_groups: interop.Reference<number>;
}
declare var xucred: interop.StructType<xucred>;

declare function y0(p1: number): number;

declare function y1(p1: number): number;

declare function yn(p1: number, p2: number): number;

interface zone_btrecord_t {
	ref_count: number;
	operation_type: number;
	bt: interop.Reference<number>;
}
declare var zone_btrecord_t: interop.StructType<zone_btrecord_t>;

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

declare function zopen(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): interop.Pointer | interop.Reference<FILE>;
