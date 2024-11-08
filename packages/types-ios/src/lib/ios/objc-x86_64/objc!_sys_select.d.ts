
/**
 * @since 14.0
 */
declare function __darwin_check_fd_set_overflow(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number): number;

interface fd_set {
	fds_bits: interop.Reference<number>;
}
declare var fd_set: interop.StructType<fd_set>;
