import { parse } from 'esprima';
import { isFunction, isNullOrUndefined, isObject } from '../../../utils/types';

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
const leftRightOperators = {
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
	'&&': (l, r) => l && r,
	'|': (l, r) => l | r,
	'||': (l, r) => l || r,
	'??': (l, r) => l ?? r,
	'in': (l, r) => l in r,
	'instanceof': (l, r) => l instanceof r
};

// prettier-ignore
const expressionParsers = {
	'ArrayExpression': (expression, model, isBackConvert, changedModel) => {
		const parsed = [];
		for (let element of expression.elements) {
			let value = convertExpressionToValue(element, model, isBackConvert, changedModel);
			element.type === 'SpreadElement' ? parsed.push(...value) : parsed.push(value);
		}
		return parsed;
	},
	'BinaryExpression': (expression, model, isBackConvert, changedModel) => {
		if (leftRightOperators[expression.operator] == null) {
			throw new Error('Disallowed operator: ' + expression.operator);
		}

		const left = convertExpressionToValue(expression.left, model, isBackConvert, changedModel);
		const right = convertExpressionToValue(expression.right, model, isBackConvert, changedModel);

		if (expression.operator == '|') {
			if (isFunction(right) && right.converterArgs != null) {
				return right(left, ...right.converterArgs);
			}
			throw new Error('Invalid converter after ' + expression.operator + ' operator');
		}

		return leftRightOperators[expression.operator](left, right);
	},
	'CallExpression': (expression, model, isBackConvert, changedModel) => {
		const callback = convertExpressionToValue(expression.callee, model, isBackConvert, changedModel);
		const isConverter = isObject(callback) && (isFunction(callback.toModel) || isFunction(callback.toView));

		const parsedArgs = [];
		for (let argument of expression.arguments) {
			let value = convertExpressionToValue(argument, model, isBackConvert, changedModel);
			argument.type === 'SpreadElement' ? parsedArgs.push(...value) : parsedArgs.push(value);
		}

		if (isNullOrUndefined(callback) || (!isFunction(callback) && !isConverter)) {
			throw new Error('Cannot perform a call using a non-function property');
		}

		return isConverter ? getConverterCallback(callback, parsedArgs, isBackConvert) : callback(...parsedArgs);
	},
	'ConditionalExpression': (expression, model, isBackConvert, changedModel) => {
		const test = convertExpressionToValue(expression.test, model, isBackConvert, changedModel);
		const consequent = convertExpressionToValue(expression.consequent, model, isBackConvert, changedModel);
		const alternate = convertExpressionToValue(expression.alternate, model, isBackConvert, changedModel);
		return test ? consequent : alternate;
	},
	'Identifier': (expression, model, isBackConvert, changedModel) => {
		const context = changedModel[expression.name] ? changedModel : model;
		return getValueWithContext(expression.name, context);
	},
	'Literal': (expression, model, isBackConvert, changedModel) => {
		return expression.value;
	},
	'LogicalExpression': (expression, model, isBackConvert, changedModel) => {
		if (leftRightOperators[expression.operator] == null) {
			throw Error('Disallowed operator: ' + expression.operator);
		}

		const left = convertExpressionToValue(expression.left, model, isBackConvert, changedModel);
		const right = convertExpressionToValue(expression.right, model, isBackConvert, changedModel);

		return leftRightOperators[expression.operator](left, right);
	},
	'MemberExpression': (expression, model, isBackConvert, changedModel) => {
		const object = convertExpressionToValue(expression.object, model, isBackConvert, changedModel);
		const property = convertExpressionToValue(expression.property, object, isBackConvert, object);
		return expression.computed ? getValueWithContext(property, object) : property;
	},
	'NewExpression': (expression, model, isBackConvert, changedModel) => {
		const callback = convertExpressionToValue(expression.callee, model, isBackConvert, changedModel);
		const parsedArgs = [];
		for (let argument of expression.arguments) {
			let value = convertExpressionToValue(argument, model, isBackConvert, changedModel);
			argument.type === 'SpreadElement' ? parsedArgs.push(...value) : parsedArgs.push(value);
		}
		return new callback(...parsedArgs);
	},
	'ObjectExpression': (expression, model, isBackConvert, changedModel) => {
		const parsed = {};
		for (let property of expression.properties) {
			const key = convertExpressionToValue(expression.key, model, isBackConvert, changedModel);
			const value = convertExpressionToValue(expression.value, model, isBackConvert, changedModel);
			parsed[key] = value;
		}
		return parsed;
	},
	'SpreadElement': (expression, model, isBackConvert, changedModel) => {
		const argument = convertExpressionToValue(expression.argument, model, isBackConvert, changedModel);
		return argument;
	},
	'TemplateElement': (expression, model, isBackConvert, changedModel) => {
		return expression.value.cooked;
	},
	'TemplateLiteral': (expression, model, isBackConvert, changedModel) => {
		let parsedText = '';
		for (let q of expression.quasis) {
			parsedText += convertExpressionToValue(q, model, isBackConvert, changedModel);
		}

		for (let ex of expression.expressions) {
			parsedText += convertExpressionToValue(ex, model, isBackConvert, changedModel);
		}
		return parsedText;
	},
	'UnaryExpression': (expression, model, isBackConvert, changedModel) => {
		if (unaryOperators[expression.operator] == null) {
			throw Error('Disallowed operator: ' + expression.operator);
		}

		const argument = convertExpressionToValue(expression.argument, model, isBackConvert, changedModel);
		return unaryOperators[expression.operator](argument);
	}
};

function getConverterCallback(context, args, isBackConvert) {
	let callback = isBackConvert ? context.toModel : context.toView;
	if (callback == null) {
		callback = Function.prototype;
	}
	callback = callback.bind(context);
	callback.converterArgs = args;
	return callback;
}

function getValueWithContext(key, context) {
	let value = context[key];
	if (isFunction(value)) {
		value = value.bind(context);
	}
	return value;
}

export function parseExpression(expressionText) {
	let expression = expressionsCache[expressionText];
	if (expression == null) {
		let syntax = parse(expressionText);
		let statements = syntax.body;
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

export function convertExpressionToValue(expression, model, isBackConvert, changedModel) {
	return expressionParsers[expression.type](expression, model, isBackConvert, changedModel);
}
