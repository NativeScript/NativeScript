import css2jsonLoader, {
	joinEscapedSelectorCommas,
} from '../../src/loaders/css2json-loader';

function run(css: string): any {
	let output = '';
	css2jsonLoader.call(
		{
			getOptions: () => ({}),
			callback: (_error: unknown, code: string) => {
				output = code;
			},
		},
		css,
		null,
	);
	const json = output
		.slice(output.indexOf('=') + 1, output.lastIndexOf('export default'))
		.trim();
	return JSON.parse(json);
}

describe('css2json-loader', () => {
	it('keeps an escaped comma inside a class name', () => {
		const ast = run(
			'.grid-cols-\\[repeat\\(auto-fill\\,minmax\\(260\\,1fr\\)\\)\\] { grid-template-columns: repeat(auto-fill,minmax(260,1fr)); }',
		);
		expect(ast.stylesheet.rules[0].selectors).toEqual([
			'.grid-cols-\\[repeat\\(auto-fill\\,minmax\\(260\\,1fr\\)\\)\\]',
		]);
	});

	it('still splits a real selector list, including in at-rules', () => {
		const ast = run(
			'.a\\,b, .c { color: red; } @media (min-width: 1px) { .x-\\[a\\,b\\], .y { color: red; } }',
		);
		expect(ast.stylesheet.rules[0].selectors).toEqual(['.a\\,b', '.c']);
		expect(ast.stylesheet.rules[1].rules[0].selectors).toEqual([
			'.x-\\[a\\,b\\]',
			'.y',
		]);
	});

	it('does not join after an escaped backslash', () => {
		expect(joinEscapedSelectorCommas(['.a\\\\', '.b'])).toEqual([
			'.a\\\\',
			'.b',
		]);
	});
});
