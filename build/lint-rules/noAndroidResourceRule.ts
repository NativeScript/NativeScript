import * as Lint from "tslint";
import * as ts from "typescript";

export class Rule extends Lint.Rules.AbstractRule {
    static FAILURE_STRING = "Use of android.R is forbidden, because of performance reasons. Use a constant instead.";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new Walk(sourceFile, this.getOptions()));
    }
}

class Walk extends Lint.RuleWalker {
    protected visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
        if (node.name.getText() === "R" && node.expression.getText() === "android") {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
        }

        super.visitPropertyAccessExpression(node);
    }
}