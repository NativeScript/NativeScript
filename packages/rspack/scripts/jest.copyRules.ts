import { copyRules, additionalCopyRules } from '../src/helpers/copyRules';

afterEach(() => {
	// Clear copy rules
	copyRules.clear();
	additionalCopyRules.length = 0;
});
