export function isEmbedded(): boolean {
	return !!NativeScriptEmbedder.sharedInstance().delegate;
}
