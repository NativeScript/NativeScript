import { defaultConfigs } from '@nativescript/webpack';

export function determineProjectFlavor(): keyof typeof defaultConfigs {
	// todo;

	// error(`
	// Could not determine project flavor.
	//
	// Please use webpack.useConfig('<flavor>') to explicitly set the base config.
	// `, {
	// 	possibleCauses: [
	// 		'Not in a NativeScript project',
	// 		'The project is not at the current working directory'
	// 	]
	// })

	return 'vue';
}
