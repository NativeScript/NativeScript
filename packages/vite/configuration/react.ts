import alias from '@rollup/plugin-alias';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mergeConfig, type UserConfig } from 'vite';
import { baseConfig } from './base.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const plugins = [
	{
		...alias({
			entries: {
				// Essential aliases for React NativeScript compatibility
				// Only alias react-dom related imports, NOT React itself
				'react-dom': 'react-nativescript',
				'react-dom/client': 'react-nativescript',
				'react-dom/server': 'react-nativescript',

				// Handle react-reconciler exports issue
				// This addresses the "DefaultEventPriority" and "LegacyRoot" not exported errors
				'react-reconciler/constants': resolve(__dirname, '../shims/react-reconciler-constants.js'),

				// Additional React ecosystem compatibility
				'react-reconciler/src/ReactFiberHostConfig': 'react-nativescript/dist/client/HostConfig',

				// Fix React reconciler namespace issue
				'react-reconciler': resolve(__dirname, '../shims/react-reconciler.js'),

				// Additional shims
				'set-value': resolve(__dirname, '../shims/set-value.js'),
			},
		}),
		enforce: 'pre',
	},
	{
		name: 'react-nativescript-resolver',
		resolveId(id) {
			// Ensure React core exports are properly resolved
			if (id === 'react') {
				return { id: 'react', external: false };
			}
		},
		load(id) {
			// Handle React module loading to ensure all exports are available
			if (id === 'react') {
				return `
// Re-export all React exports to ensure they're available
import * as React from 'react/index.js';

// Explicitly export the commonly used React APIs
export const {
  Component,
  PureComponent,
  Fragment,
  createElement,
  createRef,
  forwardRef,
  useState,
  useEffect,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  useLayoutEffect,
  useDebugValue,
  createContext,
  Children,
  cloneElement,
  isValidElement,
  version,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
} = React;

// Export everything else
export * from 'react/index.js';

// Default export
export default React;
`;
			}
		},
	},
];

export const reactConfig = ({ mode }): UserConfig => {
	return mergeConfig(baseConfig({ mode, flavor: 'react' }), {
		plugins,
	});
};
