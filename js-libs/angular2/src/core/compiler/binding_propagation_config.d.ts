import { ChangeDetector } from 'angular2/change_detection';
export declare class BindingPropagationConfig {
    _cd: ChangeDetector;
    constructor(cd: ChangeDetector);
    shouldBePropagated(): void;
    shouldBePropagatedFromRoot(): void;
    shouldNotPropagate(): void;
    shouldAlwaysPropagate(): void;
}
