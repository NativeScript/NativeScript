import { parse as babelParse } from '@babel/parser';
import * as t from '@babel/types';

import { genCode } from '../helpers/babel.js';

const MODULE_IMPORT_ANALYSIS_PLUGINS = ['typescript', 'jsx', 'importMeta', 'topLevelAwait', 'classProperties', 'classPrivateProperties', 'classPrivateMethods', 'decorators-legacy'] as any;

function shouldGuardAngularEntryStatement(node: any): boolean {
	if (t.isImportDeclaration(node) || t.isExportDeclaration(node) || t.isFunctionDeclaration(node) || t.isClassDeclaration(node) || t.isVariableDeclaration(node)) {
		return false;
	}
	if (t.isExpressionStatement(node) && typeof (node as any).directive === 'string') {
		return false;
	}
	return true;
}

export function rewriteAngularEntryRegisterOnly(code: string, angularCoreImportSource: string = '@angular/core'): string {
	if (!code.includes('runNativeScriptAngularApp(')) {
		return code;
	}

	try {
		const ast = babelParse(code, {
			sourceType: 'module',
			plugins: MODULE_IMPORT_ANALYSIS_PLUGINS,
		}) as any;
		const body = ast?.program?.body;
		if (!Array.isArray(body)) {
			return code;
		}

		let rewroteEntry = false;
		const angularCoreImportId = t.identifier('__nsAngularCoreForHmr');
		const registerOnlyFlag = t.memberExpression(t.identifier('globalThis'), t.identifier('__NS_ANGULAR_HMR_REGISTER_ONLY__'));
		const rememberAngularCoreRef = t.memberExpression(t.identifier('globalThis'), t.identifier('__NS_REMEMBER_ANGULAR_CORE__'));
		const updateOptionsRef = t.memberExpression(t.identifier('globalThis'), t.identifier('__NS_UPDATE_ANGULAR_APP_OPTIONS__'));
		const rewrittenBody: any[] = [t.importDeclaration([t.importNamespaceSpecifier(t.cloneNode(angularCoreImportId))], t.stringLiteral(angularCoreImportSource)), t.ifStatement(t.binaryExpression('===', t.unaryExpression('typeof', rememberAngularCoreRef, true), t.stringLiteral('function')), t.blockStatement([t.expressionStatement(t.callExpression(rememberAngularCoreRef, [t.cloneNode(angularCoreImportId)]))]))];

		for (const statement of body) {
			const expression = t.isExpressionStatement(statement) ? statement.expression : null;
			if (expression && t.isCallExpression(expression) && t.isIdentifier(expression.callee, { name: 'runNativeScriptAngularApp' }) && expression.arguments.length === 1 && t.isExpression(expression.arguments[0])) {
				rewroteEntry = true;
				const optionsId = t.identifier('__nsAngularAppRunOptions');
				rewrittenBody.push(t.variableDeclaration('const', [t.variableDeclarator(optionsId, t.cloneNode(expression.arguments[0], true))]), t.ifStatement(t.logicalExpression('&&', registerOnlyFlag, t.binaryExpression('===', t.unaryExpression('typeof', updateOptionsRef, true), t.stringLiteral('function'))), t.blockStatement([t.expressionStatement(t.callExpression(updateOptionsRef, [t.cloneNode(optionsId)]))]), t.blockStatement([t.expressionStatement(t.callExpression(t.identifier('runNativeScriptAngularApp'), [t.cloneNode(optionsId)]))])));
				continue;
			}

			if (shouldGuardAngularEntryStatement(statement)) {
				rewrittenBody.push(t.ifStatement(t.unaryExpression('!', t.cloneNode(registerOnlyFlag, true)), t.blockStatement([statement])));
				continue;
			}

			rewrittenBody.push(statement);
		}

		if (!rewroteEntry) {
			return code;
		}

		ast.program.body = rewrittenBody;
		return genCode(ast as any).code;
	} catch {
		return code;
	}
}

export function resolveAngularCoreHmrImportSource(code: string, httpOrigin?: string): string {
	const rewrittenCoreMatch = code.match(/from\s+["']([^"']*\/node_modules\/@angular\/core\/fesm2022\/core\.mjs)["']/);
	if (rewrittenCoreMatch?.[1]) {
		return rewrittenCoreMatch[1];
	}

	const normalizedOrigin = typeof httpOrigin === 'string' ? httpOrigin.replace(/\/$/, '') : '';
	if (normalizedOrigin) {
		return `${normalizedOrigin}/ns/m/node_modules/@angular/core/fesm2022/core.mjs`;
	}

	return '@angular/core';
}
