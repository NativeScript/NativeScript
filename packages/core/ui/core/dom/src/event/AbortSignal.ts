export default class AbortSignal {
	aborted: boolean = false;
	reason: any;
	listeners = new Map();

	addEventListener(
		type: 'abort',
		listener: (this: AbortSignal, event: any) => any,
		options?:
			| boolean
			| {
					capture?: boolean | undefined;
					once?: boolean | undefined;
					passive?: boolean | undefined;
			  }
	) {
		if (this.listeners.has(listener)) return;
		this.listeners.set(listener, type);
	}

	removeEventListener(
		type: 'abort',
		listener: (this: AbortSignal, event: any) => any,
		options?:
			| boolean
			| {
					capture?: boolean | undefined;
			  }
	) {
		if (!this.listeners.has(listener)) return;
		this.listeners.delete(listener);
	}

	abort() {
		this.listeners.forEach((_, listener) => {
			this.aborted = true;
			listener();
			this.listeners.delete(listener);
		});
		return this;
	}

	timeout() {}
}
