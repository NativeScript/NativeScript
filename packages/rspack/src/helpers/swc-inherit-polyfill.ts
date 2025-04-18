import { _ as _set_prototype_of } from '@swc/helpers/esm/_set_prototype_of.js';
function _inherits(subClass, superClass) {
	/**
	 *
	 * Call our custom _extends function if this is a Native Class extend.
	 */
	if (
		!!superClass.extend &&
		superClass.extend.toString().indexOf('[native code]') > -1
	) {
		//@ts-ignore
		return __extends(subClass, superClass);
	}

	if (typeof superClass !== 'function' && superClass !== null) {
		throw new TypeError(
			'TEST Super expression must either be null or a function',
		);
	}

	subClass.prototype = Object.create(superClass && superClass.prototype, {
		constructor: { value: subClass, writable: true, configurable: true },
	});

	if (superClass) _set_prototype_of(subClass, superClass);
}
export { _inherits as _ };
