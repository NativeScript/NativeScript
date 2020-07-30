// import nativeClassTransformerFactory from './ns-transform-native-classes';
import { AngularCompilerPlugin } from '@ngtools/webpack';
import { StandardTransform, TransformOperation, makeTransform, ReplaceNodeOperation, collectDeepNodes } from '@ngtools/webpack/src/transformers';
import * as ts from 'typescript';

// function findAngularCompilerPlugin(webpackCfg): AngularCompilerPlugin | null {
// 	return webpackCfg.plugins.find((plugin) => plugin instanceof AngularCompilerPlugin);
// }

// The AngularCompilerPlugin has nog public API to add transformations, user private API _transformers instead.
// function addTransformerToAngularCompilerPlugin(acp, transformer): void {
// 	acp._transformers = [transformer, ...acp._transformers];
// }

export function nsTransformNativeClassesNg(getNgCompiler: () => AngularCompilerPlugin, entryPath: string): ts.TransformerFactory<ts.SourceFile> {
 
	const standardTransform: StandardTransform = function (sourceFile: ts.SourceFile) {
    let ops: TransformOperation[] = [];

		try {
			ops = handleNativeClasses(sourceFile);
		} catch (e) {
			ops = [];
		}

		return ops;
	};

	return makeTransform(standardTransform, () => getNgCompiler().typeChecker);
}

// export default {
// 	pre() {},

// 	// This hook is used to manipulate the webpack configuration
// 	config(cfg) {
// 		// Find the AngularCompilerPlugin in the webpack configuration
// 		const angularCompilerPlugin = findAngularCompilerPlugin(cfg);

// 		if (!angularCompilerPlugin) {
// 			console.error('Could not inject the typescript transformer: Webpack AngularCompilerPlugin not found');
// 			return;
// 		}

// 		addTransformerToAngularCompilerPlugin(angularCompilerPlugin, nativeClassTransformerFactory(<any>angularCompilerPlugin));
// 		return cfg;
// 	},

// 	post() {},
// };


export function handleNativeClasses(mainFile: ts.SourceFile): TransformOperation[] {
  let ops: TransformOperation[] = [];
  
  function isNativeClassExtension(node: ts.ClassDeclaration) {
		return node.decorators && node.decorators.filter((d) => d.getFullText().trim().indexOf('@NativeClass') === 0).length > 0;
  }
  function createHelper(node: ts.Node) {
		// we remove the decorator for now!
		return ts.createIdentifier(
			ts.transpileModule(node.getText().replace(/@NativeClass(\((.|\n)*?\))?/gm, ''), {
				compilerOptions: { noEmitHelpers: true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES5 },
			}).outputText
		);
  }

  // get all class nodes
  const classNodesInFile: Array<ts.ClassDeclaration> = collectDeepNodes(mainFile, ts.SyntaxKind.ClassDeclaration);
	if (!classNodesInFile || !classNodesInFile.length) {
		return [];
  }
  const nativeClassNodes: Array<ts.ClassDeclaration> = [];
  for (const node of classNodesInFile) {
    // check is classes are decorated with NativeClass
    if (isNativeClassExtension(node)) {
      nativeClassNodes.push(node);
    }
  }
  if (!nativeClassNodes || !nativeClassNodes.length) {
		return [];
  }
  for (const node of nativeClassNodes) {
    // create transformation
    ops.push(new ReplaceNodeOperation(mainFile, node, createHelper(node)));
  }

  return ops;
}
