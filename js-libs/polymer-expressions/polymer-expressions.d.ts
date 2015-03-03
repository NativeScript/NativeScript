//@private
declare module "js-libs/polymer-expressions" {
    class PolymerExpressions {
        static getExpression(expression: string): Expression;
    }

    class Expression {
        getValue(model);
    }
}

