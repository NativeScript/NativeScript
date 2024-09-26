
declare function _Exit(p1: number): void;

declare function _exit(p1: number): void;

declare function access(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

interface accessx_descriptor {
	ad_name_offset: number;
	ad_flags: number;
	ad_pad: interop.Reference<number>;
}
declare var accessx_descriptor: interop.StructType<accessx_descriptor>;

declare function accessx_np(p1: interop.Pointer | interop.Reference<accessx_descriptor>, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: number): number;

declare function acct(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function add_profil(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: number): number;

declare function alarm(p1: number): number;

declare function brk(p1: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function chdir(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function chown(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: number): number;

declare function chroot(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function close(p1: number): number;

declare function confstr(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function crypt(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function dup(p1: number): number;

declare function dup2(p1: number, p2: number): number;

declare function encrypt(p1: string | interop.Pointer | interop.Reference<any>, p2: number): void;

declare function endusershell(): void;

declare function exchangedata(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function execv(__path: string | interop.Pointer | interop.Reference<any>, __argv: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function execvP(__file: string | interop.Pointer | interop.Reference<any>, __searchpath: string | interop.Pointer | interop.Reference<any>, __argv: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function execve(__file: string | interop.Pointer | interop.Reference<any>, __argv: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __envp: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function execvp(__file: string | interop.Pointer | interop.Reference<any>, __argv: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 8.0
 */
declare function faccessat(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: number): number;

declare function fchdir(p1: number): number;

declare function fchown(p1: number, p2: number, p3: number): number;

/**
 * @since 8.0
 */
declare function fchownat(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: number, p5: number): number;

declare function fflagstostr(p1: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 3.0
 */
declare function ffsctl(p1: number, p2: number, p3: interop.Pointer | interop.Reference<any>, p4: number): number;

/**
 * @since 3.0
 */
declare function fgetattrlist(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: number): number;

declare function fork(): number;

declare function fpathconf(p1: number, p2: number): number;

/**
 * @since 16.0
 */
declare function freadlink(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function fsctl(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<any>, p4: number): number;

/**
 * @since 3.0
 */
declare function fsetattrlist(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: number): number;

declare function fsync(p1: number): number;

/**
 * @since 6.0
 */
declare function fsync_volume_np(p1: number, p2: number): number;

declare function ftruncate(p1: number, p2: number): number;

declare function getattrlist(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: number): number;

/**
 * @since 8.0
 */
declare function getattrlistat(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<any>, p5: number, p6: number): number;

/**
 * @since 8.0
 */
declare function getattrlistbulk(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: number): number;

declare function getcwd(p1: string | interop.Pointer | interop.Reference<any>, p2: number): interop.Pointer | interop.Reference<any>;

declare function getdirentriesattr(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: interop.Pointer | interop.Reference<number>, p6: interop.Pointer | interop.Reference<number>, p7: interop.Pointer | interop.Reference<number>, p8: number): number;

declare function getdomainname(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function getdtablesize(): number;

declare function getegid(): number;

declare function geteuid(): number;

declare function getgid(): number;

declare function getgrouplist(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>): number;

declare function getgroups(p1: number, p2: interop.Reference<number>): number;

declare function gethostid(): number;

declare function gethostname(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function getlogin(): interop.Pointer | interop.Reference<any>;

declare function getlogin_r(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function getmode(p1: interop.Pointer | interop.Reference<any>, p2: number): number;

declare function getopt(p1: number, p2: interop.Reference<interop.Pointer | interop.Reference<any>>, p3: string | interop.Pointer | interop.Reference<any>): number;

declare function getpagesize(): number;

declare function getpass(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function getpeereid(p1: number, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>): number;

declare function getpgid(p1: number): number;

declare function getpgrp(): number;

declare function getpid(): number;

declare function getppid(): number;

declare function getsgroups_np(p1: interop.Pointer | interop.Reference<number>, p2: interop.Reference<number>): number;

declare function getsid(p1: number): number;

declare function getsubopt(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function getuid(): number;

declare function getusershell(): interop.Pointer | interop.Reference<any>;

declare function getwd(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function getwgroups_np(p1: interop.Pointer | interop.Reference<number>, p2: interop.Reference<number>): number;

declare function initgroups(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function iruserok(p1: number, p2: number, p3: string | interop.Pointer | interop.Reference<any>, p4: string | interop.Pointer | interop.Reference<any>): number;

declare function iruserok_sa(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: string | interop.Pointer | interop.Reference<any>, p5: string | interop.Pointer | interop.Reference<any>): number;

declare function isatty(p1: number): number;

declare function issetugid(): number;

declare function lchown(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: number): number;

declare function link(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function linkat(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: string | interop.Pointer | interop.Reference<any>, p5: number): number;

declare function lockf(p1: number, p2: number, p3: number): number;

declare function lseek(p1: number, p2: number, p3: number): number;

declare function mkdtemp(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 11.0
 */
declare function mkdtempat_np(dfd: number, path: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function mknod(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: number): number;

/**
 * @since 10.0
 */
declare function mkostemp(path: string | interop.Pointer | interop.Reference<any>, oflags: number): number;

/**
 * @since 10.0
 */
declare function mkostemps(path: string | interop.Pointer | interop.Reference<any>, slen: number, oflags: number): number;

/**
 * @since 11.0
 */
declare function mkostempsat_np(dfd: number, path: string | interop.Pointer | interop.Reference<any>, slen: number, oflags: number): number;

/**
 * @since 5.0
 */
declare function mkpath_np(path: string | interop.Pointer | interop.Reference<any>, omode: number): number;

/**
 * @since 10.0
 */
declare function mkpathat_np(dfd: number, path: string | interop.Pointer | interop.Reference<any>, omode: number): number;

declare function mkstemp(p1: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 10.0
 */
declare function mkstemp_dprotected_np(path: string | interop.Pointer | interop.Reference<any>, dpclass: number, dpflags: number): number;

declare function mkstemps(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

/**
 * @since 11.0
 */
declare function mkstempsat_np(dfd: number, path: string | interop.Pointer | interop.Reference<any>, slen: number): number;

declare function mktemp(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nfssvc(p1: number, p2: interop.Pointer | interop.Reference<any>): number;

declare function nice(p1: number): number;

declare var optarg: interop.Pointer | interop.Reference<any>;

declare var opterr: number;

declare var optind: number;

declare var optopt: number;

declare var optreset: number;

declare function pathconf(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function pause(): number;

declare function pipe(p1: interop.Reference<number>): number;

declare function pread(__fd: number, __buf: interop.Pointer | interop.Reference<any>, __nbyte: number, __offset: number): number;

declare function profil(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: number): number;

declare function pthread_getugid_np(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): number;

declare function pthread_setugid_np(p1: number, p2: number): number;

declare function pwrite(__fd: number, __buf: interop.Pointer | interop.Reference<any>, __nbyte: number, __offset: number): number;

declare function rcmd(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: number, p3: string | interop.Pointer | interop.Reference<any>, p4: string | interop.Pointer | interop.Reference<any>, p5: string | interop.Pointer | interop.Reference<any>, p6: interop.Pointer | interop.Reference<number>): number;

declare function rcmd_af(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: number, p3: string | interop.Pointer | interop.Reference<any>, p4: string | interop.Pointer | interop.Reference<any>, p5: string | interop.Pointer | interop.Reference<any>, p6: interop.Pointer | interop.Reference<number>, p7: number): number;

declare function read(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number): number;

declare function readlink(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

/**
 * @since 8.0
 */
declare function readlinkat(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: string | interop.Pointer | interop.Reference<any>, p4: number): number;

declare function reboot(p1: number): number;

declare function revoke(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function rmdir(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function rresvport(p1: interop.Pointer | interop.Reference<number>): number;

declare function rresvport_af(p1: interop.Pointer | interop.Reference<number>, p2: number): number;

declare function ruserok(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: string | interop.Pointer | interop.Reference<any>, p4: string | interop.Pointer | interop.Reference<any>): number;

declare function sbrk(p1: number): interop.Pointer | interop.Reference<any>;

declare function searchfs(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<fssearchblock>, p3: interop.Pointer | interop.Reference<number>, p4: number, p5: number, p6: interop.Pointer | interop.Reference<searchstate>): number;

declare function setattrlist(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: number): number;

/**
 * @since 11.0
 */
declare function setattrlistat(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<any>, p5: number, p6: number): number;

declare function setdomainname(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function setegid(p1: number): number;

declare function seteuid(p1: number): number;

declare function setgid(p1: number): number;

declare function setgroups(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function sethostid(p1: number): void;

declare function sethostname(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function setkey(p1: string | interop.Pointer | interop.Reference<any>): void;

declare function setlogin(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function setmode(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function setpgid(p1: number, p2: number): number;

declare function setpgrp(): number;

declare function setregid(p1: number, p2: number): number;

declare function setreuid(p1: number, p2: number): number;

declare function setrgid(p1: number): number;

declare function setruid(p1: number): number;

declare function setsgroups_np(p1: number, p2: interop.Reference<number>): number;

declare function setsid(): number;

declare function setuid(p1: number): number;

declare function setusershell(): void;

declare function setwgroups_np(p1: number, p2: interop.Reference<number>): number;

declare function sleep(p1: number): number;

declare function strtofflags(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>): number;

declare var suboptarg: interop.Pointer | interop.Reference<any>;

declare function swab(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number): void;

declare function swapon(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function symlink(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function symlinkat(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: string | interop.Pointer | interop.Reference<any>): number;

declare function sync(): void;

/**
 * @since 6.0
 */
declare function sync_volume_np(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function sysconf(p1: number): number;

declare function tcgetpgrp(p1: number): number;

declare function tcsetpgrp(p1: number, p2: number): number;

declare function truncate(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function ttyname(p1: number): interop.Pointer | interop.Reference<any>;

declare function ttyname_r(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function ttyslot(): number;

declare function ualarm(p1: number, p2: number): number;

declare function undelete(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function unlink(p1: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function unlinkat(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function unwhiteout(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function usleep(p1: number): number;

declare function valloc(p1: number): interop.Pointer | interop.Reference<any>;

declare function vfork(): number;

declare function write(__fd: number, __buf: interop.Pointer | interop.Reference<any>, __nbyte: number): number;
