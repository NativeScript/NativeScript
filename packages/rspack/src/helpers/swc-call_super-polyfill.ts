import { _ as _get_prototype_of } from '@swc/helpers/esm/_get_prototype_of.js';
import { _ as _is_native_reflect_construct } from '@swc/helpers/esm/_is_native_reflect_construct.js';
import { _ as _possible_constructor_return } from '@swc/helpers/esm/_possible_constructor_return.js';

function _call_super(_this, derived, args) {
	// Super
	derived = _get_prototype_of(derived);

	if (
		!!derived.extend &&
		derived.extend.toString().indexOf('[native code]') > -1
	)
		return derived.call(_this, ...(args || [])) || _this;

	return _possible_constructor_return(
		_this,
		_is_native_reflect_construct()
			? // NOTE: This doesn't work if this.__proto__.constructor has been modified.
				Reflect.construct(
					derived,
					args || [],
					_get_prototype_of(_this).constructor,
				)
			: derived.apply(_this, args),
	);
}

export { _call_super as _ };
