import { NgElement } from 'angular2/core';
import { ControlGroup, Control } from './model';
export declare class ControlGroupDirectiveBase {
    addDirective(directive: any): void;
    findControl(name: string): Control;
}
export declare class ControlValueAccessor {
    readValue(el: any): void;
    writeValue(el: any, value: any): void;
}
export declare class ControlDirectiveBase {
    _groupDecorator: ControlGroupDirectiveBase;
    _el: NgElement;
    controlName: string;
    type: string;
    valueAccessor: ControlValueAccessor;
    constructor(groupDecorator: any, el: NgElement);
    _initialize(): void;
    _updateDomValue(): void;
    _updateControlValue(): void;
    _control(): Control;
}
export declare class ControlNameDirective extends ControlDirectiveBase {
    constructor(groupDecorator: ControlGroupDirective, el: NgElement);
    onChange(_: any): void;
}
export declare class ControlDirective extends ControlDirectiveBase {
    constructor(groupDecorator: NewControlGroupDirective, el: NgElement);
    onChange(_: any): void;
}
export declare class ControlGroupDirective extends ControlGroupDirectiveBase {
    _controlGroup: ControlGroup;
    _directives: List<ControlNameDirective>;
    constructor();
    controlGroup: ControlGroup;
    addDirective(c: ControlNameDirective): void;
    findControl(name: string): Control;
}
export declare class NewControlGroupDirective extends ControlGroupDirectiveBase {
    _initData: any;
    _controlGroup: ControlGroup;
    _directives: List<ControlNameDirective>;
    constructor();
    initData: any;
    addDirective(c: ControlDirective): void;
    findControl(name: string): Control;
    _createControlGroup(): ControlGroup;
    value: {};
}
export declare var FormDirectives: (typeof ControlNameDirective | typeof ControlDirective | typeof ControlGroupDirective | typeof NewControlGroupDirective)[];
