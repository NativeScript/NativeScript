import { OnChange } from 'angular2/src/core/compiler/interfaces';
import { ViewContainer } from 'angular2/src/core/compiler/view_container';
export declare class Foreach extends OnChange {
    viewContainer: ViewContainer;
    iterable: any;
    constructor(viewContainer: ViewContainer);
    onChange(changes: any): void;
    perViewChange(view: any, record: any): void;
    static bulkRemove(tuples: any, viewContainer: any): any[];
    static bulkInsert(tuples: any, viewContainer: any): any;
}
