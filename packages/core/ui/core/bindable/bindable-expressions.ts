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
		const right = convertExpressionToValue(expression.right, model, isBackConvert, changedModel);

		if (expression.operator == '|') {
			if (right != null && isFunction(right.callback) && right.context != null && right.args != null) {
				right.args.unshift(left);
				return right.callback.apply(right.context, right.args);
			}
			throw new Error('Invalid converter after ' + expression.operator + ' operator');
		}

		return binaryOperators[expression.operator](left, right);
	},
	'CallExpression': (expression: ASTExpression, model, isBackConvert: boolean, changedModel) => {
		let object;
		let property;
		if (expression.callee.type == 'MemberExpression') {
			object = convertExpressionToValue(expression.callee.object, model, isBackConvert, changedModel);
			if (expression.callee.property.type == 'Identifier') {
				property = expression.callee.computed ? convertExpressionToValue(expression.callee.property, model, isBackConvert, changedModel) : expression.callee.property.name;
			} else {
				property = convertExpressionToValue(expression.callee.property, model, isBackConvert, changedModel);
			}
		} else {
			object = getContext(expression.callee.name, model, changedModel);
			property = expression.callee.name;
		}
		const callback = expression.callee.optional ? object?.[property] : object[property];
		const isConverter = isObject(callback) && (isFunction(callback.toModel) || isFunction(callback.toView));

		const parsedArgs = [];
		for (let argument of expression.arguments) {
			let value = convertExpressionToValue(argument, model, isBackConvert, changedModel);
			argument.type == 'SpreadElement' ? parsedArgs.push(...value) : parsedArgs.push(value);
		}

		if (isNullOrUndefined(callback) || (!isFunction(callback) && !isConverter)) {
			throw new Error('Cannot perform a call using a non-function property');
		}

		return isConverter ? getConverter(callback, parsedArgs, isBackConvert) : callback.apply(object, parsedArgs);
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
		const object = convertExpressionToValue(expression.object, model, isBackConvert, changedModel);
		let property;
		if (expression.property.type == 'Identifier') {
			property = expression.computed ? convertExpressionToValue(expression.property, model, isBackConvert, changedModel) : expression.property.name;
		} else {
			property = convertExpressionToValue(expression.property, model, isBackConvert, changedModel);
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
		let key;
		if (expression.key.type == 'Identifier') {
			key = expression.computed ? convertExpressionToValue(expression.key, model, isBackConvert, changedModel) : expression.key.name;
		} else {
			key = convertExpressionToValue(expression.key, model, isBackConvert, changedModel);
		}
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
	return key in changedModel ? changedModel : model;
}

function getConverter(context, args, isBackConvert: boolean) {
	const converter = { callback: null, context, args };
	let callback = isBackConvert ? context.toModel : context.toView;
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
	return expressionParsers[expression.type](expression, model, isBackConvert, changedModel);
}
