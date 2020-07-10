/**
 * An utility class used for supporting styling infrastructure.
 * WARNING: This class is intended for IOS only.
 */
export class ControlStateChangeListener {
	/**
	 * Initializes an instance of ControlStateChangeListener class.
	 * @param control An instance of the UIControl which state will be watched.
	 * @param callback A callback called when a visual state of the UIControl is changed.
	 */
	constructor(control: any /* UIControl */, callback: (state: string) => void);

	start();
	stop();
}
