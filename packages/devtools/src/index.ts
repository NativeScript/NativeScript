import { ApplicationSettingsKeyValueProvider } from './impl/ApplicationSettingsKeyValueProvider';
import { KeyValueProviderRegistry } from './providers/keyValueProvider';

/**
 * Initializes the default devtools providers.
 */
export function initDevtools() {
	KeyValueProviderRegistry.registerKeyValueProvider(new ApplicationSettingsKeyValueProvider());
}

export { KeyValueProviderRegistry, KeyValueProvider } from './providers/keyValueProvider';
// export { SqlDatabaseProviderRegistry, SqlDatabaseProvider, SqlDatabaseResult } from './providers/sqlDatabaseProvider';
// export { IndexedDBDatabaseProviderRegistry, IndexedDBDatabaseProvider, IndexedDBDatabaseResult } from './providers/indexedDbDatabaseProvider';
// export { NetworkProviderRegistry, NetworkProvider } from './providers/networkProvider';

export { DomainDispatcher, ProtocolWrapper } from './devtoolsRuntime';
