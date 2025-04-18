function __decorate(decorators, target, key, desc) {
	var c = arguments.length,
		r =
			c < 3
				? target
				: desc === null
					? (desc = Object.getOwnPropertyDescriptor(target, key))
					: desc,
		d;
	//@ts-ignore
	if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
		//@ts-ignore
		r = Reflect.decorate(decorators, target, key, desc);
	else
		for (var i = decorators.length - 1; i >= 0; i--)
			if ((d = decorators[i]))
				r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	return c > 3 && r && Object.defineProperty(target, key, r), r;
}

export { __decorate as _ };
