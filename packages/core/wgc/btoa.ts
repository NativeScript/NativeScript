export function btoa(stringToEncode: string) {
	if (__ANDROID__) {
		return (<any>org).nativescript.winter_cg.Utils.btoa(stringToEncode);
	}

	if (__IOS__) {
		return (<any>NSString).btoa(stringToEncode);
	}
}
