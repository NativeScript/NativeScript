export declare class ChangeRecord {
    bindingMemento: any;
    change: any;
    constructor(bindingMemento: any, change: any);
    currentValue: any;
    previousValue: any;
}
/**
 * CHECK_ONCE means that after calling detectChanges the mode of the change detector
 * will become CHECKED.
 */
export declare const CHECK_ONCE: string;
/**
 * CHECKED means that the change detector should be skipped until its mode changes to
 * CHECK_ONCE or CHECK_ALWAYS.
 */
export declare const CHECKED: string;
/**
 * CHECK_ALWAYS means that after calling detectChanges the mode of the change detector
 * will remain CHECK_ALWAYS.
 */
export declare const CHECK_ALWAYS: string;
/**
 * DETACHED means that the change detector sub tree is not a part of the main tree and
 * should be skipped.
 */
export declare const DETACHED: string;
export declare class ChangeDispatcher {
    onRecordChange(directiveMemento: any, records: List<ChangeRecord>): void;
}
export declare class ChangeDetector {
    parent: ChangeDetector;
    mode: string;
    addChild(cd: ChangeDetector): void;
    removeChild(cd: ChangeDetector): void;
    remove(): void;
    setContext(context: any): void;
    markPathToRootAsCheckOnce(): void;
    detectChanges(): void;
    checkNoChanges(): void;
}
