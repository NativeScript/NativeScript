export * from './button-common';

import { ButtonBase } from './button-common';
import { PseudoClassHandler } from '../core/view';
import { connect } from '../../utils/gtk.linux';

export class Button extends ButtonBase {
	private _label: any;
	private _disconnect: (() => void)[] = [];

	public createNativeView() {
		const button: any = gtk_button_new();
		this._label = gtk_label_new(null);
		gtk_button_set_child(button, this._label);
		return button;
	}

	get linux(): any {
		return this.nativeViewProtected;
	}

	// @ts-ignore
	get nativeTextViewProtected(): any {
		return this._label;
	}

	public initNativeView(): void {
		super.initNativeView();
		const owner = new WeakRef(this);
		const button = this.nativeViewProtected;
		this._disconnect.push(connect(button, 'clicked', () => owner.deref()?.notify({ eventName: ButtonBase.tapEvent, object: owner.deref() })));
		(this as any)._applyWrapping();
	}

	public disposeNativeView(): void {
		for (const disconnect of this._disconnect.splice(0)) {
			disconnect();
		}
		this._label = null;
		super.disposeNativeView();
	}

	@PseudoClassHandler('normal', 'highlighted', 'pressed', 'active')
	_updateButtonStateChangeHandler(subscribe: boolean) {
		const button = this.nativeViewProtected;
		if (!button) {
			return;
		}
		if (subscribe) {
			const owner = new WeakRef(this);
			// GTK's :active state drives the highlighted pseudo-class
			this._disconnect.push(
				connect(
					button,
					'state-flags-changed',
					() => {
						const view = owner.deref();
						if (!view?.nativeViewProtected) return;
						if (gtk_widget_get_state_flags(view.nativeViewProtected) & GtkStateFlags.ACTIVE) {
							view._addVisualState('highlighted');
						} else {
							view._removeVisualState('highlighted');
						}
					},
					{ args: 1 },
				),
			);
		} else {
			this._removeVisualState('highlighted');
		}
	}
}
