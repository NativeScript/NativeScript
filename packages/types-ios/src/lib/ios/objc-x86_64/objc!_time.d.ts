
declare function asctime(p1: interop.Pointer | interop.Reference<tm>): interop.Pointer | interop.Reference<any>;

declare function asctime_r(p1: interop.Pointer | interop.Reference<tm>, p2: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function clock(): number;

/**
 * @since 10.0
 */
declare function clock_getres(__clock_id: clockid_t, __res: interop.Pointer | interop.Reference<timespec>): number;

/**
 * @since 10.0
 */
declare function clock_gettime(__clock_id: clockid_t, __tp: interop.Pointer | interop.Reference<timespec>): number;

/**
 * @since 10.0
 */
declare function clock_gettime_nsec_np(__clock_id: clockid_t): number;

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

declare function ctime(p1: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

declare function ctime_r(p1: interop.Pointer | interop.Reference<number>, p2: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare var daylight: number;

declare function difftime(p1: number, p2: number): number;

declare function getdate(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<tm>;

declare var getdate_err: number;

declare function gmtime(p1: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<tm>;

declare function gmtime_r(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<tm>): interop.Pointer | interop.Reference<tm>;

declare function localtime(p1: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<tm>;

declare function localtime_r(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<tm>): interop.Pointer | interop.Reference<tm>;

declare function mktime(p1: interop.Pointer | interop.Reference<tm>): number;

declare function nanosleep(__rqtp: interop.Pointer | interop.Reference<timespec>, __rmtp: interop.Pointer | interop.Reference<timespec>): number;

declare function posix2time(p1: number): number;

declare function strftime(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: string | interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<tm>): number;

declare function strftime_l(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: string | interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<tm>, p5: interop.Pointer | interop.Reference<any>): number;

declare function strptime(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<tm>): interop.Pointer | interop.Reference<any>;

declare function strptime_l(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<tm>, p4: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function time(p1: interop.Pointer | interop.Reference<number>): number;

declare function time2posix(p1: number): number;

declare function timegm(p1: interop.Pointer | interop.Reference<tm>): number;

declare function timelocal(p1: interop.Pointer | interop.Reference<tm>): number;

interface timespec {
	tv_sec: number;
	tv_nsec: number;
}
declare var timespec: interop.StructType<timespec>;

/**
 * @since 13.0
 */
declare function timespec_get(ts: interop.Pointer | interop.Reference<timespec>, base: number): number;

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
	tm_zone: interop.Pointer | interop.Reference<any>;
}
declare var tm: interop.StructType<tm>;

declare var tzname: interop.Reference<interop.Pointer | interop.Reference<any>>;

declare function tzset(): void;

declare function tzsetwall(): void;
