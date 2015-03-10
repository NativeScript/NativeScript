/// <reference path="../../../../zone/zone.d.ts" />
export declare class VmTurnZone {
    _outerZone: Zone;
    _innerZone: Zone;
    _onTurnStart: Function;
    _onTurnDone: Function;
    _onErrorHandler: Function;
    _nestedRunCounter: number;
    constructor(_0: {
        enableLongStackTrace: any;
    });
    initCallbacks(_0?: any): void;
    run(fn: any): void;
    runOutsideAngular(fn: any): void;
    _createInnerZone(zone: any, enableLongStackTrace: any): any;
    _beforeTask(): void;
    _afterTask(): void;
    _onError(zone: any, e: any): void;
}
