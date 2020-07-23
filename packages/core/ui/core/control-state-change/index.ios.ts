/* tslint:disable:no-unused-variable */
import { ControlStateChangeListener as ControlStateChangeListenerDefinition } from '.';

@NativeClass
class ObserverClass extends NSObject {
	// NOTE: Refactor this - use Typescript property instead of strings....
	observeValueForKeyPathOfObjectChangeContext(path: string) {
		if (path === 'selected') {
			this['_owner']._onSelectedChanged();
		} else if (path === 'enabled') {
			this['_owner']._onEnabledChanged();
		} else if (path === 'highlighted') {
			this['_owner']._onHighlightedChanged();
		}
	}
}

export class ControlStateChangeListener implements ControlStateChangeListenerDefinition {
	private _observer: NSObject;
	private _control: UIControl;
	private _observing: boolean = false;

	private _callback: (state: string) => void;

	constructor(control: UIControl, callback: (state: string) => void) {
		this._observer = ObserverClass.alloc().init();
		this._observer['_owner'] = this;
		this._control = control;
		this._callback = callback;
	}

	public start() {
		if (!this._observing) {
			this._control.addObserverForKeyPathOptionsContext(this._observer, 'highlighted', NSKeyValueObservingOptions.New, null);
			this._observing = true;
			this._updateState();
		}
	}

	public stop() {
		if (this._observing) {
			this._observing = false;
			this._control.removeObserverForKeyPath(this._observer, 'highlighted');
		}
	}

	//@ts-ignore
	private _onEnabledChanged() {
		this._updateState();
	}

	//@ts-ignore
	private _onSelectedChanged() {
		this._updateState();
	}

	//@ts-ignore
	private _onHighlightedChanged() {
		this._updateState();
	}

	private _updateState() {
		let state = 'normal';
		if (this._control.highlighted) {
			state = 'highlighted';
		}
		this._callback(state);
	}
}
