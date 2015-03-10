import { ChangeDetector } from 'angular2/change_detection';
import { VmTurnZone } from 'angular2/src/core/zone/vm_turn_zone';
export declare class LifeCycle {
    _changeDetector: ChangeDetector;
    _enforceNoNewChanges: boolean;
    constructor(changeDetector?: ChangeDetector, enforceNoNewChanges?: boolean);
    registerWith(zone: VmTurnZone, changeDetector?: ChangeDetector): void;
    tick(): void;
}
