import { Application, Color, EventData, Frame, Observable, Page, Utils } from '@nativescript/core';
import { deviceSummary } from './shared';

class Bars extends Observable {
	private dark = true;
	private lightContent = false;
	private tinted = false;

	constructor(private page: Page) {
		super();
		this.publish();

		const onAppearance = () => this.publish();
		Application.on(Application.systemAppearanceChangedEvent, onAppearance);
		this.page.on(Page.navigatedFromEvent, () => Application.off(Application.systemAppearanceChangedEvent, onAppearance));
	}

	toggleStyle = () => {
		this.dark = !this.dark;
		this.publish();
	};

	toggleContent = () => {
		this.lightContent = !this.lightContent;
		this.publish();
	};

	/** The colours only show up behind translucent bars, which is the edge-to-edge case. */
	toggleBarColors = () => {
		this.tinted = !this.tinted;
		const activity = Utils.android.getCurrentActivity() as androidx.appcompat.app.AppCompatActivity;
		if (this.tinted) {
			Utils.android.setStatusBarColor({ activity, lightColor: new Color('#3320c997'), darkColor: new Color('#33064e3b') });
			Utils.android.setNavigationBarColor({ activity, lightColor: new Color('#33f59e0b'), darkColor: new Color('#33451a03') });
		} else {
			Utils.android.setStatusBarColor({ activity, lightColor: new Color('transparent'), darkColor: new Color('transparent') });
			Utils.android.setNavigationBarColor({ activity, lightColor: new Color('transparent'), darkColor: new Color('transparent') });
		}
		this.publish();
	};

	back = () => {
		Frame.topmost().goBack();
	};

	private publish() {
		const style = this.dark ? 'dark' : 'light';
		this.set('statusBarStyle', style);
		this.set('statusBarLine', `statusBarStyle: ${style}`);
		this.set('contentColor', this.lightContent ? '#f8fafc' : '#111827');
		this.set('appearanceLine', `system appearance: ${Application.systemAppearance()}`);
		this.set('ignoreOlderLine', `ignoreEdgeToEdgeOnOlderDevices: ${Utils.android.getIgnoreEdgeToEdgeOnOlderDevices()}`);
		this.set('device', deviceSummary());
	}
}

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new Bars(page);
}
