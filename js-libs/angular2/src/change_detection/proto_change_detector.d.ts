import { AST } from './parser/ast';
import { ChangeDetector } from './interfaces';
import { DynamicChangeDetector } from './dynamic_change_detector';
export declare const RECORD_TYPE_SELF: number;
export declare const RECORD_TYPE_CONST: number;
export declare const RECORD_TYPE_PRIMITIVE_OP: number;
export declare const RECORD_TYPE_PROPERTY: number;
export declare const RECORD_TYPE_INVOKE_METHOD: number;
export declare const RECORD_TYPE_INVOKE_CLOSURE: number;
export declare const RECORD_TYPE_KEYED_ACCESS: number;
export declare const RECORD_TYPE_INVOKE_FORMATTER: number;
export declare const RECORD_TYPE_STRUCTURAL_CHECK: number;
export declare const RECORD_TYPE_INTERPOLATE: number;
export declare class ProtoRecord {
    mode: number;
    name: string;
    funcOrValue: any;
    args: List<any>;
    fixedArgs: List<any>;
    contextIndex: number;
    selfIndex: number;
    bindingMemento: any;
    directiveMemento: any;
    lastInBinding: boolean;
    lastInDirective: boolean;
    expressionAsString: string;
    constructor(mode: number, name: string, funcOrValue: any, args: List<any>, fixedArgs: List<any>, contextIndex: number, selfIndex: number, bindingMemento: any, directiveMemento: any, expressionAsString: string, lastInBinding: boolean, lastInDirective: boolean);
    isPureFunction(): boolean;
}
export declare class ProtoChangeDetector {
    addAst(ast: AST, bindingMemento: any, directiveMemento?: any, structural?: boolean): void;
    instantiate(dispatcher: any, formatters: Map<any, any>): ChangeDetector;
}
export declare class DynamicProtoChangeDetector extends ProtoChangeDetector {
    _records: List<ProtoRecord>;
    _recordBuilder: ProtoRecordBuilder;
    constructor();
    addAst(ast: AST, bindingMemento: any, directiveMemento?: any, structural?: boolean): void;
    instantiate(dispatcher: any, formatters: Map<any, any>): DynamicChangeDetector;
    _createRecordsIfNecessary(): void;
}
export declare class JitProtoChangeDetector extends ProtoChangeDetector {
    _factory: Function;
    _recordBuilder: ProtoRecordBuilder;
    constructor();
    addAst(ast: AST, bindingMemento: any, directiveMemento?: any, structural?: boolean): void;
    instantiate(dispatcher: any, formatters: Map<any, any>): any;
    _createFactoryIfNecessary(): void;
}
export declare class ProtoRecordBuilder {
    records: List<ProtoRecord>;
    constructor();
    addAst(ast: AST, bindingMemento: any, directiveMemento?: any, structural?: boolean): void;
}
