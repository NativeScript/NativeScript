import * as ts from 'typescript';
import { TransformOperation } from '@ngtools/webpack/src/transformers';
import { AngularCompilerPlugin } from '@ngtools/webpack';
export declare function nsSupportHmrNg(getNgCompiler: () => AngularCompilerPlugin, entryPath: string): ts.TransformerFactory<ts.SourceFile>;
export declare function handleHmrSupport(mainFile: ts.SourceFile): TransformOperation[];
export declare const GeneratedDynamicAppOptions = "options_Generated";
export declare function getHmrOptionsCode(appModuleName: string, appModulePath: string): string;
export declare function getAcceptMainModuleCode(mainModulePath: string): string;
