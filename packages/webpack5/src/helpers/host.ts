import os from 'os';

export function getIPS() {
	// todo: perhaps mock networkInterfaces instead?
	if (__TEST__) {
		// in tests we don't need the real ips
		return ['127.0.0.1', '192.168.0.10'];
	}

	const interfaces = os.networkInterfaces();
	return Object.keys(interfaces)
		.map((name) => {
			return interfaces[name].filter(
				(binding: any) => binding.family === 'IPv4'
			)[0];
		})
		.filter(Boolean)
		.map((binding) => binding.address);
}
