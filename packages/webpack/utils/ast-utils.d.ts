import * as ts from 'typescript';
export declare function getMainModulePath(entryFilePath: string, tsConfigName: string): string;
export declare function findBootstrapModuleCall(mainPath: string): ts.CallExpression | null;
export declare function findBootstrapModuleCallInSource(source: ts.SourceFile): ts.CallExpression | null;
export declare function findNativeScriptPlatformCallInSource(source: ts.SourceFile): ts.CallExpression | null;
export declare function findMethodCallInSource(source: ts.SourceFile, methodName: string): ts.CallExpression | null;
export declare function findBootstrappedModulePath(mainPath: string): string;
export declare function findBootstrappedModulePathInSource(source: ts.SourceFile): string;
export declare function findNativeScriptPlatformPathInSource(source: ts.SourceFile): string;
export declare function getAppModulePath(mainPath: string): string;
export declare function findIdentifierNode(node: ts.Node, text: string): ts.Node | null;
export declare function getObjectPropertyMatches(objectNode: ts.ObjectLiteralExpression, sourceFile: ts.SourceFile, targetPropertyName: string): ts.ObjectLiteralElement[];
export declare function getDecoratorMetadata(source: ts.SourceFile, identifier: string, module: string): ts.Node[];
export declare function angularImportsFromNode(node: ts.ImportDeclaration, _sourceFile: ts.SourceFile): {
    [name: string]: string;
};
export declare function getExpressionName(expression: ts.Expression): string;
