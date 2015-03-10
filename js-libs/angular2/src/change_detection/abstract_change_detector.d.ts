import { ChangeDetector } from './interfaces';
export declare class AbstractChangeDetector extends ChangeDetector {
    children: List<any>;
    parent: ChangeDetector;
    mode: string;
    constructor();
    addChild(cd: ChangeDetector): void;
    removeChild(cd: ChangeDetector): void;
    remove(): void;
    detectChanges(): void;
    checkNoChanges(): void;
    _detectChanges(throwOnChange: boolean): void;
    detectChangesInRecords(throwOnChange: boolean): void;
    _detectChangesInChildren(throwOnChange: boolean): void;
    markPathToRootAsCheckOnce(): void;
}
