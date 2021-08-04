import {
	isDevMode,
	ɵresetCompiledComponents,
	// @ts-ignore
} from '@angular/core';

declare const __webpack_require__: any;
declare const ng: any;

export default function (mod: any): void {
	if (!mod['hot']) {
		return;
	}

	if (!isDevMode()) {
		console.error(
			`[NG HMR] Cannot use HMR when Angular is running in production mode. To prevent production mode, do not call 'enableProdMode()'.`
		);

		return;
	}

	mod['hot'].accept();
	mod['hot'].dispose(() => {
		if (typeof ng === 'undefined') {
			console.warn(
				`[NG HMR] Cannot find global 'ng'. Likely this is caused because scripts optimization is enabled.`
			);

			return;
		}

		if (!ng.getInjector) {
			// View Engine
			return;
		}

		// Reset JIT compiled components cache
		ɵresetCompiledComponents();
		try {
			if (global['__cleanup_ng_hot__']) global['__cleanup_ng_hot__']();
		} catch (e) {
			console.error('[NG HMR] Error disposing previous module');
			console.error(e, e?.stack);
			// HMR breaks when rejecting the main module dispose, so we manually trigger an HMR restart
			const hash = __webpack_require__.h();
			console.log(`[HMR][${hash}] failure | Error disposing previous module`);
			throw e;
		}
	});
}

// TODO: maybe restore form values!
// function restoreFormValues(oldInputs: any[], oldOptions: any[]): void {
//   // Restore input that are not hidden
//   const newInputs = document.querySelectorAll('input:not([type="hidden"]), textarea');
//   if (newInputs.length && newInputs.length === oldInputs.length) {
//     console.log('[NG HMR] Restoring input/textarea values.');
//     for (let index = 0; index < newInputs.length; index++) {
//       const newElement = newInputs[index];
//       const oldElement = oldInputs[index];

//       switch (oldElement.type) {
//         case 'button':
//         case 'image':
//         case 'submit':
//         case 'reset':
//           // These types don't need any value change.
//           continue;
//         case 'radio':
//         case 'checkbox':
//           newElement.checked = oldElement.checked;
//           break;
//         case 'color':
//         case 'date':
//         case 'datetime-local':
//         case 'email':
//         case 'file':
//         case 'hidden':
//         case 'month':
//         case 'number':
//         case 'password':
//         case 'range':
//         case 'search':
//         case 'tel':
//         case 'text':
//         case 'textarea':
//         case 'time':
//         case 'url':
//         case 'week':
//           newElement.value = oldElement.value;
//           break;
//         default:
//           console.warn('[NG HMR] Unknown input type ' + oldElement.type + '.');
//           continue;
//       }

//       dispatchEvents(newElement);
//     }
//   } else if (oldInputs.length) {
//     console.warn('[NG HMR] Cannot restore input/textarea values.');
//   }

//   // Restore option
//   const newOptions = document.querySelectorAll('option');
//   if (newOptions.length && newOptions.length === oldOptions.length) {
//     console.log('[NG HMR] Restoring selected options.');
//     for (let index = 0; index < newOptions.length; index++) {
//       const newElement = newOptions[index];
//       newElement.selected = oldOptions[index].selected;

//       dispatchEvents(newElement);
//     }
//   } else if (oldOptions.length) {
//     console.warn('[NG HMR] Cannot restore selected options.');
//   }
// }
