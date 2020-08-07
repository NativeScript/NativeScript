import { normalize } from 'path';
import * as ts from 'typescript';
import { AddNodeOperation, ReplaceNodeOperation, StandardTransform, TransformOperation, collectDeepNodes, makeTransform, insertStarImport } from '@ngtools/webpack/src/transformers';
import { AngularCompilerPlugin } from '@ngtools/webpack';
import { findBootstrappedModulePathInSource, findNativeScriptPlatformPathInSource, findBootstrapModuleCallInSource, findNativeScriptPlatformCallInSource, getExpressionName } from '../utils/ast-utils';

export function nsSupportHmrNg(getNgCompiler: () => AngularCompilerPlugin, entryPath: string): ts.TransformerFactory<ts.SourceFile> {
	const standardTransform: StandardTransform = function (sourceFile: ts.SourceFile) {
		let ops: TransformOperation[] = [];

		if (!entryPath || normalize(sourceFile.fileName) !== normalize(entryPath)) {
			return ops;
		}

		try {
			ops = handleHmrSupport(sourceFile);
		} catch (e) {
			ops = [];
		}

		return ops;
	};

	return makeTransform(standardTransform, () => getNgCompiler().typeChecker);
}

export function handleHmrSupport(mainFile: ts.SourceFile): TransformOperation[] {
	const importNodesInFile = collectDeepNodes(mainFile, ts.SyntaxKind.ImportDeclaration);
	if (!importNodesInFile || !importNodesInFile.length) {
		return [];
	}

	const bootstrapModuleCallNode = findBootstrapModuleCallInSource(mainFile);
	if (!bootstrapModuleCallNode || !bootstrapModuleCallNode.arguments || !bootstrapModuleCallNode.arguments.length) {
		return [];
	}

	const appModuleName = getExpressionName(bootstrapModuleCallNode.arguments[0]);
	const nativeScriptPlatformCallNode = findNativeScriptPlatformCallInSource(mainFile);
	if (!nativeScriptPlatformCallNode || !nativeScriptPlatformCallNode.arguments) {
		return [];
	}

	return handleHmrSupportCore(mainFile, importNodesInFile, appModuleName, nativeScriptPlatformCallNode);
}

function handleHmrSupportCore(mainFile: ts.SourceFile, importNodesInFile: ts.Node[], appModuleName: string, nativeScriptPlatformCallNode: ts.CallExpression) {
	const firstImportNode = importNodesInFile[0];
	const lastImportNode = importNodesInFile[importNodesInFile.length - 1];
	const appModulePath = findBootstrappedModulePathInSource(mainFile);
	if (!appModuleName || !appModulePath) {
		return [];
	}

	let currentAppOptionsInitializationNode: ts.Expression = ts.createObjectLiteral();
	if (nativeScriptPlatformCallNode.arguments.length > 0) {
		currentAppOptionsInitializationNode = nativeScriptPlatformCallNode.arguments[0];
	}

	const optionsDeclaration = ts.createVariableDeclaration(GeneratedDynamicAppOptions, undefined, ts.createObjectLiteral());
	const optionsDeclarationList = ts.createVariableDeclarationList([optionsDeclaration]);
	const optionsStatement = ts.createVariableStatement(undefined, optionsDeclarationList);

	const setHmrOptionsNode = ts.createIdentifier(getHmrOptionsCode(appModuleName, appModulePath));

	const acceptHmrNode = ts.createIdentifier(getAcceptMainModuleCode(appModulePath));

	const objectAssignNode = ts.createPropertyAccess(ts.createIdentifier('Object'), ts.createIdentifier('assign'));
	const extendAppOptionsNode = ts.createCall(objectAssignNode, undefined, [currentAppOptionsInitializationNode, ts.createIdentifier(GeneratedDynamicAppOptions)]);

	const newNsDynamicCallArgs = ts.createNodeArray([extendAppOptionsNode, ...nativeScriptPlatformCallNode.arguments.slice(1)]);
	const nsPlatformPath = findNativeScriptPlatformPathInSource(mainFile);
	const nsPlatformText = getExpressionName(nativeScriptPlatformCallNode.expression);
	const newNsDynamicCallNode = ts.createCall(ts.createPropertyAccess(ts.createIdentifier(NsNgPlatformStarImport), ts.createIdentifier(nsPlatformText)), [], newNsDynamicCallArgs);

	return [...insertStarImport(mainFile, ts.createIdentifier(NsNgPlatformStarImport), nsPlatformPath, firstImportNode, true), new AddNodeOperation(mainFile, lastImportNode, undefined, optionsStatement), new AddNodeOperation(mainFile, lastImportNode, undefined, setHmrOptionsNode), new AddNodeOperation(mainFile, lastImportNode, undefined, acceptHmrNode), new ReplaceNodeOperation(mainFile, nativeScriptPlatformCallNode, newNsDynamicCallNode)];
}

export const GeneratedDynamicAppOptions = 'options_Generated';
const NsNgPlatformStarImport = 'nativescript_angular_platform_Generated';

export function getHmrOptionsCode(appModuleName: string, appModulePath: string) {
	return `
if (module["hot"]) {
    ${GeneratedDynamicAppOptions} = {
        hmrOptions: {
            moduleTypeFactory: function () { return require("${appModulePath}").${appModuleName}; },
            livesyncCallback: function (platformReboot) { setTimeout(platformReboot, 0); }
        }
    };
}
`;
}

export function getAcceptMainModuleCode(mainModulePath: string) {
	return `
if (module["hot"]) {
    module["hot"].accept(["${mainModulePath}"], function () {
        global["hmrRefresh"]({});
    });
}
`;
}
