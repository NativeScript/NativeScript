import { OpaqueToken } from 'angular2/di';
import { Binding } from 'angular2/src/di/binding';
export declare var appViewToken: OpaqueToken;
export declare var appChangeDetectorToken: OpaqueToken;
export declare var appElementToken: OpaqueToken;
export declare var appComponentAnnotatedTypeToken: OpaqueToken;
export declare var appDocumentToken: OpaqueToken;
export declare function bootstrap(appComponentType: Type, bindings?: List<Binding>, givenBootstrapErrorReporter?: Function): Promise<any>;
