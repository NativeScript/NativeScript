import { AbstractChangeDetector } from './abstract_change_detector';
import { SimpleChange } from './change_detection_util';
import { ProtoRecord } from './proto_change_detector';
export declare class DynamicChangeDetector extends AbstractChangeDetector {
    dispatcher: any;
    formatters: Map<any, any>;
    values: List<any>;
    changes: List<any>;
    protos: List<ProtoRecord>;
    constructor(dispatcher: any, formatters: Map<any, any>, protoRecords: List<ProtoRecord>);
    setContext(context: any): void;
    detectChangesInRecords(throwOnChange: boolean): void;
    _check(proto: ProtoRecord): SimpleChange;
    _referenceCheck(proto: ProtoRecord): SimpleChange;
    _calculateCurrValue(proto: ProtoRecord): any;
    _structuralCheck(proto: ProtoRecord): SimpleChange;
    _readContext(proto: ProtoRecord): any;
    _readSelf(proto: ProtoRecord): any;
    _writeSelf(proto: ProtoRecord, value: any): void;
    _setChanged(proto: ProtoRecord, value: boolean): void;
    _pureFuncAndArgsDidNotChange(proto: ProtoRecord): boolean;
    _argsChanged(proto: ProtoRecord): boolean;
    _readArgs(proto: ProtoRecord): List<any>;
}
