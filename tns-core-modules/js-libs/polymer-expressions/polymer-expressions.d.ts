//@private
export class PolymerExpressions {
    static getExpression(expression: string): Expression;
}

export class Expression {
    /**
     * Evaluates a value for an expression.
     * @param model - Context of the expression.
     * @param isBackConvert - Denotes if the convertion is forward (from model to ui) or back (ui to model).
     * @param changedModel - A property bag which contains all changed properties (in case of two way binding).
     */
    getValue(model, isBackConvert, changedModel);
}
