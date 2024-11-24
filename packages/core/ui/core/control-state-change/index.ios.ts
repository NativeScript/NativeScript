/* tslint:disable:no-unused-variable */
import { ControlStateChangeListener as ControlStateChangeListenerDefinition } from '.';

@NativeClass
class ObserverClass extends NSObject {
	public callback: WeakRef<(state: string, add: boolean) => void>;

	public static initWithCallback(callback: WeakRef<(state: string, add: boolean) => void>): ObserverClass {
		const observer = <ObserverClass>ObserverClass.alloc().init();
		observer.callback = callback;

		return observer;
	}

	public observeValueForKeyPathOfObjectChangeContext(path: string, object: UIControl) {
		const callback = this.callback?.deref();

		if (callback) {
			callback(path, object[path]);
		}
	}
}

export class ControlStateChangeListener implements ControlStateChangeListenerDefinition {
	private _observer: NSObject;
	private _control: UIControl;
	private _observing: boolean = false;

	// States like :disabled are handled elsewhere
	private readonly _states: string[] = ['highlighted'];

	constructor(control: UIControl, callback: (state: string, add: boolean) => void) {
		this._observer = ObserverClass.initWithCallback(new WeakRef(callback));
		this._control = control;
	}

	public start() {
		if (!this._observing) {
			this._observing = true;

			for (const state of this._states) {
				this._control.addObserverForKeyPathOptionsContext(this._observer, state, NSKeyValueObservingOptions.New, null);
			}
		}
	}

	public stop() {
		if (this._observing) {
			for (const state of this._states) {
				this._control.removeObserverForKeyPath(this._observer, state);
			}

			this._observing = false;
		}
	}
}
