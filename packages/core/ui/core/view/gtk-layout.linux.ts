/**
 * Bridges NativeScript's measure/layout pass to GTK allocation.
 *
 * Container views are GtkFixed widgets with a custom layout manager: GTK asks
 * them for no size of their own, and when allocated they place each child at
 * the frame NativeScript computed for it. A root container (the window's child)
 * runs the NativeScript layout pass first, at the size GTK gave it.
 */
import { addressOf } from '../../../utils/gtk.linux';

export interface LinuxLayoutView {
	/** x, y, width, height relative to the parent, in logical pixels. */
	_linuxFrame: [number, number, number, number] | null;
	/** Rotation / scale / translation applied on top of the frame. */
	_linuxTransform(width: number, height: number): any;
	/** Runs the NativeScript layout pass for a root view. */
	_linuxLayoutRoot(width: number, height: number): void;
}

const views = new Map<number, WeakRef<LinuxLayoutView>>();

export function registerNativeView(widget: any, view: LinuxLayoutView): void {
	views.set(addressOf(widget), new WeakRef(view));
}

export function unregisterNativeView(widget: any): void {
	views.delete(addressOf(widget));
}

export function viewForWidget(widget: any): LinuxLayoutView | undefined {
	return views.get(addressOf(widget))?.deref();
}

/** A widget whose parent isn't one of our containers hosts a root view. */
function isRoot(widget: any): boolean {
	const parent = gtk_widget_get_parent(widget);
	return !parent || !viewForWidget(parent);
}

const minimum = new interop.Reference(interop.types.int32, 0);

function allocateChild(child: any, x: number, y: number, width: number, height: number, transform: any) {
	// GTK requires at least the minimum size; NativeScript may lay out smaller (clipped)
	gtk_widget_measure(child, GtkOrientation.HORIZONTAL, -1, minimum, null, null, null);
	width = Math.max(width, minimum.value);
	gtk_widget_measure(child, GtkOrientation.VERTICAL, width, minimum, null, null, null);
	height = Math.max(height, minimum.value);
	let position = gsk_transform_translate(null, new _graphene_point_t({ x, y }) as any);
	if (transform) {
		position = gsk_transform_transform(position, transform);
	}
	gtk_widget_allocate(child, width, height, -1, position);
}

let manager: { requestMode: Function; measure: Function; allocate: Function } | null = null;

function layoutCallbacks() {
	if (manager) {
		return manager;
	}
	manager = {
		requestMode: () => GtkSizeRequestMode.CONSTANT_SIZE,
		// containers take whatever size they are given (the window can shrink freely)
		measure: (_widget: any, _orientation: number, _forSize: number, min: any, nat: any) => {
			if (min) new interop.Reference(interop.types.int32, min).value = 0;
			if (nat) new interop.Reference(interop.types.int32, nat).value = 0;
		},
		allocate: (widget: any, width: number, height: number) => {
			const owner = viewForWidget(widget);
			if (owner && isRoot(widget)) {
				owner._linuxLayoutRoot(width, height);
			}
			for (let child = gtk_widget_get_first_child(widget); child; child = gtk_widget_get_next_sibling(child)) {
				if (!gtk_widget_should_layout(child)) {
					continue;
				}
				const view = viewForWidget(child);
				const frame = view?._linuxFrame;
				if (frame) {
					allocateChild(child, frame[0], frame[1], frame[2], frame[3], view._linuxTransform(frame[2], frame[3]));
				} else {
					allocateChild(child, 0, 0, width, height, null);
				}
			}
		},
	};
	return manager;
}

/** A GtkFixed laid out by NativeScript. */
export function createContainer(): any {
	const container = gtk_fixed_new();
	const { requestMode, measure, allocate } = layoutCallbacks();
	gtk_widget_set_layout_manager(container, gtk_custom_layout_new(requestMode as any, measure as any, allocate as any));
	gtk_widget_set_overflow(container, GtkOverflow.HIDDEN);
	return container;
}

/** Inserts `child` into `parent` at `index` among its children (append when out of range). */
export function insertChild(parent: any, child: any, index: number): void {
	let sibling = gtk_widget_get_first_child(parent);
	for (let i = 0; sibling && i < index; i++) {
		sibling = gtk_widget_get_next_sibling(sibling);
	}
	if (sibling && index >= 0) {
		gtk_widget_insert_before(child, parent, sibling);
	} else {
		gtk_widget_set_parent(child, parent);
	}
}
