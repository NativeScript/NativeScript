import { copyRules, additionalCopyRules } from '../src/helpers/copyRules';

afterEach(() => {
	// Clear copy rules
	copyRules.clear();
	additionalCopyRules.length = 0;
});

// require.resolve() embeds the checkout path in webpack configuration strings.
// Keep snapshots portable between maintainer and reviewer machines.
const webpackRoot = jest.requireActual('path').resolve(__dirname, '..');
expect.addSnapshotSerializer({
	test: (value) => typeof value === 'string' && value.includes(webpackRoot),
	print: (value, serialize) =>
		serialize(String(value).split(webpackRoot).join('<webpack-root>')),
});
