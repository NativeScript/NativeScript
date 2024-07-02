
declare function atomic_signal_fence(p1: memory_order): void;

declare function atomic_thread_fence(p1: memory_order): void;

declare const enum memory_order {

	relaxed = 0,

	consume = 1,

	acquire = 2,

	release = 3,

	acq_rel = 4,

	seq_cst = 5
}
