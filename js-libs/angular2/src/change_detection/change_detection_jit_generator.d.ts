import { ProtoRecord } from './proto_change_detector';
export declare class ChangeDetectorJITGenerator {
    typeName: string;
    records: List<ProtoRecord>;
    localNames: List<string>;
    changeNames: List<string>;
    fieldNames: List<string>;
    constructor(typeName: string, records: List<ProtoRecord>);
    getLocalNames(records: List<ProtoRecord>): List<string>;
    getChangeNames(localNames: List<string>): List<string>;
    getFieldNames(localNames: List<string>): List<string>;
    generate(): Function;
    genConstructor(): string;
    genSetContext(): string;
    genDetectChanges(): string;
    genBody(): string;
    genLocalDefinitions(): string;
    genChangeDefinitions(): string;
    genRecord(r: ProtoRecord): string;
    getStructuralCheck(r: ProtoRecord): string;
    genReferenceCheck(r: ProtoRecord): string;
    genUpdateCurrentValue(r: ProtoRecord): string;
    ifChangedGuard(r: ProtoRecord, body: string): string;
    genInterpolation(r: ProtoRecord): string;
    genLiteral(value: any): string;
    genNotify(r: any): string;
    genArgs(r: ProtoRecord): string;
}
