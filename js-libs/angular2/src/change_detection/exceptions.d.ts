import { ProtoRecord } from './proto_change_detector';
export declare class ExpressionChangedAfterItHasBeenChecked extends Error {
    message: string;
    constructor(proto: ProtoRecord, change: any);
    toString(): string;
}
export declare class ChangeDetectionError extends Error {
    message: string;
    originalException: any;
    location: string;
    constructor(proto: ProtoRecord, originalException: any);
    toString(): string;
}
