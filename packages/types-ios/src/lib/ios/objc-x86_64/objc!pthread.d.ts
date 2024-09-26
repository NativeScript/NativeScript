
/**
 * @since 2.0
 */
declare function pthread_atfork(p1: interop.FunctionReference<() => void>, p2: interop.FunctionReference<() => void>, p3: interop.FunctionReference<() => void>): number;

/**
 * @since 2.0
 */
declare function pthread_attr_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>): number;

/**
 * @since 8.0
 */
declare function pthread_attr_get_qos_class_np(__attr: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, __qos_class: interop.Pointer | interop.Reference<qos_class_t>, __relative_priority: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_attr_getdetachstate(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_attr_getguardsize(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_attr_getinheritsched(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_attr_getschedparam(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<sched_param>): number;

/**
 * @since 2.0
 */
declare function pthread_attr_getschedpolicy(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_attr_getscope(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_attr_getstack(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_attr_getstackaddr(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 2.0
 */
declare function pthread_attr_getstacksize(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_attr_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>): number;

/**
 * @since 8.0
 */
declare function pthread_attr_set_qos_class_np(__attr: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, __qos_class: qos_class_t, __relative_priority: number): number;

/**
 * @since 2.0
 */
declare function pthread_attr_setdetachstate(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_attr_setguardsize(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_attr_setinheritsched(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_attr_setschedparam(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<sched_param>): number;

/**
 * @since 2.0
 */
declare function pthread_attr_setschedpolicy(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_attr_setscope(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_attr_setstack(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<any>, p3: number): number;

/**
 * @since 2.0
 */
declare function pthread_attr_setstackaddr(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function pthread_attr_setstacksize(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_cancel(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>): number;

/**
 * @since 2.0
 */
declare function pthread_cond_broadcast(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t>): number;

/**
 * @since 2.0
 */
declare function pthread_cond_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t>): number;

/**
 * @since 2.0
 */
declare function pthread_cond_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t>, p2: interop.Pointer | interop.Reference<_opaque_pthread_condattr_t>): number;

/**
 * @since 2.0
 */
declare function pthread_cond_signal(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t>): number;

/**
 * @since 2.0
 */
declare function pthread_cond_signal_thread_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t>, p2: interop.Pointer | interop.Reference<_opaque_pthread_t>): number;

/**
 * @since 2.0
 */
declare function pthread_cond_timedwait(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t>, p2: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t>, p3: interop.Pointer | interop.Reference<timespec>): number;

/**
 * @since 2.0
 */
declare function pthread_cond_timedwait_relative_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t>, p2: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t>, p3: interop.Pointer | interop.Reference<timespec>): number;

/**
 * @since 2.0
 */
declare function pthread_cond_wait(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t>, p2: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t>): number;

/**
 * @since 2.0
 */
declare function pthread_condattr_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_condattr_t>): number;

/**
 * @since 2.0
 */
declare function pthread_condattr_getpshared(p1: interop.Pointer | interop.Reference<_opaque_pthread_condattr_t>, p2: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_condattr_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_condattr_t>): number;

/**
 * @since 2.0
 */
declare function pthread_condattr_setpshared(p1: interop.Pointer | interop.Reference<_opaque_pthread_condattr_t>, p2: number): number;

/**
 * @since 14.2
 */
declare function pthread_cpu_number_np(cpu_number_out: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_create(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_opaque_pthread_t>>, p2: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>, p4: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function pthread_create_suspended_np(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_opaque_pthread_t>>, p2: interop.Pointer | interop.Reference<_opaque_pthread_attr_t>, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>, p4: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function pthread_detach(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>): number;

/**
 * @since 2.0
 */
declare function pthread_equal(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>, p2: interop.Pointer | interop.Reference<_opaque_pthread_t>): number;

/**
 * @since 2.0
 */
declare function pthread_exit(p1: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 */
declare function pthread_from_mach_thread_np(p1: number): interop.Pointer | interop.Reference<_opaque_pthread_t>;

/**
 * @since 8.0
 */
declare function pthread_get_qos_class_np(__pthread: interop.Pointer | interop.Reference<_opaque_pthread_t>, __qos_class: interop.Pointer | interop.Reference<qos_class_t>, __relative_priority: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_get_stackaddr_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function pthread_get_stacksize_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>): number;

/**
 * @since 2.0
 */
declare function pthread_getconcurrency(): number;

/**
 * @since 3.2
 */
declare function pthread_getname_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

/**
 * @since 2.0
 */
declare function pthread_getschedparam(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<sched_param>): number;

/**
 * @since 2.0
 */
declare function pthread_getspecific(p1: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function pthread_is_threaded_np(): number;

/**
 * @since 17.4
 */
declare function pthread_jit_write_freeze_callbacks_np(): void;

/**
 * @since 17.4
 */
declare function pthread_jit_write_protect_supported_np(): number;

/**
 * @since 17.4
 */
declare function pthread_jit_write_with_callback_np(callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>, ctx: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function pthread_join(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 2.0
 */
declare function pthread_key_create(p1: interop.Pointer | interop.Reference<number>, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): number;

/**
 * @since 2.0
 */
declare function pthread_key_delete(p1: number): number;

/**
 * @since 2.0
 */
declare function pthread_kill(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_mach_thread_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>): number;

/**
 * @since 2.0
 */
declare function pthread_main_np(): number;

/**
 * @since 2.0
 */
declare function pthread_mutex_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t>): number;

/**
 * @since 2.0
 */
declare function pthread_mutex_getprioceiling(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t>, p2: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_mutex_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t>, p2: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>): number;

/**
 * @since 2.0
 */
declare function pthread_mutex_lock(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t>): number;

/**
 * @since 2.0
 */
declare function pthread_mutex_setprioceiling(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t>, p2: number, p3: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_mutex_trylock(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t>): number;

/**
 * @since 2.0
 */
declare function pthread_mutex_unlock(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t>): number;

/**
 * @since 2.0
 */
declare function pthread_mutexattr_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>): number;

/**
 * @since 11.3
 */
declare function pthread_mutexattr_getpolicy_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>, p2: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_mutexattr_getprioceiling(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>, p2: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_mutexattr_getprotocol(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>, p2: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_mutexattr_getpshared(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>, p2: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_mutexattr_gettype(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>, p2: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_mutexattr_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>): number;

/**
 * @since 5.0
 */
declare function pthread_mutexattr_setpolicy_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_mutexattr_setprioceiling(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_mutexattr_setprotocol(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_mutexattr_setpshared(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_mutexattr_settype(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t>, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_once(p1: interop.Pointer | interop.Reference<_opaque_pthread_once_t>, p2: interop.FunctionReference<() => void>): number;

/**
 * @since 8.0
 */
declare function pthread_override_qos_class_end_np(__override: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function pthread_override_qos_class_start_np(__pthread: interop.Pointer | interop.Reference<_opaque_pthread_t>, __qos_class: qos_class_t, __relative_priority: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function pthread_rwlock_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t>): number;

/**
 * @since 2.0
 */
declare function pthread_rwlock_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t>, p2: interop.Pointer | interop.Reference<_opaque_pthread_rwlockattr_t>): number;

/**
 * @since 2.0
 */
declare function pthread_rwlock_rdlock(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t>): number;

/**
 * @since 2.0
 */
declare function pthread_rwlock_tryrdlock(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t>): number;

/**
 * @since 2.0
 */
declare function pthread_rwlock_trywrlock(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t>): number;

/**
 * @since 2.0
 */
declare function pthread_rwlock_unlock(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t>): number;

/**
 * @since 2.0
 */
declare function pthread_rwlock_wrlock(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t>): number;

/**
 * @since 2.0
 */
declare function pthread_rwlockattr_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlockattr_t>): number;

/**
 * @since 2.0
 */
declare function pthread_rwlockattr_getpshared(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlockattr_t>, p2: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_rwlockattr_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlockattr_t>): number;

/**
 * @since 2.0
 */
declare function pthread_rwlockattr_setpshared(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlockattr_t>, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_self(): interop.Pointer | interop.Reference<_opaque_pthread_t>;

/**
 * @since 8.0
 */
declare function pthread_set_qos_class_self_np(__qos_class: qos_class_t, __relative_priority: number): number;

/**
 * @since 2.0
 */
declare function pthread_setcancelstate(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_setcanceltype(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_setconcurrency(p1: number): number;

/**
 * @since 3.2
 */
declare function pthread_setname_np(p1: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function pthread_setschedparam(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>, p2: number, p3: interop.Pointer | interop.Reference<sched_param>): number;

/**
 * @since 2.0
 */
declare function pthread_setspecific(p1: number, p2: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function pthread_sigmask(p1: number, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_testcancel(): void;

/**
 * @since 3.2
 */
declare function pthread_threadid_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>, p2: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function pthread_yield_np(): void;

declare function sched_get_priority_max(p1: number): number;

declare function sched_get_priority_min(p1: number): number;

interface sched_param {
	sched_priority: number;
	__opaque: interop.Reference<number>;
}
declare var sched_param: interop.StructType<sched_param>;

declare function sched_yield(): number;
