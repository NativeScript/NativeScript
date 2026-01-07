import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import path from 'path';
import alias from '@rollup/plugin-alias';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mergeConfig, type UserConfig } from 'vite';
import { baseConfig } from './base.js';
import { parse as babelParse } from '@babel/parser';
import generate from '@babel/generator';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { getCliFlags } from '../helpers/cli-flags.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const vueConfig = ({ mode }): UserConfig => {
	const targetMode = mode === 'development' ? 'development' : 'production';
	const cliFlags = getCliFlags();
	const isDevMode = targetMode === 'development';
	const hmrActive = isDevMode && !!cliFlags.hmr;

	return mergeConfig(baseConfig({ mode, flavor: 'vue' }), {
		plugins: [
			{
				...alias({
					entries: {
						// Retain 'vue' alias to 'nativescript-vue' so any generic Vue imports resolve
						// to the NativeScript-Vue runtime.
						vue: 'nativescript-vue',
						'set-value': resolve(__dirname, '../shims/set-value.js'),
					},
				}),
				enforce: 'pre',
			},
			// Enable Vue Single File Component support
			vue({
				// NativeScript projects often use <script setup lang="ts">
				script: {
					defineModel: true,
					propsDestructure: true,
				},
				// Keep template compilation basic; transform asset URLs is not needed for NS
				template: {
					transformAssetUrls: false,
					compilerOptions: {
						// Only treat real web custom elements (hyphenated) as custom.
						// DO NOT match PascalCase NativeScript tags.
						isCustomElement: (tag) => tag.includes('-'),
					},
				},
			}),
			// Optional: allow JSX/TSX in Vue components if used
			vueJsx(),
			// With HMR, apply post-transform to make any named import from 'nativescript-vue' bulletproof in build mode.
			// It rewrites `import { X as Y } from 'nativescript-vue'` to a namespace import and
			// creates local const bindings that pick from either the module's named export (if present)
			// or the default object's property, auto-binding functions to the default instance.
			hmrActive
				? {
						name: 'ns-vue-named-imports-interop',
						apply: 'build',
						enforce: 'post',
						transform(code: string, id: string) {
							// Only operate on JS/TS and extracted Vue script blocks
							if (!/\.(mjs|cjs|js|ts|jsx|tsx)(\?|$)/.test(id) && !/\.vue\?vue&type=script/.test(id)) {
								return null;
							}
							let ast: any;
							try {
								ast = babelParse(code, {
									sourceType: 'module',
									plugins: [
										'typescript',
										'jsx',
										// Allow decorators/experimental features if present; harmless if unused
										['decorators', { decoratorsBeforeExport: true }],
									] as any,
								});
							} catch {
								return null;
							}

							let mutated = false;
							let hasNSVNamespace = false;
							let hasNSVDefaultVar = false;
							const nsVarName = '__NSV';
							const defVarName = '__nsv';

							const newNodes: t.Statement[] = [];
							const nodesToRemove: t.Node[] = [];

							(traverse as any).default?.(ast, {
								Program: {
									exit(path: any) {
										if (!mutated) return;
										// Prepend namespace/default helpers if they were requested by transforms
										const body = path.node.body as t.Statement[];
										const prepend: t.Statement[] = [];
										if (!hasNSVNamespace) {
											prepend.push(t.importDeclaration([t.importNamespaceSpecifier(t.identifier(nsVarName))], t.stringLiteral('nativescript-vue')));
											hasNSVNamespace = true;
										}
										if (!hasNSVDefaultVar) {
											prepend.push(
												t.variableDeclaration('const', [
													t.variableDeclarator(
														t.identifier(defVarName),
														t.logicalExpression(
															'||',
															// Prefer explicit default when present; fall back to namespace
															t.memberExpression(t.identifier(nsVarName), t.identifier('default'), false),
															t.identifier(nsVarName),
														),
													),
												]),
											);
											hasNSVDefaultVar = true;
										}
										path.node.body = [...prepend, ...body];
									},
								},
								ImportDeclaration(path: any) {
									const node: t.ImportDeclaration = path.node;
									const src = node.source.value;
									if (src !== 'nativescript-vue') return;
									const named = node.specifiers?.filter((s) => s.type === 'ImportSpecifier') as t.ImportSpecifier[];
									if (!named?.length) return;
									mutated = true;
									// Ensure our helpers are available
									hasNSVNamespace = true;
									hasNSVDefaultVar = true;

									// Gather new variable declarations for each named specifier
									const decls: t.VariableDeclarator[] = [];
									for (const spec of named) {
										const imported = (spec.imported as t.Identifier).name;
										const local = (spec.local as t.Identifier).name;
										const pickExpr = t.logicalExpression('||', t.memberExpression(t.identifier(nsVarName), t.identifier(imported), false), t.memberExpression(t.identifier(defVarName), t.identifier(imported), false));
										const bindHelper = t.callExpression(t.arrowFunctionExpression([t.identifier('v')], t.conditionalExpression(t.binaryExpression('===', t.unaryExpression('typeof', t.identifier('v')), t.stringLiteral('function')), t.callExpression(t.memberExpression(t.identifier('v'), t.identifier('bind')), [t.identifier(defVarName)]), t.identifier('v'))), [pickExpr]);
										decls.push(t.variableDeclarator(t.identifier(local), bindHelper));
									}

									// Build replacement: remove named specifiers from original import
									const remaining = node.specifiers.filter((s) => s.type !== 'ImportSpecifier');
									const newStmts: t.Statement[] = [];
									if (remaining.length) {
										// Keep any default/namespace import as-is
										newStmts.push(t.importDeclaration(remaining as any, t.stringLiteral('nativescript-vue')));
									}
									// Always ensure namespace/default helpers are present by prepending in Program.exit
									newStmts.push(t.variableDeclaration('const', decls));

									nodesToRemove.push(node);
									newNodes.push(...newStmts);
								},
							});

							if (!mutated) return null;

							// Apply queued removals/insertions conservatively via simple string regeneration
							// by reconstructing the whole module from AST, since we changed structure.
							// Remove collected nodes by marking them and letting generator drop them.
							// Easiest approach: reconstruct AST.body filtering out removed nodes and appending new ones near the end.
							const program = (ast as any).program as t.Program;
							program.body = program.body.filter((n) => !nodesToRemove.includes(n));
							program.body.push(...newNodes);

							const out = (generate as any).default ? (generate as any).default(program, {}) : generate(program as any, {});
							return { code: out.code, map: null };
						},
					}
				: undefined,
		],
	});
};
