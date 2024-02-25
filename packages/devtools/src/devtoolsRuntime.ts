// const domainDispatchers = new Map<string, any>();

export function DomainDispatcher(domain: string): ClassDecorator {
	return (klass) => {
		__registerDomainDispatcher(domain, klass);
		// if (!domainDispatchers.has(domain)) {
		// 	domainDispatchers.set(domain, klass);
		// } else {
		// 	console.trace(`Domain dispatcher for ${domain} already registered!`);
		// }
	};
}

interface ProtocolMessage<T = any> {
	id: number;
	method: string;
	params: T;
}

export class ProtocolWrapper {
	constructor() {
		return ProtocolWrapper.wrap(this);
	}

	protected enabled: boolean = false;

	enable() {
		this.enabled = true;
	}

	disable() {
		this.enabled = false;
	}

	// private _enabled: boolean = false;

	// get enabled() {
	// 	return this._enabled;
	// }

	// enable() {
	// 	console.log(this.constructor.name, 'enable!');
	// 	this._enabled = true;
	// }

	// disable() {
	// 	this._enabled = false;
	// }

	public emit(name: string, params: any) {
		try {
			// console.info('[emit]', { method: name, params });
			__inspectorSendEvent(
				JSON.stringify({
					method: name,
					params,
				})
			);
		} catch (err) {
			console.error(err);
		}
	}

	public timestamp(): number {
		return __inspectorTimestamp();
	}

	private static async sendResponseToDevtools<T = any>(id: number, data: T) {
		try {
			const result = await data;
			if (result) {
				// console.info('[sendResponseToDevtools]', { id, result });
				__inspectorSendEvent(
					JSON.stringify({
						id,
						result,
					})
				);
			}
		} catch (err) {
			console.error(err);
		}
	}

	private static wrap<T extends Object>(handler: T): T {
		return new Proxy(handler, {
			get(target, prop) {
				if (typeof target[prop] === 'function') {
					return (params, message: ProtocolMessage) => {
						try {
							// console.warn('[incoming]', {
							// 	id: message.id,
							// 	method: message.method,
							// 	params,
							// 	message,
							// });
							const res = target[prop](params, message);
							ProtocolWrapper.sendResponseToDevtools(message.id, res);
							return res;
						} catch (err) {
							console.error(err);
						}
					};
				}
			},
		}) as T;
	}
}
