/** Session descriptor, served as a module (`export default {…}`). */
export const NS_DEV_SESSION_PATH = '/__ns_dev__/session.mjs';
/** The import map and loader config ns:module `configureLoader()` takes at boot, served as a module. */
export const IMPORT_MAP_PATH = '/__ns_dev__/import-map.mjs';
/** `GET ?reason=`: asks the dev server for an app restart. */
export const NS_DEV_RESTART_PATH = '/__ns_dev__/restart';
/** `GET ?reason=`: the device's boot failed before the app launched; the next edit restarts the app. */
export const NS_DEV_BOOT_FAILED_PATH = '/__ns_dev__/boot-failed';
/** `GET`: answers once the boot graph's warm-up transforms are done. */
export const NS_DEV_WARM_PATH = '/__ns_dev__/warm';
