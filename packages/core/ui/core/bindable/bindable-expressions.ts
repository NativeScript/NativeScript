import { parse } from 'esprima';

const expressionsCache = {};

const unaryOperators = {
	'+': (v) => +v,
	'-': (v) => -v,
	'!': (v) => !v,
};

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
	in: (l, r) => l in r,
	instanceof: (l, r) => l instanceof r,
};

const expressionParsers = {
	ArrayExpression: (expression, model, isBackConvert, changedModel) => {
		const parsed = [];
		for (let element of expression.elements) {
			let value = convertExpressionToValue(element, model, isBackConvert, changedModel);
			element.type === 'SpreadElement' ? parsed.push(...value) : parsed.push(value);
		}
		return parsed;
	},
	BinaryExpression: (expression, model, isBackConvert, changedModel) => {
		if (!leftRightOperators[expression.operator]) {
			throw Error('Disallowed operator: ' + expression.operator);
		}

		const left = convertExpressionToValue(expression.left, model, isBackConvert, changedModel);
		const right = convertExpressionToValue(expression.right, model, isBackConvert, changedModel);

		if (expression.operator == '|') {
			if (right.formatter && right.arguments) {
				right.arguments.unshift(left);
				return right.formatter.apply(changedModel, right.arguments);
			}
			throw Error('Failed to find a valid converter after ' + expression.operator + ' operator');
		}

		return leftRightOperators[expression.operator](left, right);
	},
	CallExpression: (expression, model, isBackConvert, changedModel) => {
		const callback = convertExpressionToValue(expression.callee, model, isBackConvert, changedModel);
		let context = changedModel[expression.callee.name] ? changedModel : model;

		const parsedArgs = [];
		for (let argument of expression.arguments) {
			let value = convertExpressionToValue(argument, model, isBackConvert, changedModel);
			argument.type === 'SpreadElement' ? parsedArgs.push(...value) : parsedArgs.push(value);
		}

		const converter = getConverterCallback(callback, parsedArgs, isBackConvert);
		return converter ? converter : callback.apply(model, parsedArgs);
	},
	ConditionalExpression: (expression, model, isBackConvert, changedModel) => {
		const test = convertExpressionToValue(expression.test, model, isBackConvert, changedModel);
		const consequent = convertExpressionToValue(expression.consequent, model, isBackConvert, changedModel);
		const alternate = convertExpressionToValue(expression.alternate, model, isBackConvert, changedModel);
		return test ? consequent : alternate;
	},
	Identifier: (expression, model, isBackConvert, changedModel) => {
		let context = changedModel[expression.name] ? changedModel : model;
		return context[expression.name];
	},
	Literal: (expression, model, isBackConvert, changedModel) => {
		return expression.value;
	},
	LogicalExpression: (expression, model, isBackConvert, changedModel) => {
		if (!leftRightOperators[expression.operator]) {
			throw Error('Disallowed operator: ' + expression.operator);
		}

		const left = convertExpressionToValue(expression.left, model, isBackConvert, changedModel);
		const right = convertExpressionToValue(expression.right, model, isBackConvert, changedModel);

		return leftRightOperators[expression.operator](left, right);
	},
	MemberExpression: (expression, model, isBackConvert, changedModel) => {
		let object = convertExpressionToValue(expression.object, model, isBackConvert, changedModel);
		let property = convertExpressionToValue(expression.property, { context: object }, isBackConvert, object);
		return property;
	},
	NewExpression: (expression, model, isBackConvert, changedModel) => {
		const callback = convertExpressionToValue(expression.callee, model, isBackConvert, changedModel);
		let context = changedModel[expression.callee.name] ? changedModel : model;

		const parsedArgs = [];
		for (let argument of expression.arguments) {
			let value = convertExpressionToValue(argument, model, isBackConvert, changedModel);
			argument.type === 'SpreadElement' ? parsedArgs.push(...value) : parsedArgs.push(value);
		}
		return new callback(...parsedArgs);
	},
	ObjectExpression: (expression, model, isBackConvert, changedModel) => {
		const parsed = {};
		for (let property of expression.properties) {
			const key = convertExpressionToValue(expression.key, model, isBackConvert, changedModel);
			const value = convertExpressionToValue(expression.value, model, isBackConvert, changedModel);
			parsed[key] = value;
		}
		return parsed;
	},
	SpreadElement: (expression, model, isBackConvert, changedModel) => {
		const argument = convertExpressionToValue(expression.argument, model, isBackConvert, changedModel);
		return argument;
	},
	UnaryExpression: (expression, model, isBackConvert, changedModel) => {
		if (!unaryOperators[expression.operator]) {
			throw Error('Disallowed operator: ' + expression.operator);
		}

		const argument = convertExpressionToValue(expression.argument, model, isBackConvert, changedModel);
		return unaryOperators[expression.operator](argument);
	},
};

function getConverterCallback(callback, args, isBackConvert) {
	let converter = null;
	if (typeof callback !== 'function') {
		if (typeof callback.toModel === 'function' || typeof callback.toView === 'function') {
			if (isBackConvert) {
				converter = { formatter: callback.toModel || Function.prototype, arguments: args };
			} else {
				converter = { formatter: callback.toView || Function.prototype, arguments: args };
			}
		}
	}
	return converter;
}

export function parseExpression(expressionText) {
	let expression = expressionsCache[expressionText];
	if (!expression) {
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
