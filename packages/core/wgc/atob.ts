export function atob(data: string) {
	if (__ANDROID__) {
		return (<any>org).nativescript.winter_tc.Utils.atob(data);
	}

	if (__IOS__) {
		return (<any>NSString).atob(data);
	}
}
