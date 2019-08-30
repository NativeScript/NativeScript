/* tslint:disable:no-unused-variable */
import { ControlStateChangeListener as ControlStateChangeListenerDefinition } from "./control-state-change";

export class ControlStateChangeListener implements ControlStateChangeListenerDefinition {
    constructor(control: any /* UIControl */, callback: (state: string) => void) {
        throw new Error("ControlStateChangeListener is not implemented for Android");
    }
    public start() { }
    public stop() { }
}
