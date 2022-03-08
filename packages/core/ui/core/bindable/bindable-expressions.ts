import { parse } from 'acorn';
import { isFunction, isNullOrUndefined, isObject } from '../../../utils/types';

interface ASTExpression {
	readonly type: string;
	readonly [prop: string]: any;
}

const expressionsCache = {};

const FORCED_CHAIN_VALUE = Symbol('forcedChain');

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
	'**': (l, r) => l ** r,
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

		let converterExpression = expression.right;
		if (expression.operator == '|') {
			if (converterExpression.type == 'ChainExpression') {
				converterExpression = converterExpression.expression;
			}
			if (converterExpression.type == 'CallExpression') {
				!converterExpression.arguments.includes(expression.left) && converterExpression.arguments.unshift(expression.left);
				expression.right.nsIsCallable = true;
				converterExpression = converterExpression.callee;
			}

			switch (converterExpression.type) {
				case 'Identifier':
				case 'MemberExpression':
				case 'NewExpression':
					converterExpression.nsRequiresConverter = true;
					converterExpression.nsIsPendingCall = true;
					break;
				default:
					throw new Error('Invalid converter syntax');
			}
		}

		const right = convertExpressionToValue(expression.right, model, isBackConvert, changedModel);

		if (expression.operator == '|') {
			if (converterExpression.nsRequiresConverter) {
				if (expression.right.nsIsCallable) {
					return right;
				}

				if (isFunction(right)) {
					return right(left);
				}

				if (isNullOrUndefined(right)) {
					throw new Error('Cannot perform a call using a null or undefined property');
				}
			}
			throw new Error('Invalid converter syntax');
		}
		return binaryOperators[expression.operator](left, right);
	},
	'CallExpression': (expression: ASTExpression, model, isBackConvert: boolean, changedModel) => {
		expression.callee.nsIsPendingCall = true;
		const callback = convertExpressionToValue(expression.callee, model, isBackConvert, changedModel);

		if (!expression.optional && isNullOrUndefined(callback)) {
			throw new Error('Cannot perform a call using a null or undefined property');
		}

		const parsedArgs = [];
		for (let argument of expression.arguments) {
			let value = convertExpressionToValue(argument, model, isBackConvert, changedModel);
			argument.type == 'SpreadElement' ? parsedArgs.push(...value) : parsedArgs.push(value);
		}
		return expression.optional ? callback?.(...parsedArgs) : callback(...parsedArgs);
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
		let value = context[expression.name];
		if (expression.nsRequiresConverter) {
    	value = getConverterCallback(value, isBackConvert);
    }
		return expression.nsIsPendingCall && typeof value === 'function' ? value.bind(context) : value;
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
			expression.object.nsIsChained = true;
		}

		const object = convertExpressionToValue(expression.object, model, isBackConvert, changedModel);
		const property = expression.computed ? convertExpressionToValue(expression.property, model, isBackConvert, changedModel) : expression.property?.name;

		/**
		 * If an expression parent property is null or undefined, apply null-safety.
		 * This behaviour also helps cope with components whose binding context takes a bit longer to load.
		 * Old parser would be null-safe for properties and sub-properties
		 * even if expression as a whole consisted of undefined ones.
		 * The new parser will keep the same principle only if parent property is null or undefined, resulting in better control over code and errors.
		 * It meddles with members specifically, so that it will not affect expression result as a whole.
		 * For example, an 'isLoading || isBusy' expression will be validated as 'undefined || undefined'
		 * if context is not ready.
		 */
		if (object == null && expression.object.type == 'Identifier') {
			return expression.nsIsChained ? FORCED_CHAIN_VALUE : undefined;
    }
    if (object == FORCED_CHAIN_VALUE) {
			return expression.nsIsChained ? object : undefined;
    }

    let value = expression.optional ? object?.[property] : object[property];
    if (expression.nsRequiresConverter) {
    	value = getConverterCallback(value, isBackConvert);
    }
		return expression.nsIsPendingCall && typeof value === 'function' ? value.bind(object) : value;
	},
	'NewExpression': (expression: ASTExpression, model, isBackConvert: boolean, changedModel) => {
		const callback = convertExpressionToValue(expression.callee, model, isBackConvert, changedModel);
		const parsedArgs = [];
		for (let argument of expression.arguments) {
			let value = convertExpressionToValue(argument, model, isBackConvert, changedModel);
			argument.type == 'SpreadElement' ? parsedArgs.push(...value) : parsedArgs.push(value);
		}

		let value = new callback(...parsedArgs);
		if (expression.nsRequiresConverter) {
    	value = getConverterCallback(value, isBackConvert);
    }
    return value;
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
		const length = expression.quasis.length;

		for (let i = 0; i < length; i++) {
			let q = expression.quasis[i];
			parsedText += convertExpressionToValue(q, model, isBackConvert, changedModel);
			if (!q.tail) {
				parsedText += convertExpressionToValue(expression.expressions[i], model, isBackConvert, changedModel);
			}
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

function getConverterCallback(value, isBackConvert: boolean) {
	let callback = null;
	if (isNullOrUndefined(value)) {
		callback = value;
	} else if (isFunction(value)) {
		callback = isBackConvert ? Function.prototype : value;
	} else if (isObject(value) && (isFunction(value.toModel) || isFunction(value.toView))) {
		callback = (isBackConvert ? value.toModel : value.toView) || Function.prototype;
	} else {
		callback = value;
	}
	return callback;
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
