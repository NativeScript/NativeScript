import * as ts from "typescript";

export default function (ctx: ts.TransformationContext) {
    function isNativeClassExtension(node: ts.ClassDeclaration) {
        return (
            node.decorators &&
            node.decorators.filter(
                (d) => d.getFullText().trim().indexOf("@NativeClass") === 0
            ).length > 0
        );
    }
    function visitNode(node: ts.Node): ts.Node {
        if (ts.isClassDeclaration(node) && isNativeClassExtension(node)) {
            return createHelper(node);
        }
        return ts.visitEachChild(node, visitNode, ctx);
    }

    function createHelper(node: ts.Node) {
        const decoratorIndex= node.decorators.findIndex(d=>d.getFullText().trim().indexOf("@NativeClass") === 0);
        node.decorators.slice(decoratorIndex, 1);
        return ts.createIdentifier(
            ts.transpileModule(node.getText(), {
                compilerOptions: { noEmitHelpers:true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES5 },
            }).outputText
        );
    }

    return (source: ts.SourceFile) =>
        ts.updateSourceFileNode(
            source,
            ts.visitNodes(source.statements, visitNode)
        );
}
