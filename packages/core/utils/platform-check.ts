/**
 * @internal Util used for exporting opposing platform utils and warning the user if they are trying to access them.
 */
export function platformCheck(parent?: string) {
	if (__DEV__) {
		return new Proxy(
			{},
			{
				get(_, prop) {
					const propPretty = [parent, prop.toString()].join('.');
					const hintPlatformCheck = global.isAndroid ? 'global.isIOS' : 'global.isAndroid';

					// prettier-ignore
					const errorMsg = [
						`Trying to access "${propPretty}" without checking platform first.`,
						`Hint: Use "${hintPlatformCheck}" to check platform before accessing "${propPretty}".`
					].join('\n');

					throw new Error(errorMsg);
				},
			}
		);
	}

	return undefined;
}
