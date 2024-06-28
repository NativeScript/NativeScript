import { DomainDispatcher, ProtocolWrapper } from '../devtoolsRuntime';

export interface KeyValueProvider {
	getName(): string;
	getKeys(): MaybePromise<string[]>;
	getValue(key: string): MaybePromise<string | undefined>;
	setValue(key: string, value: string): MaybePromise<boolean>;
	deleteKey(key: string): MaybePromise<boolean>;
	clear(): MaybePromise<boolean>;
}

@DomainDispatcher('Storage')
export class KeyValueProviderStorageHandler extends ProtocolWrapper {
	getStorageKeyForFrame(params) {
		if (params.frameId.startsWith('KeyValueProvider_')) {
			return {
				storageKey: `kv://${params.frameId.substr('KeyValueProvider_'.length)}`,
			};
		}

		// return { storageKey: '' };
	}
}

@DomainDispatcher('DOMStorage')
export class KeyValueProviderRegistry extends ProtocolWrapper {
	private static providers: Map<string, KeyValueProvider> = new Map();

	static registerKeyValueProvider(provider: KeyValueProvider) {
		this.providers.set(provider.getName(), provider);
	}

	static getProviderFrames() {
		return Array.from(this.providers.keys()).map((name) => {
			console.log('provider', name);
			return {
				frame: {
					id: `KeyValueProvider_${name}`,
					loaderId: 'NSLoaderIdentifier',
					url: `kv://KV:${name}`,
					securityOrigin: '',
					mimeType: 'text/directory',
				},
				resources: [],
			};
		});
	}

	enable() {
		super.enable();
		console.log('enable KeyValueProviderRegistry');
	}

	private getProviderFromParams(params) {
		const { storageKey, isLocalStorage } = params.storageId;
		if (!isLocalStorage) {
			return;
		}

		return KeyValueProviderRegistry.providers.get(storageKey.replace('kv://', ''));
	}

	async getDOMStorageItems(params) {
		const provider = this.getProviderFromParams(params);
		if (!provider) {
			return { entries: [] };
		}
		const keys = await provider.getKeys();
		const entries = [];
		for await (const key of keys) {
			const value = await provider.getValue(key);
			entries.push([key, value]);
		}

		return {
			entries,
		};
	}

	async removeDOMStorageItem(params) {
		const provider = this.getProviderFromParams(params);
		if (!provider) {
			return;
		}
		const res = await provider.deleteKey(params.key);

		if (res) {
			this.emit('DOMStorage.domStorageItemRemoved', {
				storageId: params.storageId,
				key: params.key,
			});
		}
	}

	async setDOMStorageItem(params) {
		const provider = this.getProviderFromParams(params);
		if (!provider) {
			return;
		}
		const oldValue = (await provider.getValue(params.key)) ?? undefined;
		const res = await provider.setValue(params.key, params.value);
		if (res) {
			this.emit(oldValue ? 'DOMStorage.domStorageItemUpdated' : 'DOMStorage.domStorageItemAdded', {
				storageId: params.storageId,
				key: params.key,
				oldValue,
				newValue: params.value,
			});
		}
	}

	async clear(params) {
		const provider = this.getProviderFromParams(params);
		if (!provider) {
			return;
		}

		const res = await provider.clear();

		if (res) {
			this.emit('DOMStorage.domStorageItemsCleared', {
				storageId: params.storageId,
			});

			// re-emit all remaining values after the clean (system may have added new values)
			const keys = await provider.getKeys();
			for await (const key of keys) {
				const value = await provider.getValue(key);
				this.emit('DOMStorage.domStorageItemAdded', {
					storageId: params.storageId,
					key,
					newValue: value,
				});
			}
		}
	}
}

@DomainDispatcher('Page')
export class KeyValueProviderPageHandler extends ProtocolWrapper {
	enable(): void {
		super.enable();
		KeyValueProviderRegistry.getProviderFrames().forEach(({ frame }) => {
			this.emit('Page.frameStartedLoading', {
				frameId: frame.id,
			});
			// this.emit('Page.domContentEventFired', {
			// 	timestamp: this.timestamp(),
			// });
			// this.emit('Page.loadEventFired', {
			// 	timestamp: this.timestamp(),
			// });
			this.emit('Page.frameNavigated', {
				frame,
			});
			this.emit('Page.frameStoppedLoading', {
				frameId: frame.id,
			});
		});
	}
}
