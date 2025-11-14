import { getNativeApp } from '../../application/helpers-common';

class MainScreen {
	private _metrics: android.util.DisplayMetrics;

	private initMetrics(): void {
		const nativeApp = getNativeApp() as android.app.Application;
		(nativeApp.getSystemService(android.content.Context.WINDOW_SERVICE) as android.view.WindowManager).getDefaultDisplay().getRealMetrics(this._metrics);
	}

	private get metrics(): android.util.DisplayMetrics {
		if (!this._metrics) {
			this._metrics = new android.util.DisplayMetrics();
			this.initMetrics();
		}

		return this._metrics;
	}

	get widthPixels(): number {
		return this.metrics.widthPixels;
	}
	get heightPixels(): number {
		return this.metrics.heightPixels;
	}
	get scale(): number {
		return this.metrics.density;
	}
	get widthDIPs(): number {
		return this.metrics.widthPixels / this.metrics.density;
	}
	get heightDIPs(): number {
		return this.metrics.heightPixels / this.metrics.density;
	}

	public _updateMetrics(): void {
		if (!this._metrics) {
			this._metrics = new android.util.DisplayMetrics();
		}
		this.initMetrics();
	}
}

export class Screen {
	static mainScreen = new MainScreen();
}
