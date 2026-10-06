import { Label } from '../label';

describe('iOS native text rebuild', () => {
	function pendingLabel() {
		const label: any = new Label();
		label.text = 'hello';
		label.style.letterSpacing = 1;
		label.style.textDecoration = 'underline';
		const rebuild = vi.spyOn(label, '_animationWrap').mockImplementation(() => {});
		return { label, rebuild };
	}

	it('rebuilds the text once when several text setters apply together', () => {
		const { label, rebuild } = pendingLabel();

		label.onResumeNativeUpdates();

		expect(rebuild).toHaveBeenCalledTimes(1);
	});

	it('rebuilds right away outside a native update batch', () => {
		const { label, rebuild } = pendingLabel();
		label.onResumeNativeUpdates();
		rebuild.mockClear();

		label._setNativeText();
		label._setNativeText();

		expect(rebuild).toHaveBeenCalledTimes(2);
	});
});
