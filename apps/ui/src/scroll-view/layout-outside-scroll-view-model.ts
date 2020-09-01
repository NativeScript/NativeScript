import { Observable } from '@nativescript/core/data/observable';
import { ScrollView } from '@nativescript/core/ui/scroll-view';

export class LayoutOutsideScrollViewModel extends Observable {
	content: string =
		'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,' +
		'totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. ' +
		'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos ' +
		'qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, ' +
		'adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. ' +
		'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? ' +
		'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, ' +
		'vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?';
	isVisible: boolean = true;

	onChangeVisibility() {
		this.isVisible = !this.isVisible;
		this.notifyPropertyChange('isVisible', this.isVisible);
	}

	onScrollToBottom(args) {
		const scrollView = <ScrollView>args.object.page.getViewById('scroll-view');
		scrollView.scrollToVerticalOffset(scrollView.scrollableHeight, false);
	}

	onScrollToTop(args) {
		const scrollView = <ScrollView>args.object.page.getViewById('scroll-view');
		scrollView.scrollToVerticalOffset(0, false);
	}
}
