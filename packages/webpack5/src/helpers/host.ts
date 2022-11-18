import os from 'os';

export function getIPS() {
	const interfaces = os.networkInterfaces();
	return Object.keys(interfaces)
		.map((name) => {
			return interfaces[name].filter(
				(binding: any) => binding.family === 'IPv4' || binding.family === 4
			)[0];
		})
		.filter((binding) => !!binding)
		.map((binding) => binding.address);
}
