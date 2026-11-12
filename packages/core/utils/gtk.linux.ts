/**
 * GTK helpers shared by the Linux modules.
 */

/** A GObject / GtkWidget pointer (C returns are always interop.Pointer at runtime). */
export type GPointer = any;

/** `interop.types.pointer` (not in the shared interop typings). */
export const pointerType: interop.Type<any> = (interop.types as any).pointer;

/** Storage for a `T**` out parameter. */
export function outPointer(): interop.Reference<any> {
	return new interop.Reference(pointerType, null);
}

/** Numeric address of a native pointer, stable across Pointer wrappers. */
export function addressOf(ptr: any): number {
	return ptr ? (ptr as any).toNumber() : 0;
}

/** Takes ownership of a new (floating) GObject. */
export function own<T extends interop.Pointer>(object: T): T {
	if (object) {
		g_object_ref_sink(object);
	}
	return object;
}

export function release(object: any): void {
	if (object) {
		g_object_unref(object);
	}
}

type Handler = (...args: any[]) => any;

const handlers = new Map<number, Handler>();
let nextHandlerId = 1;
const trampolines = new Map<string, interop.Pointer>();

/** C type of a signal argument. */
export type SignalArg = 'pointer' | 'int' | 'uint' | 'double';

const ARG_TYPES: Record<SignalArg, () => interop.Type<any>> = {
	pointer: () => pointerType,
	int: () => interop.types.int32,
	uint: () => interop.types.uint32,
	double: () => interop.types.double,
};

/**
 * One C trampoline per signal signature; user_data carries the handler id.
 * `args` are the signal's arguments after the instance.
 */
function trampoline(args: SignalArg[], returns: 'void' | 'bool'): any {
	const key = `${args.join(',')}:${returns}`;
	let cb = trampolines.get(key);
	if (!cb) {
		const dispatch = (...params: any[]) => {
			const handler = handlers.get(addressOf(params[params.length - 1]));
			const result = handler ? handler(...params.slice(0, -1)) : undefined;
			return returns === 'bool' ? (result ? 1 : 0) : undefined;
		};
		cb = interop.callback(dispatch, {
			returns: returns === 'bool' ? interop.types.int32 : interop.types.void,
			args: [pointerType, ...args.map((a) => ARG_TYPES[a]()), pointerType],
		});
		trampolines.set(key, cb);
	}
	return cb;
}

export interface SignalOptions {
	/** Pointer-sized arguments after the instance (e.g. 1 for `notify::*`'s GParamSpec). */
	args?: number;
	/** Typed arguments after the instance, e.g. ['double', 'double'] for `drag-update`. */
	types?: SignalArg[];
	/** The handler returns a gboolean (e.g. `close-request`). */
	returnsBool?: boolean;
}

/**
 * Connects `handler(instance, ...args)` to `signal`; returns a disconnect function.
 */
export function connect(instance: any, signal: string, handler: Handler, options: SignalOptions = {}): () => void {
	const id = nextHandlerId++;
	handlers.set(id, handler);
	const types = options.types ?? Array.from({ length: options.args ?? 0 }, (): SignalArg => 'pointer');
	const handlerId = g_signal_connect_data(instance, signal, trampoline(types, options.returnsBool ? 'bool' : 'void') as any, new interop.Pointer(id), null, 0 as any);
	return () => {
		if (handlers.delete(id)) {
			g_signal_handler_disconnect(instance, handlerId);
		}
	};
}

/** RGBA in 0..1 floats as used by GdkRGBA, from 0..255 components. */
export function rgba(r: number, g: number, b: number, a: number): string {
	return `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`;
}
