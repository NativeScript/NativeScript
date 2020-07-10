// regex that contains all symbols applicable for expression used to AI detect an expression.
const expressionSymbolsRegex = /[\+\-\*\/%\?:<>=!\|&\(\)^~]/;

export module bindingConstants {
	export const sourceProperty = 'sourceProperty';
	export const targetProperty = 'targetProperty';
	export const expression = 'expression';
	export const twoWay = 'twoWay';
	export const source = 'source';
	export const bindingValueKey = '$value';
	export const parentValueKey = '$parent';
	export const parentsValueKey = '$parents';
	export const newPropertyValueKey = '$newPropertyValue';
}

const hasEqualSignRegex = /=+/;
const equalSignComparisionOperatorsRegex = /(==|===|>=|<=|!=|!==)/;

// this regex is used to search for all instaces of '$parents[]' within an expression
export const parentsRegex = /\$parents\s*\[\s*(['"]*)\w*\1\s*\]/g;

function isNamedParam(value) {
	const equalSignIndex = value.search(hasEqualSignRegex);
	if (equalSignIndex > -1) {
		const equalSignSurround = value.substr(equalSignIndex > 0 ? equalSignIndex - 1 : 0, 3);
		if (equalSignSurround.search(equalSignComparisionOperatorsRegex) === -1) {
			return true;
		}
	}

	return false;
}

function areNamedParams(params: Array<any>) {
	for (let i = 0; i < params.length; i++) {
		if (isNamedParam(params[i])) {
			return true;
		}
	}

	return false;
}

const namedParamConstants = {
	propName: 'propName',
	propValue: 'propValue',
};

function getPropertyNameValuePair(param, knownOptions, callback) {
	let nameValuePair = {};
	let propertyName = param.substr(0, param.indexOf('=')).trim();
	const propertyValue = param.substr(param.indexOf('=') + 1).trim();
	if (knownOptions) {
		if (!propertyName) {
			propertyName = knownOptions.defaultProperty;
		} else {
			propertyName = propertyName in knownOptions ? propertyName : null;
		}
	}

	if (propertyName) {
		if (callback) {
			nameValuePair = callback(propertyName, propertyValue);
		} else {
			nameValuePair[namedParamConstants.propName] = propertyName;
			nameValuePair[namedParamConstants.propValue] = propertyValue;
		}

		return nameValuePair;
	}

	return null;
}

function parseNamedProperties(parameterList, knownOptions, callback) {
	const result = {};
	let nameValuePair;
	for (let i = 0; i < parameterList.length; i++) {
		nameValuePair = getPropertyNameValuePair(parameterList[i], knownOptions, callback);
		if (nameValuePair) {
			result[nameValuePair[namedParamConstants.propName]] = nameValuePair[namedParamConstants.propValue];
		}
	}

	return result;
}

function getParamsArray(value: string) {
	const result = [];
	let skipComma = 0;
	let indexReached = 0;
	let singleQuoteBlock = false;
	let doubleQuoteBlock = false;

	for (let i = 0; i < value.length; i++) {
		if (value[i] === '"') {
			doubleQuoteBlock = !doubleQuoteBlock;
		}

		if (value[i] === "'") {
			singleQuoteBlock = !singleQuoteBlock;
		}

		if (value[i] === '(' || value[i] === '[') {
			skipComma++;
		}

		if (value[i] === ')' || value[i] === ']') {
			skipComma--;
		}

		if (value[i] === ',' && skipComma === 0 && !(singleQuoteBlock || doubleQuoteBlock)) {
			result.push(value.substr(indexReached, i - indexReached));
			indexReached = i + 1;
		}
	}

	result.push(value.substr(indexReached));

	return result;
}

function isExpression(expression: string): boolean {
	if (expression.search(expressionSymbolsRegex) > -1) {
		const parentsMatches = expression.match(parentsRegex);
		if (parentsMatches) {
			const restOfExpression = expression.substr(expression.indexOf(parentsMatches[0]) + parentsMatches[0].length);
			// no more expression regognition symbols so it is safe for sourceProperty
			if (!(restOfExpression.search(expressionSymbolsRegex) > -1)) {
				return false;
			}
		}

		return true;
	}

	return false;
}

export function getBindingOptions(name: string, value: string): any {
	let namedParams = [];
	const params = getParamsArray(value);
	if (!areNamedParams(params)) {
		if (params.length === 1) {
			const trimmedValue = params[0].trim();
			let sourceProp;
			if (isExpression(trimmedValue)) {
				sourceProp = bindingConstants.bindingValueKey;
				namedParams.push(bindingConstants.expression + ' = ' + trimmedValue);
			} else {
				sourceProp = trimmedValue;
			}
			namedParams.push(bindingConstants.sourceProperty + ' = ' + sourceProp);

			namedParams.push(bindingConstants.twoWay + ' = true');
		} else {
			namedParams.push(bindingConstants.sourceProperty + ' = ' + params[0].trim());
			namedParams.push(bindingConstants.expression + ' = ' + params[1].trim());
			const twoWay = params[2] ? params[2].toLowerCase().trim() === 'true' : true;
			namedParams.push(bindingConstants.twoWay + ' = ' + twoWay);
		}
	} else {
		namedParams = params;
	}

	const bindingPropertyHandler = function (prop, value) {
		const result = {};
		result[namedParamConstants.propName] = prop;
		if (prop === bindingConstants.twoWay) {
			// create a real boolean value
			if (value === 'true') {
				result[namedParamConstants.propValue] = true;
			} else {
				result[namedParamConstants.propValue] = false;
			}
		} else {
			result[namedParamConstants.propValue] = value;
		}

		return result;
	};

	const bindingOptionsParameters = parseNamedProperties(namedParams, xmlBindingProperties, bindingPropertyHandler);
	const bindOptions = {
		targetProperty: name,
	};

	for (let prop in bindingOptionsParameters) {
		if (bindingOptionsParameters.hasOwnProperty(prop)) {
			bindOptions[prop] = bindingOptionsParameters[prop];
		}
	}

	if (bindOptions[bindingConstants.twoWay] === undefined) {
		bindOptions[bindingConstants.twoWay] = true;
	}

	return bindOptions;
}

const xmlBindingProperties = {
	sourceProperty: true,
	expression: true,
	twoWay: true,
	source: true,
	defaultProperty: bindingConstants.sourceProperty,
};
