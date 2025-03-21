import { parseEnvFlags } from '../../src/cli/parseEnvFlags';

describe.only('parseEnvFlags', () => {
	it('parses all possible flags', () => {
		const res = parseEnvFlags([
			'--env', // invalid
			'--env.foo',
			'--env.externals=ext1',
			'--env.externals=ext2',
			'--env.externals=ext3',
			'--env.externals=ext4',
			'--env.externals=ext4',
			'--env.externals=/path/to/a/very/long/path with spaces/foo.js',
			'--env.externals=~/package.json',
			'--env.externals=package.json',
			'--env.ios=false',
			'--env.android',
			'--env.verbose',
			'--env.sourceMap',
			'--env.appPath=app',
			'--env.appResourcesPath=App_Resources',
			'--env.num=5',
			'--env.float=5.4',
			'--env.numArray=3',
			'--env.numArray=4',
			'--env.numArray=5',
			'--no-hmr',
			'--not-env-flag',
		]);

		expect(res).toBeDefined();
		expect(res.foo).toBe(true);
		expect(res.externals).toBeInstanceOf(Array);
		expect(res.externals.length).toBe(8);
		expect(res.ios).toBe(false);
		expect(res.android).toBe(true);
		expect(res.verbose).toBe(true);
		expect(res.sourceMap).toBe(true);
		expect(res.sourceMap).toBe(true);
		expect(res.appPath).toBe('app');
		expect(res.appResourcesPath).toBe('App_Resources');
		expect(res.num).toBe(5);
		expect(res.float).toBe(5.4);
		expect(res.numArray).toStrictEqual([3, 4, 5]);
		expect(Object.keys(res).length).toBe(11);
	});
});
