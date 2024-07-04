export function btoa(stringToEncode: string) {
	if (__ANDROID__) {
		return (<any>org).nativescript.widgets.Utils.btoa(stringToEncode);
	}

	if (__IOS__) {
		return (<any>NSString).btoa(stringToEncode);
	}
}
