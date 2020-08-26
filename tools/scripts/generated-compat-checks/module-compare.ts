const results = { errors: new Array<string>(), modules: 0, exports: 0 };

export function compare(name: string, core: any, compat: any) {
	results.modules++;
	for (const key in core) {
		results.exports++;
		if (core[key] !== compat[key]) {
			results.errors.push(`ERROR: Diff in module: ${name} key: ${key}`);
		}
	}
}

export function report() {
	console.log(`CHECKED COMPLETED. CHECKED MODULES: ${results.modules} EXPORTS: ${results.exports}`);
	if (results.errors.length) {
		console.log(`----- ${results.errors.length} CHECKS FAILED ----- `);
		results.errors.forEach((err) => console.log(err));
	} else {
		console.log('----- ALL CHECKS SUCCESSFUL ----- ');
	}
}
