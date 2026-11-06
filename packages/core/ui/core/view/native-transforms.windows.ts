export function _ensureNativeTransforms(native: any): { scale: any; rotate: any; translate: any } | null {
	try {
		if (native.__ns_transforms) return native.__ns_transforms;

		const tg = new Microsoft.UI.Xaml.Media.TransformGroup();
		const scale = new Microsoft.UI.Xaml.Media.ScaleTransform();
		const rotate = new Microsoft.UI.Xaml.Media.RotateTransform();
		const translate = new Microsoft.UI.Xaml.Media.TranslateTransform();
		tg.Children.Append(scale);
		tg.Children.Append(rotate);
		tg.Children.Append(translate);
		native.RenderTransform = tg;
		const result = { scale, rotate, translate };
		native.__ns_transforms = result;
		return result;
	} catch (_e) {
		return null;
	}
}
