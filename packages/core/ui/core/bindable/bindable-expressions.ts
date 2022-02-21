import { parse } from 'acorn';
import { isFunction, isNullOrUndefined, isObject } from '../../../utils/types';

interface ASTExpression {
	readonly type: string;
	readonly [prop: string]: any;
}

const expressionsCache = {};

// prettier-ignore
const unaryOperators = {
	'+': (v) => +v,
	'-': (v) => -v,
	'!': (v) => !v,
	'void': (v) => void v,
	'typeof': (v) => typeof v
};

// prettier-ignore
const binaryOperators = {
	'+': (l, r) => l + r,
	'-': (l, r) => l - r,
	'*': (l, r) => l * r,
	'/': (l, r) => l / r,
	'%': (l, r) => l % r,
	'<': (l, r) => l < r,
	'>': (l, r) => l > r,
	'<=': (l, r) => l <= r,
	'>=': (l, r) => l >= r,
	'==': (l, r) => l == r,
	'!=': (l, r) => l != r,
	'===': (l, r) => l === r,
	'!==': (l, r) => l !== r,
	'|': (l, r) => l | r,
	'in': (l, r) => l in r,
	'instanceof': (l, r) => l instanceof r
};

// prettier-ignore
const logicalOperators = {
	'&&': (l, r) => l && r(),
	'||': (l, r) => l || r(),
	'??': (l, r) => l ?? r()
};

// prettier-ignore
const expressionParsers = {
	'ArrayExpression': (expression: ASTExpression, model, isBackConvert: boolean, changedModel) => {
		const parsed = [];
		for (let element of expression.elements) {
			let value = convertExpressionToValue(element, model, isBackConvert, changedModel);
			element.type == 'SpreadElement' ? parsed.push(...value) : parsed.push(value);
		}
		return parsed;
	},
	'BinaryExpression': (expression: ASTExpression, model, isBackConvert: boolean, changedModel) => {
		if (binaryOperators[expression.operator] == null) {
			throw new Error('Disallowed binary operator: ' + expression.operator);
		}

		const left = convertExpressionToValue(expression.left, model, isBackConvert, changedModel);

		if (expression.operator == '|' && expression.right.type == 'CallExpression') {
			expression.right.requiresConverter = true;
		}
		const right = convertExpressionToValue(expression.right, model, isBackConvert, changedModel);

		if (expression.operator == '|') {
			if (expression.right.requiresConverter && right != null) {
				right.args.unshift(left);
				return right.callback.apply(right.context, right.args);
			}
			throw new Error('Invalid converter after ' + expression.operator + ' operator');
		}
		return binaryOperators[expression.operator](left, right);
	},
	'CallExpression': (expression: ASTExpression, model, isBackConvert: boolean, changedModel) => {
		expression.callee.requiresObjectAndProperty = true;

		const { object, property } = convertExpressionToValue(expression.callee, model, isBackConvert, changedModel);

		let callback;
		if (object == '$forceChain') {
			callback = undefined;
		} else {
			callback = expression.callee.optional ? object?.[property] : object[property];
		}

		if ((!expression.optional || expression.requiresConverter) && isNullOrUndefined(callback)) {
			throw new Error('Cannot perform a call using a null or undefined property');
		}

		if (expression.requiresConverter) {
			if (isFunction(callback)) {
				callback = { toView: callback };
			} else if (!isObject(callback) || !isFunction(callback.toModel) && !isFunction(callback.toView)) {
				throw new Error('Invalid converter call');
			}
		}

		const parsedArgs = [];
		for (let argument of expression.arguments) {
			let value = convertExpressionToValue(argument, model, isBackConvert, changedModel);
			argument.type == 'SpreadElement' ? parsedArgs.push(...value) : parsedArgs.push(value);
		}

		if (expression.requiresConverter) {
			return getConverter(callback, object, parsedArgs, isBackConvert);
		}
		return expression.optional ? callback?.apply(object, parsedArgs) : callback.apply(object, parsedArgs);
	},
	'ChainExpression': (expression: ASTExpression, model, isBackConvert: boolean, changedModel) => {
		return convertExpressionToValue(expression.expression, model, isBackConvert, changedModel);
	},
	'ConditionalExpression': (expression: ASTExpression, model, isBackConvert: boolean, changedModel) => {
		const test = convertExpressionToValue(expression.test, model, isBackConvert, changedModel);
		return convertExpressionToValue(expression[test ? 'consequent' : 'alternate'], model, isBackConvert, changedModel);
	},
	'Identifier': (expression: ASTExpression, model, isBackConvert: boolean, changedModel) => {
		const context = getContext(expression.name, model, changedModel);
		if (expression.requiresObjectAndProperty) {
			return { object: context, property: expression.name };
		}
		return context[expression.name];
	},
	'Literal': (expression: ASTExpression, model, isBackConvert: boolean, changedModel) => {
		return expression.regex != null ? new RegExp(expression.regex.pattern, expression.regex.flags) : expression.value;
	},
	'LogicalExpression': (expression: ASTExpression, model, isBackConvert: boolean, changedModel) => {
		if (logicalOperators[expression.operator] == null) {
			throw new Error('Disallowed logical operator: ' + expression.operator);
		}
		const left = convertExpressionToValue(expression.left, model, isBackConvert, changedModel);
		return logicalOperators[expression.operator](left, () => convertExpressionToValue(expression.right, model, isBackConvert, changedModel));
	},
	'MemberExpression': (expression: ASTExpression, model, isBackConvert: boolean, changedModel) => {
		if (expression.object.type == 'MemberExpression') {
			expression.object.isChained = true;
		}

		const object = convertExpressionToValue(expression.object, model, isBackConvert, changedModel);
		const property = expression.computed ? convertExpressionToValue(expression.property, model, isBackConvert, changedModel) : expression.property?.name;
		const propertyInfo = { object, property };

		if (expression.requiresObjectAndProperty) {
			return propertyInfo;
		}

		/**
		 * If first member is undefined, make sure that no error is thrown later but return undefined instead.
		 * This behaviour is kept in order to cope with components whose binding context takes a bit long to load.
		 * Old parser would return undefined for an expression like 'property1.property2.property3'
		 * even if expression as a whole consisted of undefined properties.
		 * The new one will keep the same principle only if first member is undefined for safety reasons.
		 * It meddles with members specifically, so that it will not affect expression result as a whole.
		 * For example, an 'isLoading || isBusy' expression will be validated as 'undefined || undefined'
		 * if context is not ready.
		 */
		if (object === undefined && expression.object.type == 'Identifier') {
			return expression.isChained ? '$forceChain' : object;
    }
    if (object == '$forceChain') {
			return expression.isChained ? object : undefined;
    }
		return expression.optional ? object?.[property] : object[property];
	},
	'NewExpression': (expression: ASTExpression, model, isBackConvert: boolean, changedModel) => {
		const callback = convertExpressionToValue(expression.callee, model, isBackConvert, changedModel);
		const parsedArgs = [];
		for (let argument of expression.arguments) {
			let value = convertExpressionToValue(argument, model, isBackConvert, changedModel);
			argument.type == 'SpreadElement' ? parsedArgs.push(...value) : parsedArgs.push(value);
		}
		return new callback(...parsedArgs);
	},
	'ObjectExpression': (expression: ASTExpression, model, isBackConvert: boolean, changedModel) => {
		const parsedObject = {};
		for (let property of expression.properties) {
			const value = convertExpressionToValue(property, model, isBackConvert, changedModel);
			Object.assign(parsedObject, value);
		}
		return parsedObject;
	},
	'Property': (expression: ASTExpression, model, isBackConvert: boolean, changedModel) => {
		const key = expression.computed ? convertExpressionToValue(expression.key, model, isBackConvert, changedModel) : expression.key?.name;
		const value = convertExpressionToValue(expression.value, model, isBackConvert, changedModel);
		return {[key]: value};
	},
	'SpreadElement': (expression: ASTExpression, model, isBackConvert: boolean, changedModel) => {
		const argument = convertExpressionToValue(expression.argument, model, isBackConvert, changedModel);
		return argument;
	},
	'TemplateElement': (expression: ASTExpression, model, isBackConvert: boolean, changedModel) => {
		return expression.value.cooked;
	},
	'TemplateLiteral': (expression: ASTExpression, model, isBackConvert: boolean, changedModel) => {
		let parsedText = '';
		for (let q of expression.quasis) {
			parsedText += convertExpressionToValue(q, model, isBackConvert, changedModel);
		}

		for (let ex of expression.expressions) {
			parsedText += convertExpressionToValue(ex, model, isBackConvert, changedModel);
		}
		return parsedText;
	},
	'UnaryExpression': (expression: ASTExpression, model, isBackConvert: boolean, changedModel) => {
		if (unaryOperators[expression.operator] == null) {
			throw Error('Disallowed unary operator: ' + expression.operator);
		}

		const argument = convertExpressionToValue(expression.argument, model, isBackConvert, changedModel);
		return unaryOperators[expression.operator](argument);
	}
};

function getContext(key, model, changedModel) {
	let context = key in changedModel ? changedModel : model;
	if (!(key in context)) {
		context = global;
	}
	return context;
}

function getConverter(converterSchema, context, args, isBackConvert: boolean) {
	const converter = { callback: null, context, args };
	let callback = isBackConvert ? converterSchema.toModel : converterSchema.toView;
	if (callback == null) {
		callback = Function.prototype;
	}
	converter.callback = callback;
	return converter;
}

export function parseExpression(expressionText: string): ASTExpression {
	let expression = expressionsCache[expressionText];
	if (expression == null) {
		const program: any = parse(expressionText, { ecmaVersion: 2020 });
		const statements = program.body;
		for (let statement of statements) {
			if (statement.type == 'ExpressionStatement') {
				expression = statement.expression;
				break;
			}
		}
		expressionsCache[expressionText] = expression;
	}
	return expression;
}

export function convertExpressionToValue(expression: ASTExpression, model, isBackConvert: boolean, changedModel) {
	if (!(expression.type in expressionParsers)) {
		throw Error('Invalid expression syntax');
	}
	return expressionParsers[expression.type](expression, model, isBackConvert, changedModel);
}
