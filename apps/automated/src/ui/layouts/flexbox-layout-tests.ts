import { FlexboxLayout, Button, View, unsetValue, Length, PercentLength, Label, Builder } from '@nativescript/core';

export namespace FlexDirection {
	export const ROW: 'row' = 'row';
	export const ROW_REVERSE: 'row-reverse' = 'row-reverse';
	export const COLUMN: 'column' = 'column';
	export const COLUMN_REVERSE: 'column-reverse' = 'column-reverse';
}

export namespace FlexWrap {
	export const NOWRAP: 'nowrap' = 'nowrap';
	export const WRAP: 'wrap' = 'wrap';
	export const WRAP_REVERSE: 'wrap-reverse' = 'wrap-reverse';
}

export namespace JustifyContent {
	export const FLEX_START: 'flex-start' = 'flex-start';
	export const FLEX_END: 'flex-end' = 'flex-end';
	export const CENTER: 'center' = 'center';
	export const SPACE_BETWEEN: 'space-between' = 'space-between';
	export const SPACE_AROUND: 'space-around' = 'space-around';
}

export namespace AlignItems {
	export const FLEX_START: 'flex-start' = 'flex-start';
	export const FLEX_END: 'flex-end' = 'flex-end';
	export const CENTER: 'center' = 'center';
	export const BASELINE: 'baseline' = 'baseline';
	export const STRETCH: 'stretch' = 'stretch';
}

export namespace AlignContent {
	export const FLEX_START: 'flex-start' = 'flex-start';
	export const FLEX_END: 'flex-end' = 'flex-end';
	export const CENTER: 'center' = 'center';
	export const SPACE_BETWEEN: 'space-between' = 'space-between';
	export const SPACE_AROUND: 'space-around' = 'space-around';
	export const STRETCH: 'stretch' = 'stretch';
}

export namespace AlignSelf {
	export const AUTO: 'auto' = 'auto';
	export const FLEX_START: 'flex-start' = 'flex-start';
	export const FLEX_END: 'flex-end' = 'flex-end';
	export const CENTER: 'center' = 'center';
	export const BASELINE: 'baseline' = 'baseline';
	export const STRETCH: 'stretch' = 'stretch';
}

import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import { dipToDp, left, top, right, bottom, height, width, paddingLeft, paddingTop, paddingRight, paddingBottom, equal, closeEnough, notEqual, check, heightEqual, widthEqual, isLeftAlignedWith, isRightAlignedWith, isTopAlignedWith, isBottomAlignedWith, isLeftOf, isRightOf, isBelow, isAbove, isLeftWith, isAboveWith, isRightWith, isBelowWith } from './layout-tests-helper';

function waitUntilTestElementLayoutIsValid(view: View, timeoutSec?: number): void {
	TKUnit.waitUntilReady(() => {
		return view.isLayoutValid;
	}, timeoutSec || 1);
}

function baseline(view: View): number {
	// TODO: Return View's baseline!
	return 0;
}

export function testFlexboxPage() {
	let page = helper.navigateWithEntry({ moduleName: 'ui/layouts/flexbox-layout-page' });
	function view(id: string) {
		return <View>page.getViewById(id);
	}
	TKUnit.waitUntilReady(() => page.isLayoutValid);
	isLeftOf(view('six'), view('one'));
	isAbove(view('one'), view('scrollview'));
	isAbove(view('title'), view('firstlabel'));
	isAbove(view('firstlabel'), view('description'));
}

const noop = () => {
	// no operation
};

// TODO: Order tests!

function test<U extends { root: View }>(ui: () => U, setup: (ui: U) => void, test: (ui: U) => void): () => void {
	return () => {
		let i = ui();
		setup(i);
		helper.buildUIAndRunTest(i.root, () => {
			waitUntilTestElementLayoutIsValid(i.root);
			test(i);
		});
	};
}

let getViews = (template: string) => {
	let root = Builder.parse(template);

	return {
		root,
		flexbox: root.getViewById('flexbox') as FlexboxLayout,
		text1: root.getViewById('text1') as Label,
		text2: root.getViewById('text2') as Label,
		text3: root.getViewById('text3') as Label,
		text4: root.getViewById('text4') as Label,
		text5: root.getViewById('text5') as Label,
	};
};

let activity_flex_wrap = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox"
            flexDirection="${FlexDirection.ROW}"
            flexWrap="${FlexWrap.WRAP}"
            alignContent="${AlignContent.STRETCH}"
            width="320" height="320"
            backgroundColor="gray">
        <Label id="text1" text="1" width="120" height="120" backgroundColor="red" />
        <Label id="text2" text="2" width="120" height="120" backgroundColor="green" />
        <Label id="text3" text="3" width="120" height="120" backgroundColor="blue" />
    </FlexboxLayout>`
	);

export function test_recycling() {
	helper.nativeView_recycling_test(() => new FlexboxLayout());
}

export function test_item_recycling() {
	helper.nativeView_recycling_test(
		() => new Button(),
		() => new FlexboxLayout()
	);
}

export const testFlexWrap_wrap = test(
	activity_flex_wrap,
	({ flexbox }) => (flexbox.flexWrap = FlexWrap.WRAP),
	({ root, flexbox, text1, text2, text3 }) => {
		isLeftAlignedWith(text1, flexbox);
		isTopAlignedWith(text1, flexbox);
		isRightOf(text2, text1);
		isTopAlignedWith(text2, flexbox);
		isBelow(text3, text1);
		isBelow(text3, text2);
		isLeftAlignedWith(text3, flexbox);
		// equal(flexbox.getFlexLines().size(), is(1));
	}
);

export const testFlexWrap_nowrap = test(
	activity_flex_wrap,
	({ flexbox }) => (flexbox.flexWrap = FlexWrap.NOWRAP),
	({ root, flexbox, text1, text2, text3 }) => {
		isLeftAlignedWith(text1, flexbox);
		isTopAlignedWith(text1, flexbox);
		isRightOf(text2, text1);
		isTopAlignedWith(text2, flexbox);
		isRightOf(text3, text2);
		isTopAlignedWith(text3, flexbox);
		// equal(flexbox.getFlexLines().size(), is(1));
	}
);

export const testFlexWrap_wrap_reverse = test(
	activity_flex_wrap,
	({ flexbox }) => (flexbox.flexWrap = FlexWrap.WRAP_REVERSE),
	({ root, flexbox, text1, text2, text3 }) => {
		isLeftAlignedWith(text1, flexbox);
		isRightOf(text2, text1);
		isAbove(text3, text1);
		isAbove(text3, text2);
		isLeftAlignedWith(text3, flexbox);
		// equal(flexbox.getFlexLines().size(), is(2));
	}
);

export const testFlexWrap_wrap_flexDirection_column = test(
	activity_flex_wrap,
	({ flexbox }) => (flexbox.flexDirection = FlexDirection.COLUMN),
	({ root, flexbox, text1, text2, text3 }) => {
		isLeftAlignedWith(text1, flexbox);
		isTopAlignedWith(text1, flexbox);
		isBelow(text2, text1);
		isLeftAlignedWith(text2, flexbox);
		isRightOf(text3, text1);
		isRightOf(text3, text2);
		isTopAlignedWith(text3, flexbox);
		// equal(flexbox.getFlexLines().size(), is(2));
	}
);

export const testFlexWrap_nowrap_flexDirection_column = test(
	activity_flex_wrap,
	({ flexbox }) => {
		flexbox.flexDirection = FlexDirection.COLUMN;
		flexbox.flexWrap = FlexWrap.NOWRAP;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isLeftAlignedWith(text1, flexbox);
		isTopAlignedWith(text1, flexbox);
		isBelow(text2, text1);
		isLeftAlignedWith(text2, flexbox);
		isBelow(text3, text2);
		isLeftAlignedWith(text3, flexbox);
		// equal(flexbox.getFlexLines().size(), is(1));
	}
);

export const testFlexWrap_wrap_reverse_flexDirection_column = test(
	activity_flex_wrap,
	({ flexbox }) => {
		flexbox.flexDirection = FlexDirection.COLUMN;
		flexbox.flexWrap = FlexWrap.WRAP_REVERSE;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isRightAlignedWith(text1, flexbox);
		isBelow(text2, text1);
		isLeftOf(text3, text1);
		isLeftOf(text3, text2);
		isTopAlignedWith(text3, flexbox);
		// equal(flexbox.getFlexLines().size(), is(2));
	}
);

let activity_flex_item_match_parent = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox"
            width="100%"
            verticalAlignment="top"
            flexDirection="${FlexDirection.ROW}"
            flexWrap="${FlexWrap.WRAP}"
            alignItems="${AlignItems.FLEX_START}"
            alignContent="${AlignContent.FLEX_START}"
            backgroundColor="gray">
        <Label id="text1" width="100%" height="80" text="1" backgroundColor="red" />
        <Label id="text2" width="100%" height="80" text="2" backgroundColor="green" />
        <Label id="text3" width="100%" height="80" text="3" backgroundColor="blue" />
    </FlexboxLayout>`
	);

export const testFlexItem_match_parent = test(activity_flex_item_match_parent, noop, ({ root, flexbox, text1, text2, text3 }) => {
	widthEqual(text1, flexbox);
	widthEqual(text2, flexbox);
	widthEqual(text3, flexbox);
	equal(height(flexbox), height(text1) + height(text2) + height(text3), `Expected height of ${flexbox} to equal sum of widths for ${text1}, ${text2}, ${text3}`);
});

let activity_flex_item_match_parent_direction_column = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox"
            height="100%"
            horizontalAlignment="left"
            flexDirection="${FlexDirection.COLUMN}"
            flexWrap="${FlexWrap.WRAP}"
            alignItems="${AlignItems.FLEX_START}"
            alignContent="${AlignContent.FLEX_START}"
            backgroundColor="gray">
        <Label id="text1" width="40" height="100%" text="1" backgroundColor="red"/>
        <Label id="text2" width="40" height="100%" text="2" backgroundColor="green" />
        <Label id="text3" width="40" height="100%" text="3" backgroundColor="blue" />
    </FlexboxLayout>`
	);

export const testFlexItem_match_parent_flexDirection_column = test(activity_flex_item_match_parent_direction_column, noop, ({ root, flexbox, text1, text2, text3 }) => {
	heightEqual(text1, flexbox);
	heightEqual(text2, flexbox);
	heightEqual(text3, flexbox);
	equal(width(flexbox), width(text1) + width(text2) + width(text3), `Expected width of ${flexbox} to equal sum of widths for ${text1}, ${text2}, ${text3}`);
});

let activity_flexbox_wrap_content = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox"
            horizontalAlignment="left"
            verticalAlignment="top"
            flexDirection="${FlexDirection.ROW}"
            flexWrap="${FlexWrap.WRAP}"
            backgroundColor="gray">
        <Label id="text1" horizontalAlignment="left" verticalAlignment="top" text="1" backgroundColor="red" />
        <Label id="text2" horizontalAlignment="left" verticalAlignment="top" text="2" backgroundColor="green" />
        <Label id="text3" horizontalAlignment="left" verticalAlignment="top" text="3" backgroundColor="blue" />
    </FlexboxLayout>`
	);

export const testFlexboxLayout_wrapContent = test(activity_flexbox_wrap_content, noop, ({ root, flexbox, text1, text2, text3 }) => {
	isLeftAlignedWith(text1, flexbox);
	isTopAlignedWith(text1, flexbox);
	isBottomAlignedWith(text1, flexbox);

	isRightOf(text2, text1);
	isTopAlignedWith(text2, flexbox);
	isBottomAlignedWith(text2, flexbox);

	isRightOf(text3, text2);
	isTopAlignedWith(text3, flexbox);
	isBottomAlignedWith(text3, flexbox);
	isRightAlignedWith(text3, flexbox);
});

let activity_flexbox_wrapped_with_scrollview = () =>
	getViews(
		`<ScrollView width="100%" verticalAlignment="top">
        <FlexboxLayout iosOverflowSafeArea="false" id="flexbox"
                width="360"
                verticalAlignment="top"
                flexDirection="${FlexDirection.ROW}"
                flexWrap="${FlexWrap.WRAP}"
                backgroundColor="gray">
            <Label id="text1" width="140" height="500" text="1" backgroundColor="red" />
            <Label id="text2" width="140" height="500" text="2" backgroundColor="green" />
            <Label id="text3" width="140" height="500" text="3" backgroundColor="blue" />
        </FlexboxLayout>
    </ScrollView>`
	);

export const testFlexboxLayout_wrapped_with_ScrollView = test(activity_flexbox_wrapped_with_scrollview, noop, ({ root, flexbox, text1, text2, text3 }) => {
	isLeftAlignedWith(text1, flexbox);
	isTopAlignedWith(text1, flexbox);

	isRightOf(text2, text1);
	isTopAlignedWith(text2, flexbox);

	isBelow(text3, text1);
	isBelow(text3, text2);
	isLeftAlignedWith(text3, flexbox);

	equal(height(flexbox), height(text1) + height(text3));
});

let activity_flexbox_wrapped_with_horizontalscrollview = () =>
	getViews(
		`<ScrollView orientation="horizontal" width="100%" verticalAlignment="top">
        <FlexboxLayout iosOverflowSafeArea="false" id="flexbox" horizontalAlignment="left" height="400" flexDirection="${FlexDirection.COLUMN}" flexWrap="${FlexWrap.WRAP}" backgroundColor="gray">
            <Label id="text1" width="300" height="100%" text="1" backgroundColor="red" />
            <Label id="text2" width="300" height="100%" text="2" backgroundColor="green" />
            <Label id="text3" width="300" height="100%" text="3" backgroundColor="blue" />
        </FlexboxLayout>
    </ScrollView>`
	);

export const testFlexboxLayout_wrapped_with_HorizontalScrollView = test(activity_flexbox_wrapped_with_horizontalscrollview, noop, ({ root, flexbox, text1, text2, text3 }) => {
	isLeftAlignedWith(text1, flexbox);
	isTopAlignedWith(text1, flexbox);

	isRightOf(text2, text1);
	isTopAlignedWith(text2, flexbox);

	isRightOf(text2, text1);
	isTopAlignedWith(text2, flexbox);

	isRightOf(text3, text1);
	isRightOf(text3, text2);
	isTopAlignedWith(text3, flexbox);

	equal(width(flexbox), width(text1) + width(text2) + width(text3));
});

let activity_justify_content_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="100%" height="100%" flexDirection="${FlexDirection.ROW}" justifyContent="${JustifyContent.FLEX_START}" backgroundColor="gray">
        <Label id="text1" width="60" height="60" text="1" backgroundColor="red" />
        <Label id="text2" width="60" height="60" text="2" backgroundColor="green" />
        <Label id="text3" width="60" height="60" text="3" backgroundColor="blue" />
    </FlexboxLayout>`
	);

export const testJustifyContent_flexStart = test(activity_justify_content_test, noop, ({ root, flexbox, text1, text2, text3 }) => {
	isTopAlignedWith(text1, flexbox);
	isLeftAlignedWith(text1, flexbox);
	isRightOf(text2, text1);
	isRightOf(text3, text2);
});

let activity_justify_content_with_parent_padding = () =>
	getViews(
		`<GridLayout padding="24" width="100%" height="100%">
        <FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="100%" height="100%" padding="8" flexDirection="${FlexDirection.ROW}" justifyCOntent="${JustifyContent.FLEX_START}" backgroundColor="gray">
            <Label id="text1" width="60" height="60" text="1" backgroundColor="red" />
            <Label id="text2" width="60" height="60" text="2" backgroundColor="green" />
            <Label id="text3" width="60" height="60" text="3" backgroundColor="blue" />
        </FlexboxLayout>
    </GridLayout>`
	);

export const testJustifyContent_flexStart_withParentPadding = test(activity_justify_content_with_parent_padding, noop, ({ root, flexbox, text1, text2, text3 }) => {
	isRightOf(text2, text1);
	isRightOf(text3, text2);
	equal(left(text1), paddingLeft(flexbox), `Expected ${text1}.left to equal ${flexbox}.paddingLeft`);
	equal(top(text1), paddingTop(flexbox), `Expected ${text1}.top to equal ${flexbox}.paddingTop`);
});

export const testJustifyContent_flexEnd = test(
	activity_justify_content_test,
	({ flexbox }) => (flexbox.justifyContent = JustifyContent.FLEX_END),
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text3, flexbox);
		isRightAlignedWith(text3, flexbox);
		isLeftOf(text2, text3);
		isLeftOf(text1, text2);
	}
);

export const testJustifyContent_flexEnd_withParentPadding = test(
	activity_justify_content_with_parent_padding,
	({ flexbox }) => (flexbox.justifyContent = JustifyContent.FLEX_END),
	({ root, flexbox, text1, text2, text3 }) => {
		isLeftOf(text2, text3);
		isLeftOf(text1, text2);
		equal(top(text1), paddingTop(flexbox));
		equal(top(text2), paddingTop(flexbox));
		equal(top(text3), paddingTop(flexbox));
		equal(right(text3), paddingRight(flexbox));
		isRightWith(text2, text3, width(text3));
		isRightWith(text1, text2, width(text2));
	}
);

export const testJustifyContent_center = test(
	activity_justify_content_test,
	({ flexbox }) => (flexbox.justifyContent = JustifyContent.CENTER),
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isRightOf(text2, text1);
		isTopAlignedWith(text2, flexbox);
		isRightOf(text3, text2);
		isTopAlignedWith(text3, flexbox);

		let space = width(flexbox) - width(text1) - width(text2) - width(text3);
		space = space / 2;
		closeEnough(left(text1), paddingLeft(flexbox) + space);
		closeEnough(right(text3), paddingRight(flexbox) - space);
	}
);

export const testJustifyContent_center_withParentPadding = test(
	activity_justify_content_with_parent_padding,
	({ flexbox }) => (flexbox.justifyContent = JustifyContent.CENTER),
	({ root, flexbox, text1, text2, text3 }) => {
		isRightOf(text2, text1);
		isRightOf(text3, text2);
		let space = width(flexbox) - width(text1) - width(text2) - width(text3);
		space = space / 2;
		isLeftWith(flexbox, text1, space);
		isRightWith(text3, flexbox, space);
	}
);

export const testJustifyContent_spaceBetween = test(
	activity_justify_content_test,
	({ flexbox }) => (flexbox.justifyContent = JustifyContent.SPACE_BETWEEN),
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isLeftAlignedWith(text1, flexbox);
		isTopAlignedWith(text2, flexbox);
		isTopAlignedWith(text3, flexbox);
		isRightAlignedWith(text3, flexbox);
		let space = width(flexbox) - width(text1) - width(text2) - width(text3);
		space = space / 2;
		check(space - 1 <= left(text2) - right(text1) && left(text2) - right(text1) <= space + 1);
		check(space - 1 <= left(text3) - right(text2) && left(text3) - right(text2) <= space + 1);
	}
);

export const testJustifyContent_spaceBetween_withPadding = test(
	activity_justify_content_test,
	({ flexbox }) => {
		flexbox.justifyContent = JustifyContent.SPACE_BETWEEN;
		flexbox.style.padding = padding;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		let space = width(flexbox) - width(text1) - width(text2) - width(text3) - dipToDp(padding) * 2;
		space = space / 2;
		equal(left(text1), paddingLeft(flexbox));
		closeEnough(right(text1) + space, left(text2));
		closeEnough(right(text2) + space, left(text3));
		equal(right(text3), paddingRight(flexbox));
	}
);

export const testJustifyContent_spaceAround = test(
	activity_justify_content_test,
	({ flexbox }) => (flexbox.justifyContent = JustifyContent.SPACE_AROUND),
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isTopAlignedWith(text2, flexbox);
		isTopAlignedWith(text3, flexbox);

		let space = width(flexbox) - width(text1) - width(text2) - width(text3);
		space = space / 6; // Divide by the number of children * 2
		closeEnough(left(text1), paddingLeft(flexbox) + space);
		closeEnough(right(text1) + space * 2, left(text2));
		closeEnough(right(text2) + space * 2, left(text3));
		closeEnough(right(text3), paddingRight(flexbox) - space);
	}
);

const padding: any = 40;

export const testJustifyContent_spaceAround_withPadding = test(
	activity_justify_content_test,
	({ flexbox }) => {
		flexbox.justifyContent = JustifyContent.SPACE_AROUND;
		flexbox.style.padding = padding;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		let space = width(flexbox) - width(text1) - width(text2) - width(text3) - dipToDp(padding) * 2;
		space = space / 6; // Divide by the number of children * 2
		equal(top(text1), paddingTop(flexbox));
		closeEnough(left(text1), paddingLeft(flexbox) + space);
		closeEnough(right(text1) + space * 2, left(text2));
		closeEnough(right(text2) + space * 2, left(text3));
		closeEnough(right(text3), paddingRight(flexbox) - space);
		equal(bottom(text1), paddingBottom(flexbox));
	}
);

export const testJustifyContent_flexStart_flexDirection_column = test(
	activity_justify_content_test,
	({ flexbox }) => (flexbox.flexDirection = FlexDirection.COLUMN),
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isLeftAlignedWith(text1, flexbox);
		isBelow(text2, text1);
		isLeftAlignedWith(text2, flexbox);
		isBelow(text3, text2);
		isLeftAlignedWith(text3, flexbox);
	}
);

export const testJustifyContent_flexEnd_flexDirection_column = test(
	activity_justify_content_test,
	({ flexbox }) => {
		flexbox.justifyContent = JustifyContent.FLEX_END;
		flexbox.flexDirection = FlexDirection.COLUMN;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isBottomAlignedWith(text3, flexbox);
		isRightAlignedWith(text3, flexbox);
		isAbove(text2, text3);
		isAbove(text1, text2);
	}
);

export const testJustifyContent_center_flexDirection_column = test(
	activity_justify_content_test,
	({ flexbox }) => {
		flexbox.justifyContent = JustifyContent.CENTER;
		flexbox.flexDirection = FlexDirection.COLUMN;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isLeftAlignedWith(text1, flexbox);
		isBelow(text2, text1);
		isLeftAlignedWith(text2, flexbox);
		isBelow(text3, text2);
		isLeftAlignedWith(text3, flexbox);

		let space = height(flexbox) - height(text1) - height(text2) - height(text3);
		space = space / 2;
		isBelowWith(flexbox, text1, space);
		isAboveWith(text3, flexbox, space);
	}
);

export const testJustifyContent_spaceBetween_flexDirection_column = test(
	activity_justify_content_test,
	({ flexbox }) => {
		flexbox.justifyContent = JustifyContent.SPACE_BETWEEN;
		flexbox.flexDirection = FlexDirection.COLUMN;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isLeftAlignedWith(text1, flexbox);
		isLeftAlignedWith(text2, flexbox);
		isLeftAlignedWith(text3, flexbox);
		isBottomAlignedWith(text3, flexbox);

		let space = height(flexbox) - height(text1) - height(text2) - height(text3);
		space = space / 2;
		check(space - 1 <= top(text2) - bottom(text1) && top(text2) - bottom(text1) <= space + 1);
		check(space - 1 <= top(text3) - bottom(text2) && top(text3) - bottom(text2) <= space + 1);
	}
);

export const testJustifyContent_spaceBetween_flexDirection_column_withPadding = test(
	activity_justify_content_test,
	({ flexbox }) => {
		flexbox.justifyContent = JustifyContent.SPACE_BETWEEN;
		flexbox.flexDirection = FlexDirection.COLUMN;
		flexbox.style.padding = padding;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		let space = height(flexbox) - height(text1) - height(text2) - height(text3) - dipToDp(padding) * 2;
		space = space / 2;
		equal(top(text1), paddingTop(flexbox));
		equal(bottom(text3), paddingBottom(flexbox));
		equal(bottom(text1) + space, top(text2));
		equal(bottom(text2) + space, top(text3));
	}
);

export const testJustifyContent_spaceAround_flexDirection_column = test(
	activity_justify_content_test,
	({ flexbox }) => {
		flexbox.justifyContent = JustifyContent.SPACE_AROUND;
		flexbox.flexDirection = FlexDirection.COLUMN;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isLeftAlignedWith(text1, flexbox);
		isLeftAlignedWith(text2, flexbox);
		isLeftAlignedWith(text3, flexbox);

		let space = height(flexbox) - height(text1) - height(text2) - height(text3);
		space = space / 6; // Divide by the number of children * 2
		isBelowWith(flexbox, text1, space);
		closeEnough(bottom(text1) + 2 * space, top(text2));
		closeEnough(bottom(text2) + 2 * space, top(text3));
		isAboveWith(text3, flexbox, space);
	}
);

export const testJustifyContent_spaceAround_flexDirection_column_withPadding = test(
	activity_justify_content_test,
	({ flexbox }) => {
		flexbox.justifyContent = JustifyContent.SPACE_AROUND;
		flexbox.flexDirection = FlexDirection.COLUMN;
		flexbox.style.padding = padding;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		let space = height(flexbox) - height(text1) - height(text2) - height(text3) - dipToDp(padding) * 2;
		space = space / 6; // Divide by the number of children * 2

		closeEnough(top(text1), paddingTop(flexbox) + space);
		closeEnough(bottom(text1) + 2 * space, top(text2));
		closeEnough(bottom(text2) + 2 * space, top(text3));
		closeEnough(bottom(text3), paddingBottom(flexbox) - space);

		equal(left(text1), paddingLeft(flexbox));
		equal(left(text2), paddingLeft(flexbox));
		equal(left(text3), paddingLeft(flexbox));

		equal(right(text1), paddingRight(flexbox));
		equal(right(text2), paddingRight(flexbox));
		equal(right(text3), paddingRight(flexbox));
	}
);

let activity_flex_grow_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="100%" height="100%" flexDirection="${FlexDirection.ROW}" flexWrap="${FlexWrap.WRAP}" backgroundColor="gray">
            <Label id="text1" width="60" height="60" text="1" backgroundColor="red" />
            <Label id="text2" width="60" height="60" text="2" backgroundColor="green" />
            <Label id="text3" width="60" height="60" text="3" backgroundColor="blue" flexGrow="1" />
        </FlexboxLayout>`
	);

export const testFlexGrow_withExactParentLength = test(activity_flex_grow_test, noop, ({ root, flexbox, text1, text2, text3 }) => {
	isTopAlignedWith(text1, flexbox);
	isLeftAlignedWith(text1, flexbox);
	isTopAlignedWith(text2, flexbox);
	isRightOf(text2, text1);
	isTopAlignedWith(text3, flexbox);
	isRightAlignedWith(text3, flexbox);
	isRightOf(text3, text2);

	equal(width(text3), width(flexbox) - width(text1) - width(text2));
});

export const testFlexGrow_withExactParentLength_flexDirection_column = test(
	activity_flex_grow_test,
	({ flexbox }) => (flexbox.flexDirection = FlexDirection.COLUMN),
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isLeftAlignedWith(text1, flexbox);
		isLeftAlignedWith(text2, flexbox);
		isBelow(text2, text1);

		isLeftAlignedWith(text3, flexbox);
		isBottomAlignedWith(text3, flexbox);
		isBelow(text3, text2);

		equal(height(text3), height(flexbox) - height(text1) - height(text2));
	}
);

export const testFlexGrow_including_view_gone = test(
	activity_flex_grow_test,
	({ flexbox, text2 }) => (text2.visibility = 'collapse'),
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isLeftAlignedWith(text1, flexbox);

		isTopAlignedWith(text3, flexbox);
		isRightAlignedWith(text3, flexbox);
		isRightOf(text3, text1);

		equal(width(text3), width(flexbox) - width(text1));
	}
);

let activity_align_content_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="320" height="320" flexDirection="${FlexDirection.ROW}" flexWrap="${FlexWrap.WRAP}" alignContent="${AlignContent.STRETCH}" backgroundColor="gray">
        <Label id="text1" width="120" height="120" text="1" backgroundColor="red" />
        <Label id="text2" width="120" height="120" text="2" backgroundColor="green" />
        <Label id="text3" width="120" height="120" text="3" backgroundColor="blue" />
    </FlexboxLayout>`
	);

export const testAlignContent_stretch = test(activity_align_content_test, noop, ({ root, flexbox, text1, text2, text3 }) => {
	isTopAlignedWith(text1, flexbox);
	isLeftAlignedWith(text1, flexbox);
	isTopAlignedWith(text2, flexbox);
	isRightOf(text2, text1);

	isLeftAlignedWith(text3, flexbox);
	isBelow(text3, text1);
	isBelow(text3, text2);
	equal(top(text3), top(flexbox) + height(flexbox) / 2);
});

export const testAlignContent_flexStart = test(
	activity_align_content_test,
	({ flexbox }) => (flexbox.alignContent = AlignContent.FLEX_START),
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isLeftAlignedWith(text1, flexbox);
		isTopAlignedWith(text2, flexbox);
		isRightOf(text2, text1);

		isLeftAlignedWith(text3, flexbox);
		isBelow(text3, text1);
		isBelow(text3, text2);
		equal(top(text3), top(text1) + height(text1));
	}
);

export const testAlignContent_flexEnd = test(
	activity_align_content_test,
	({ flexbox }) => (flexbox.alignContent = AlignContent.FLEX_END),
	({ root, flexbox, text1, text2, text3 }) => {
		isLeftAlignedWith(text3, flexbox);
		isBottomAlignedWith(text3, flexbox);
		isAbove(text1, text3);
		isLeftAlignedWith(text1, flexbox);
		isAbove(text2, text3);
		equal(bottom(text1), top(flexbox) + height(flexbox) - height(text3));
	}
);

export const testAlignContent_flexEnd_parentPadding = test(
	activity_align_content_test,
	({ flexbox }) => {
		flexbox.alignContent = AlignContent.FLEX_END;
		flexbox.style.padding = '32';
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isAbove(text1, text3);
		isAbove(text1, text3);
		isAbove(text2, text3);
		equal(bottom(text3), paddingBottom(flexbox));
	}
);

export const testAlignContent_flexEnd_parentPadding_column = test(
	activity_align_content_test,
	({ flexbox }) => {
		flexbox.alignContent = AlignContent.FLEX_END;
		flexbox.flexDirection = FlexDirection.COLUMN;
		flexbox.style.padding = '32';
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isLeftOf(text1, text3);
		isLeftOf(text2, text3);
		equal(right(text3), paddingRight(flexbox));
	}
);

export const testAlignContent_center = test(
	activity_align_content_test,
	({ flexbox }) => (flexbox.alignContent = AlignContent.CENTER),
	({ root, flexbox, text1, text2, text3 }) => {
		isLeftAlignedWith(text1, flexbox);
		isRightOf(text2, text1);
		isBelow(text3, text1);

		let spaceAboveAndBottom = height(flexbox) - height(text1) - height(text3);
		spaceAboveAndBottom /= 2;
		isBelowWith(flexbox, text1, spaceAboveAndBottom);
		isAboveWith(text3, flexbox, spaceAboveAndBottom);

		// TODO: equal(flexbox.getFlexLines().size(), is(2));
	}
);

export const testAlignContent_spaceBetween = test(
	activity_align_content_test,
	({ flexbox }) => (flexbox.alignContent = AlignContent.SPACE_BETWEEN),
	({ root, flexbox, text1, text2, text3 }) => {
		isLeftAlignedWith(text1, flexbox);
		isTopAlignedWith(text1, flexbox);
		isRightOf(text2, text1);
		isTopAlignedWith(text2, flexbox);
		isBottomAlignedWith(text3, flexbox);
		isLeftAlignedWith(text3, flexbox);
		// TODO: equal(flexbox.getFlexLines().size(), is(2));
	}
);

export const testAlignContent_spaceBetween_withPadding = test(
	activity_align_content_test,
	({ flexbox }) => (flexbox.alignContent = AlignContent.SPACE_BETWEEN),
	({ root, flexbox, text1, text2, text3 }) => {
		isLeftAlignedWith(text1, flexbox);
		isTopAlignedWith(text1, flexbox);
		isRightOf(text2, text1);
		isTopAlignedWith(text2, flexbox);
		isBottomAlignedWith(text3, flexbox);
		isLeftAlignedWith(text3, flexbox);
	}
);

export const testAlignContent_spaceAround = test(
	activity_align_content_test,
	({ flexbox }) => (flexbox.alignContent = AlignContent.SPACE_AROUND),
	({ root, flexbox, text1, text2, text3 }) => {
		isLeftAlignedWith(text1, flexbox);
		isRightOf(text2, text1);
		isLeftAlignedWith(text3, flexbox);

		let spaceAround = height(flexbox) - height(text1) - height(text3);
		spaceAround /= 4; // Divide by the number of flex lines * 2

		isBelowWith(flexbox, text1, Math.ceil(spaceAround));
		isBelowWith(text1, text3, height(text1) + 2 * spaceAround);
		isAboveWith(text3, flexbox, Math.ceil(spaceAround));
		isAboveWith(text1, text3, height(text3) + 2 * spaceAround);

		// TODO: equal(flexbox.getFlexLines().size(), is(2));
	}
);

export const testAlignContent_stretch_parentWrapContent = test(
	activity_align_content_test,
	({ flexbox }) => {
		flexbox.height = unsetValue; // TODO: Check that "NaN" is auto-ish
		flexbox.verticalAlignment = 'top';
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isLeftAlignedWith(text1, flexbox);
		isTopAlignedWith(text2, flexbox);
		isRightOf(text2, text1);

		isLeftAlignedWith(text3, flexbox);
		isBelow(text3, text1);
		isBelow(text3, text2);

		equal(top(text3), bottom(text1));
		// TODO: equal(flexbox.getFlexLines().size(), is(2));
	}
);

export const testAlignContent_stretch_flexDirection_column = test(
	activity_align_content_test,
	({ flexbox }) => (flexbox.flexDirection = FlexDirection.COLUMN),
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isLeftAlignedWith(text1, flexbox);
		isLeftAlignedWith(text2, flexbox);
		isBelow(text2, text1);
		// the third TextView is wrapped to the next flex line
		isTopAlignedWith(text3, flexbox);
		isRightOf(text3, text1);
		isRightOf(text3, text2);

		let flexLineCrossSize = width(flexbox) / 2;
		equal(left(text3), flexLineCrossSize + left(flexbox));
	}
);

export const testAlignContent_flexStart_flexDirection_column = test(
	activity_align_content_test,
	({ flexbox }) => {
		flexbox.alignContent = AlignContent.FLEX_START;
		flexbox.flexDirection = FlexDirection.COLUMN;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isLeftAlignedWith(text1, flexbox);
		isLeftAlignedWith(text2, flexbox);
		isBelow(text2, text1);

		isTopAlignedWith(text3, flexbox);
		isRightOf(text3, text1);
		isRightOf(text3, text2);
		equal(left(text3), width(text1) + left(flexbox));
	}
);

export const testAlignContent_flexEnd_flexDirection_column = test(
	activity_align_content_test,
	({ flexbox }) => {
		flexbox.alignContent = AlignContent.FLEX_END;
		flexbox.flexDirection = FlexDirection.COLUMN;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isRightAlignedWith(text3, flexbox);
		isTopAlignedWith(text3, flexbox);
		isLeftOf(text1, text3);
		isTopAlignedWith(text1, flexbox);
		isBelow(text2, text3);
		equal(right(text1), left(flexbox) + width(flexbox) - width(text3));
	}
);

export const testAlignContent_center_flexDirection_column = test(
	activity_align_content_test,
	({ flexbox }) => {
		flexbox.alignContent = AlignContent.CENTER;
		flexbox.flexDirection = FlexDirection.COLUMN;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isBelow(text2, text1);
		isRightOf(text3, text1);

		let spaceLeftAndRight = width(flexbox) - width(text1) - width(text3);
		spaceLeftAndRight /= 2;
		isLeftWith(flexbox, text1, spaceLeftAndRight);
		isRightWith(text3, flexbox, spaceLeftAndRight);
	}
);

export const testAlignContent_spaceBetween_flexDirection_column = test(
	activity_align_content_test,
	({ flexbox }) => {
		flexbox.alignContent = AlignContent.SPACE_BETWEEN;
		flexbox.flexDirection = FlexDirection.COLUMN;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isLeftAlignedWith(text1, flexbox);
		isTopAlignedWith(text1, flexbox);
		isBelow(text2, text1);
		isLeftAlignedWith(text2, flexbox);
		isRightAlignedWith(text3, flexbox);
		isTopAlignedWith(text3, flexbox);
	}
);

export const testAlignContent_spaceAround_flexDirection_column = test(
	activity_align_content_test,
	({ flexbox }) => {
		flexbox.alignContent = AlignContent.SPACE_AROUND;
		flexbox.flexDirection = FlexDirection.COLUMN;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isBelow(text2, text1);
		isTopAlignedWith(text3, flexbox);

		let spaceAround = width(flexbox) - width(text1) - width(text3);
		spaceAround /= 4; // Divide by the number of flex lines * 2
		isLeftWith(flexbox, text1, Math.ceil(spaceAround));
		isLeftWith(text1, text3, width(text1) + 2 * spaceAround);
		isRightWith(text3, flexbox, Math.ceil(spaceAround));
		isRightWith(text1, text3, width(text3) + 2 * spaceAround);
	}
);

export const testAlignContent_stretch_parentWrapContent_flexDirection_column = test(
	activity_align_content_test,
	({ flexbox }) => {
		flexbox.width = unsetValue; // TODO: Check default is Number.NaN
		flexbox.horizontalAlignment = 'left';
		flexbox.flexDirection = FlexDirection.COLUMN;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isLeftAlignedWith(text1, flexbox);
		isLeftAlignedWith(text2, flexbox);
		isBelow(text2, text1);

		isTopAlignedWith(text3, flexbox);
		isRightOf(text3, text1);
		isRightOf(text3, text2);
		equal(left(text3), left(flexbox) + width(text1));
	}
);

let activity_stretch_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="360" height="360" flexDirection="${FlexDirection.ROW}" flexWrap="${FlexWrap.WRAP}" alignItems="${AlignItems.STRETCH}" backgroundColor="gray">
        <Label id="text1" width="140" height="80" text="1" backgroundColor="red" />
        <Label id="text2" width="140" height="80" text="2" backgroundColor="green" />
        <Label id="text3" width="140" height="80" text="3" backgroundColor="blue" />
    </FlexboxLayout>`
	);

export const testAlignItems_stretch = test(activity_stretch_test, noop, ({ root, flexbox, text1, text2, text3 }) => {
	isTopAlignedWith(text1, flexbox);
	isLeftAlignedWith(text1, flexbox);
	isTopAlignedWith(text2, flexbox);
	isRightOf(text2, text1);
	isLeftAlignedWith(text3, flexbox);
	isBelow(text3, text1);
	isBelow(text3, text2);

	let flexLineSize = height(flexbox) / 2;
	check(flexLineSize - 1 <= height(text1) && height(text1) <= flexLineSize + 1);
	check(flexLineSize - 1 <= height(text2) && flexLineSize <= flexLineSize + 1);
	check(flexLineSize - 1 <= height(text3) && height(text3) <= flexLineSize + 1);
});

let activity_align_self_stretch_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="320" height="320" flexDirection="${FlexDirection.ROW}" flexWrap="${FlexWrap.WRAP}" alignItems="${AlignItems.FLEX_START}" alignContent="${AlignContent.STRETCH}" backgroundColor="gray">
        <Label id="text1" width="120" height="120" text="1" backgroundColor="red" alignSelf="${AlignSelf.STRETCH}" />
        <Label id="text2" width="120" height="120" text="2" backgroundColor="green" />
        <Label id="text3" width="120" height="120" text="3" backgroundColor="blue" />
    </FlexboxLayout>`
	);

export const testAlignSelf_stretch = test(activity_align_self_stretch_test, noop, ({ root, flexbox, text1, text2, text3 }) => {
	isTopAlignedWith(text1, flexbox);
	isLeftAlignedWith(text1, flexbox);
	isTopAlignedWith(text2, flexbox);
	isRightOf(text2, text1);
	isLeftAlignedWith(text3, flexbox);
	isBelow(text3, text1);
	isBelow(text3, text2);

	let flexLineSize = height(flexbox) / 2;
	check(flexLineSize - 1 <= height(text1) && height(text1) <= flexLineSize + 1);

	// use eps.
	notEqual(height(text2), flexLineSize);
	notEqual(height(text3), flexLineSize);
});

export const testAlignSelf_stretch_flexDirection_column = test(
	activity_align_self_stretch_test,
	({ flexbox }) => (flexbox.flexDirection = FlexDirection.COLUMN),
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isLeftAlignedWith(text1, flexbox);
		isLeftAlignedWith(text2, flexbox);
		isBelow(text2, text1);
		isTopAlignedWith(text3, flexbox);
		isRightOf(text3, text1);
		isRightOf(text3, text2);

		let flexLineSize = width(flexbox) / 2;
		check(flexLineSize - 1 <= width(text1) && width(text1) <= flexLineSize + 1);
		// use eps.
		notEqual(width(text2), flexLineSize);
		notEqual(width(text3), flexLineSize);
	}
);

let activity_align_items_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="320" height="320" flexDirection="${FlexDirection.ROW}" flexWrap="${FlexWrap.WRAP}" alignContent="${AlignContent.STRETCH}" alignItems="${AlignItems.FLEX_START}" backgroundColor="gray">
        <Label id="text1" width="120" height="120" text="1" backgroundColor="red" />
        <Label id="text2" width="120" height="120" text="2" backgroundColor="green" />
        <Label id="text3" width="120" height="120" text="3" backgroundColor="blue" />
    </FlexboxLayout>`
	);

export const testAlignItems_flexStart = test(
	activity_align_items_test,
	({ flexbox }) => (flexbox.alignItems = AlignItems.FLEX_START),
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isLeftAlignedWith(text1, flexbox);
		isTopAlignedWith(text2, flexbox);
		isRightOf(text2, text1);
		isLeftAlignedWith(text3, flexbox);
		isBelow(text3, text1);
		isBelow(text3, text2);

		let flexLineSize = height(flexbox) / 2;
		notEqual(height(text1), flexLineSize);
		notEqual(height(text2), flexLineSize);
		notEqual(height(text3), flexLineSize);
		equal(top(flexbox) + flexLineSize, top(text3));
	}
);

export const testAlignItems_flexEnd = test(
	activity_align_items_test,
	({ flexbox }) => (flexbox.alignItems = AlignItems.FLEX_END),
	({ root, flexbox, text1, text2, text3 }) => {
		isLeftAlignedWith(text1, flexbox);
		isRightOf(text2, text1);
		isLeftAlignedWith(text3, flexbox);
		isBelow(text3, text1);
		isBelow(text3, text2);
		isBottomAlignedWith(text3, flexbox);

		let flexLineSize = height(flexbox) / 2;
		notEqual(height(text1), flexLineSize);
		notEqual(height(text2), flexLineSize);
		notEqual(height(text3), flexLineSize);
		equal(top(flexbox) + flexLineSize, bottom(text1));
		equal(top(flexbox) + flexLineSize, bottom(text2));
		equal(bottom(text3), top(flexbox) + height(flexbox));
	}
);

let activity_align_items_parent_padding_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="320" height="320" padding="16" flexDirection="${FlexDirection.ROW}" flexWrap="${FlexWrap.WRAP}" alignItems="${AlignItems.FLEX_END}" backgroundColor="gray">
        <Label id="text1" width="120" height="120" text="1" backgroundColor="red" />
        <Label id="text2" width="120" height="120" text="2" backgroundColor="green" />
    </FlexboxLayout>`
	);

export const testAlignItems_flexEnd_parentPadding = test(
	activity_align_items_parent_padding_test,
	({ flexbox }) => (flexbox.alignItems = AlignItems.FLEX_END),
	({ root, flexbox, text1, text2, text3 }) => {
		isRightOf(text2, text1);
		isAboveWith(text1, flexbox, Length.toDevicePixels(flexbox.style.paddingBottom, 0));
		isAboveWith(text2, flexbox, Length.toDevicePixels(flexbox.style.paddingBottom, 0));
	}
);

export const testAlignItems_flexEnd_parentPadding_column = test(
	activity_align_items_parent_padding_test,
	({ flexbox }) => {
		flexbox.alignItems = AlignItems.FLEX_END;
		flexbox.flexDirection = FlexDirection.COLUMN;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isBelow(text2, text1);
		isRightWith(text1, flexbox, Length.toDevicePixels(flexbox.style.paddingRight, 0));
		isRightWith(text2, flexbox, Length.toDevicePixels(flexbox.style.paddingRight, 0));
	}
);

export const testAlignItems_center = test(
	activity_align_items_test,
	({ flexbox }) => (flexbox.alignItems = AlignItems.CENTER),
	({ root, flexbox, text1, text2, text3 }) => {
		isLeftAlignedWith(text1, flexbox);
		isRightOf(text2, text1);
		isLeftAlignedWith(text3, flexbox);
		isBelow(text3, text1);
		isBelow(text3, text2);

		let flexLineSize = height(flexbox) / 2;
		let spaceAboveAndBelow = (flexLineSize - height(text1)) / 2;
		notEqual(height(text1), flexLineSize);
		notEqual(height(text2), flexLineSize);
		notEqual(height(text3), flexLineSize);

		isBelowWith(flexbox, text1, spaceAboveAndBelow);
		isBelowWith(flexbox, text2, spaceAboveAndBelow);
		isBelowWith(text1, text3, flexLineSize);
		isBelowWith(text2, text3, flexLineSize);

		isAboveWith(text3, flexbox, spaceAboveAndBelow);
		isAboveWith(text1, text3, flexLineSize);
	}
);

export const testAlignItems_flexEnd_wrapReverse = test(
	activity_align_items_test,
	({ flexbox }) => {
		flexbox.flexWrap = FlexWrap.WRAP_REVERSE;
		flexbox.alignItems = AlignItems.FLEX_END;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isLeftAlignedWith(text1, flexbox);
		isRightOf(text2, text1);
		isLeftAlignedWith(text3, flexbox);
		isTopAlignedWith(text3, flexbox);

		let flexLineSize = height(flexbox) / 2;
		notEqual(height(text1), flexLineSize);
		notEqual(height(text2), flexLineSize);
		notEqual(height(text3), flexLineSize);

		isBelowWith(flexbox, text1, flexLineSize);
		isBelowWith(flexbox, text2, flexLineSize);
		isBelowWith(text3, text1, flexLineSize);
		isBelowWith(text3, text2, flexLineSize);
	}
);

export const testAlignItems_center_wrapReverse = test(
	activity_align_items_test,
	({ flexbox }) => {
		flexbox.flexWrap = FlexWrap.WRAP_REVERSE;
		flexbox.alignItems = AlignItems.CENTER;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isLeftAlignedWith(text1, flexbox);
		isRightOf(text2, text1);
		isLeftAlignedWith(text3, flexbox);

		let flexLineSize = height(flexbox) / 2;
		let spaceAboveAndBelow = (flexLineSize - height(text1)) / 2;
		notEqual(height(text1), flexLineSize);
		notEqual(height(text2), flexLineSize);
		notEqual(height(text3), flexLineSize);

		isBelowWith(flexbox, text3, spaceAboveAndBelow);
		isBelowWith(text3, text1, flexLineSize);
		isBelowWith(text3, text2, flexLineSize);

		isAboveWith(text3, text1, flexLineSize);
		isAboveWith(text1, flexbox, spaceAboveAndBelow);
		isAboveWith(text2, flexbox, spaceAboveAndBelow);
	}
);

export const testAlignItems_flexStart_flexDirection_column = test(
	activity_align_items_test,
	({ flexbox }) => (flexbox.flexDirection = FlexDirection.COLUMN),
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isLeftAlignedWith(text1, flexbox);
		isLeftAlignedWith(text2, flexbox);
		isBelow(text2, text1);
		isTopAlignedWith(text3, flexbox);
		isRightOf(text3, text1);
		isRightOf(text3, text2);

		let flexLineSize = width(flexbox) / 2;
		notEqual(width(text1), flexLineSize);
		notEqual(width(text2), flexLineSize);
		notEqual(width(text3), flexLineSize);
		isLeftWith(flexbox, text3, flexLineSize);
	}
);

export const testAlignItems_flexEnd_flexDirection_column = test(
	activity_align_items_test,
	({ flexbox }) => {
		flexbox.alignItems = AlignItems.FLEX_END;
		flexbox.flexDirection = FlexDirection.COLUMN;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isBelow(text2, text1);
		isTopAlignedWith(text3, flexbox);
		isRightOf(text3, text1);
		isRightOf(text3, text2);
		isRightAlignedWith(text3, flexbox);

		let flexLineSize = width(flexbox) / 2;
		notEqual(width(text1), flexLineSize);
		notEqual(width(text2), flexLineSize);
		notEqual(width(text3), flexLineSize);
		isRightWith(text1, flexbox, flexLineSize);
		isRightWith(text2, flexbox, flexLineSize);
	}
);

export const testAlignItems_center_flexDirection_column = test(
	activity_align_items_test,
	({ flexbox }) => {
		flexbox.alignItems = AlignItems.CENTER;
		flexbox.flexDirection = FlexDirection.COLUMN;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isBelow(text2, text1);
		isTopAlignedWith(text3, flexbox);
		isRightOf(text3, text1);
		isRightOf(text3, text2);

		let flexLineSize = width(flexbox) / 2;
		let spaceLeftAndRight = (flexLineSize - width(text1)) / 2;
		notEqual(width(text1), flexLineSize);
		notEqual(width(text2), flexLineSize);
		notEqual(width(text3), flexLineSize);
		isLeftWith(flexbox, text1, spaceLeftAndRight);
		isLeftWith(flexbox, text2, spaceLeftAndRight);
		isLeftWith(flexbox, text3, flexLineSize + spaceLeftAndRight);
	}
);

export const testAlignItems_flexEnd_wrapReverse_flexDirection_column = test(
	activity_align_items_test,
	({ flexbox }) => {
		flexbox.flexWrap = FlexWrap.WRAP_REVERSE;
		flexbox.alignItems = AlignItems.FLEX_END;
		flexbox.flexDirection = FlexDirection.COLUMN;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isBelow(text2, text1);
		isLeftAlignedWith(text3, flexbox);
		isTopAlignedWith(text3, flexbox);

		let flexLineSize = width(flexbox) / 2;
		notEqual(width(text1), flexLineSize);
		notEqual(width(text2), flexLineSize);
		notEqual(width(text3), flexLineSize);
		isLeftWith(flexbox, text1, flexLineSize);
		isLeftWith(flexbox, text2, flexLineSize);
	}
);

export const testAlignItems_center_wrapReverse_flexDirection_column = test(
	activity_align_items_test,
	({ flexbox }) => {
		flexbox.flexWrap = FlexWrap.WRAP_REVERSE;
		flexbox.alignItems = AlignItems.CENTER;
		flexbox.flexDirection = FlexDirection.COLUMN;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isBelow(text2, text1);
		isTopAlignedWith(text3, flexbox);

		let flexLineSize = width(flexbox) / 2;
		let spaceLeftAndRight = (flexLineSize - width(text1)) / 2;
		notEqual(width(text1), flexLineSize);
		notEqual(width(text2), flexLineSize);
		notEqual(width(text3), flexLineSize);
		isLeftWith(flexbox, text1, flexLineSize + spaceLeftAndRight);
		isLeftWith(flexbox, text2, flexLineSize + spaceLeftAndRight);
		isLeftWith(flexbox, text3, spaceLeftAndRight);
		isRightWith(text1, flexbox, spaceLeftAndRight);
		isRightWith(text2, flexbox, spaceLeftAndRight);
		isRightWith(text3, flexbox, flexLineSize + spaceLeftAndRight);
	}
);

let activity_align_items_baseline_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="100%" height="100%" flexDirection="${FlexDirection.ROW}" flexWrap="${FlexWrap.WRAP}" alignItems="${AlignItems.BASELINE}" backgroundColor="gray">
        <Label id="text1" width="30" height="80" text="1" verticalAlignment="bottom" backgroundColor="red" />
        <Label id="text2" width="30" height="80" text="2" verticalAlignment="top" backgroundColor="green" />
        <Label id="text3" width="30" height="80" text="2" verticalAlignment="center" backgroundColor="blue" />
    </FlexboxLayout>`
	);

export const testAlignItems_baseline = test(activity_align_items_baseline_test, noop, ({ root, flexbox, text1, text2, text3 }) => {
	let topPluBaseline1 = top(text1) + baseline(text1);
	let topPluBaseline2 = top(text2) + baseline(text2);
	let topPluBaseline3 = top(text3) + baseline(text3);

	equal(topPluBaseline1, topPluBaseline2);
	equal(topPluBaseline2, topPluBaseline3);
});

export const testAlignItems_baseline_wrapReverse = test(
	activity_align_items_baseline_test,
	({ flexbox }) => (flexbox.flexWrap = FlexWrap.WRAP_REVERSE),
	({ root, flexbox, text1, text2, text3 }) => {
		let bottomPluBaseline1 = bottom(text1) + baseline(text1);
		let bottomPluBaseline2 = bottom(text2) + baseline(text2);
		let bottomPluBaseline3 = bottom(text3) + baseline(text3);

		equal(bottomPluBaseline1, bottomPluBaseline2);
		equal(bottomPluBaseline2, bottomPluBaseline3);
	}
);

let activity_flex_wrap_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="360" height="300" flexDirection="${FlexDirection.ROW}" flexWrap="${FlexWrap.WRAP}" backgroundColor="gray">
        <Label id="text1" width="160" height="120" text="1" backgroundColor="red" />
        <Label id="text2" width="160" height="120" text="2" backgroundColor="green" />
        <Label id="text3" width="160" height="120" text="3" backgroundColor="blue" />
    </FlexboxLayout>`
	);

export const testFlexDirection_row_reverse = test(
	activity_flex_wrap_test,
	({ flexbox }) => (flexbox.flexDirection = FlexDirection.ROW_REVERSE),
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isRightAlignedWith(text1, flexbox);
		isTopAlignedWith(text2, flexbox);
		isLeftOf(text2, text1);
		isBelow(text3, text1);
		isBelow(text3, text2);
		isRightAlignedWith(text3, flexbox);
	}
);

export const testFlexDirection_column_reverse = test(
	activity_flex_wrap_test,
	({ flexbox }) => (flexbox.flexDirection = FlexDirection.COLUMN_REVERSE),
	({ root, flexbox, text1, text2, text3 }) => {
		isBottomAlignedWith(text1, flexbox);
		isLeftAlignedWith(text1, flexbox);
		isLeftAlignedWith(text2, flexbox);
		isAbove(text2, text1);
		isRightOf(text3, text1);
		isRightOf(text3, text2);
		isBottomAlignedWith(text3, flexbox);
	}
);

let activity_flex_basis_percent_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="100%" height="100%" flexDirection="${FlexDirection.ROW}" flexWrap="${FlexWrap.WRAP}" backgroundColor="gray">
        <Label id="text1" width="50%" height="50%" text="1" backgroundColor="red" />
        <Label id="text2" width="60%" height="60%" text="2" backgroundColor="green" />
        <Label id="text3" width="60" height="60" text="3" backgroundColor="blue" />
    </FlexboxLayout>`
	);

export const testFlexBasisPercent_wrap = test(activity_flex_basis_percent_test, noop, ({ root, flexbox, text1, text2, text3 }) => {
	isTopAlignedWith(text1, flexbox);
	isLeftAlignedWith(text1, flexbox);
	isLeftAlignedWith(text2, flexbox);
	isBelow(text2, text1);
	isRightOf(text3, text2);

	// use eps.
	closeEnough(width(text1), Math.round(width(flexbox) * 0.5));
	closeEnough(width(text2), Math.round(width(flexbox) * 0.6));
});

export const testFlexBasisPercent_nowrap = test(
	activity_flex_basis_percent_test,
	({ flexbox }) => (flexbox.flexWrap = FlexWrap.NOWRAP),
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isLeftAlignedWith(text1, flexbox);
		isTopAlignedWith(text2, flexbox);
		isRightOf(text2, text1);
		isTopAlignedWith(text3, flexbox);
		isRightOf(text3, text2);

		let totalWidth = width(text1) + width(text2) + width(text3);
		check(totalWidth >= width(flexbox) - 3 || totalWidth <= width(flexbox) + 3);
	}
);

export const testFlexBasisPercent_wrap_flexDirection_column = test(
	activity_flex_basis_percent_test,
	({ flexbox }) => (flexbox.flexDirection = FlexDirection.COLUMN),
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isLeftAlignedWith(text1, flexbox);
		isTopAlignedWith(text2, flexbox);
		isRightOf(text2, text1);
		isBelow(text3, text2);

		closeEnough(height(text1), Math.round(height(flexbox) * 0.5));
		closeEnough(height(text2), Math.round(height(flexbox) * 0.6));
	}
);

export const testFlexBasisPercent_nowrap_flexDirection_column = test(
	activity_flex_basis_percent_test,
	({ flexbox }) => {
		flexbox.flexWrap = FlexWrap.NOWRAP;
		flexbox.flexDirection = FlexDirection.COLUMN;
	},
	({ root, flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isLeftAlignedWith(text1, flexbox);
		isLeftAlignedWith(text2, flexbox);
		isBelow(text2, text1);
		isLeftAlignedWith(text3, flexbox);
		isBelow(text3, text2);

		let totalHeight = height(text1) + height(text2) + height(text3);

		check(totalHeight >= height(flexbox) - 3 || totalHeight <= height(flexbox) + 3);
	}
);

let activity_minwidth_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="400" height="400" backgroundColor="gray">
            <Label id="text1" horizontalAlignment="left" verticalAlignment="top" text="1" minWidth="100" backgroundColor="red" />
            <Label id="text2" horizontalAlignment="left" verticalAlignment="top" text="2" minWidth="100" backgroundColor="green" flexGrow="1" />
        </FlexboxLayout>`
	);

export const testMinWidth_initial_width_less_than_minWidth = test(activity_minwidth_test, noop, ({ root, flexbox, text1, text2, text3 }) => {
	let minWidth = 100;
	closeEnough(width(text1), dipToDp(minWidth));
	closeEnough(width(text2), width(flexbox) - dipToDp(minWidth));
});

let activity_minwidth_lower_bound_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="400" height="400" flexWrap="${FlexWrap.NOWRAP}" backgroundColor="gray">
        <Label id="text1" width="200" verticalAlignment="top" text="1" minWidth="150" backgroundColor="red" />
        <Label id="text2" width="200" verticalAlignment="top" text="1" backgroundColor="green" />
        <Label id="text3" width="200" verticalAlignment="top" text="1" backgroundColor="blue" />
        <Label id="text4" width="200" verticalAlignment="top" text="1" backgroundColor="purple" />
    </FlexboxLayout>`
	);

export const testMinWidth_works_as_lower_bound_shrink_to = test(activity_minwidth_lower_bound_test, noop, ({ root, flexbox, text1, text2, text3, text4 }) => {
	closeEnough(width(text1), dipToDp(150));
	closeEnough(width(flexbox), width(text1) + width(text2) + width(text3) + width(text4));
});

let activity_minheight_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="400" height="400" flexDirection="${FlexDirection.COLUMN}" backgroundColor="gray">
        <Label id="text1" horizontalAlignment="left" verticalAlignment="top" text="1" minHeight="100" backgroundColor="red" />
        <Label id="text2" horizontalAlignment="left" verticalAlignment="top" text="2" backgroundColor="green" flexGrow="1" />
    </FlexboxLayout>`
	);

export const testMinHeight_initial_height_less_than_minHeight = test(activity_minheight_test, noop, ({ root, flexbox, text1, text2 }) => {
	closeEnough(height(text1), dipToDp(100));
	closeEnough(height(text2), height(flexbox) - dipToDp(100));
});

let activity_minheight_lower_bound_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="400" height="400" flexDirection="${FlexDirection.COLUMN}" flexWrap="${FlexWrap.NOWRAP}" backgroundColor="gray">
        <Label id="text1" horizontalAlignment="left" height="200" text="1" minHeight="150" backgroundColor="red" />
        <Label id="text2" horizontalAlignment="left" height="200" text="2" backgroundColor="green" />
        <Label id="text3" horizontalAlignment="left" height="200" text="3" backgroundColor="blue" />
        <Label id="text4" horizontalAlignment="left" height="200" text="4" backgroundColor="purple" />
    </FlexboxLayout>`
	);

export const testMinHeight_works_as_lower_bound_shrink_to = test(activity_minheight_lower_bound_test, noop, ({ root, flexbox, text1, text2, text3, text4 }) => {
	closeEnough(height(text1), dipToDp(150));
	closeEnough(height(flexbox), height(text1) + height(text2) + height(text3) + height(text4));
});

// We do not support maxWidth/maxHeight
// omit: testMaxWidth_initial_width_more_than_maxWidth
// omit: testMaxWidth_works_as_upper_bound_expand_to
// omit: testMaxHeight_initial_height_more_than_maxHeight
// omit: testMaxHeight_works_as_lower_bound_expand_to

let activity_views_visibility_gone = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="360" height="300" flexDirection="${FlexDirection.ROW}" flexWrap="${FlexWrap.WRAP}" backgroundColor="gray">
        <Label id="text1" width="160" height="120" text="1" visibility="collapse" backgroundColor="red" />
        <Label id="text2" width="160" height="120" text="2" visibility="collapse" backgroundColor="green" />
        <Label id="text3" width="160" height="120" text="3" backgroundColor="blue" />
        <Label id="text4" width="160" height="120" text="4" backgroundColor="purple" />
        <Label id="text5" width="160" height="120" text="5" backgroundColor="cyan" />
    </FlexboxLayout>`
	);

export const testView_visibility_gone = test(activity_views_visibility_gone, noop, ({ root, flexbox, text1, text2, text3, text4, text5 }) => {
	isTopAlignedWith(text3, flexbox);
	isLeftAlignedWith(text3, flexbox);
	isTopAlignedWith(text4, flexbox);
	isRightOf(text4, text3);
	isLeftAlignedWith(text5, flexbox);
	isBelow(text5, text3);

	equal(left(text4), right(text3));
	equal(top(text5), bottom(text3));
});

let activity_visibility_gone_first_item_in_flex_line_row = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="360" verticalAlignment="top" flexDirection="${FlexDirection.ROW}" flexWrap="${FlexWrap.WRAP}" backgroundColor="gray">
        <Label id="text1" width="160" verticalAlignment="top" text="1" backgroundColor="red" />
        <Label id="text2" width="120" verticalAlignment="top" text="2" backgroundColor="green" />
        <Label id="text3" width="160" verticalAlignment="top" text="3" visibility="collapse" backgroundColor="blue" />
    </FlexboxLayout>`
	);

export const testView_visibility_gone_first_item_in_flex_line_horizontal = test(activity_visibility_gone_first_item_in_flex_line_row, noop, ({ root, flexbox, text1, text2, text3 }) => {
	check(height(flexbox) > 0);
	equal(height(flexbox), height(text1) + height(text3));
});

let activity_visibility_gone_first_item_in_flex_line_column = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" horizontalAlignment="left" height="360" flexDirection="${FlexDirection.COLUMN}" flexWrap="${FlexWrap.WRAP}" backgroundColor="gray">
        <Label id="text1" horizontalAlignment="left" height="160" text="1" backgroundColor="red" />
        <Label id="text2" horizontalAlignment="left" height="160" text="1" backgroundColor="green" />
        <Label id="text3" horizontalAlignment="left" height="160" text="1" visibility="collapse" backgroundColor="blue" />
    </FlexboxLayout>`
	);

export const testView_visibility_gone_first_item_in_flex_line_vertical = test(activity_visibility_gone_first_item_in_flex_line_column, noop, ({ flexbox, text1, text3 }) => {
	check(width(flexbox) > 0);
	equal(width(flexbox), width(text1) + width(text3));
});

let activity_wrap_before_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="360" horizontalAlignment="left" flexDirection="${FlexDirection.ROW}" flexWrap="${FlexWrap.WRAP}" backgroundColor="gray">
        <Label id="text1" width="100" height="80" text="1" backgroundColor="red" />
        <Label id="text2" width="100" height="80" text="2" backgroundColor="green" flexWrapBefore="true" />
        <Label id="text3" width="100" height="80" text="3" backgroundColor="blue" flexWrapBefore="true" />
    </FlexboxLayout>`
	);

export const testWrapBefore = test(activity_wrap_before_test, noop, ({ flexbox, text1, text2, text3 }) => {
	isTopAlignedWith(text1, flexbox);
	isLeftAlignedWith(text1, flexbox);
	isLeftAlignedWith(text2, flexbox);
	isBelow(text2, text1);
	isLeftAlignedWith(text3, flexbox);
	isBelow(text3, text2);
});

export const testWrapBefore2 = test(
	activity_wrap_before_test,
	({ text2 }) => FlexboxLayout.setFlexWrapBefore(text2, false),
	({ flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isLeftAlignedWith(text1, flexbox);
		isTopAlignedWith(text2, flexbox);
		isRightOf(text2, text1);
		isLeftAlignedWith(text3, flexbox);
		isBelow(text3, text1);
		isBelow(text3, text2);
		equal(height(flexbox), height(text1) + height(text3));
	}
);

export const testWrapBefore_nowrap = test(
	activity_wrap_before_test,
	({ flexbox }) => (flexbox.flexWrap = FlexWrap.NOWRAP),
	({ flexbox, text1, text2, text3 }) => {
		isTopAlignedWith(text1, flexbox);
		isLeftAlignedWith(text1, flexbox);
		isBottomAlignedWith(text1, flexbox);
		isTopAlignedWith(text2, flexbox);
		isRightOf(text2, text1);
		isBottomAlignedWith(text2, flexbox);
		isTopAlignedWith(text3, flexbox);
		isRightOf(text3, text2);
		isBottomAlignedWith(text3, flexbox);
	}
);

let activity_wrap_parent_padding_horizontal_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="360" verticalAlignment="top" padding="32" flexDirection="${FlexDirection.ROW}" flexWrap="${FlexWrap.WRAP}" alignItems="${AlignItems.FLEX_START}" backgroundColor="gray">
        <Label id="text1" width="280" height="80" text="1" backgroundColor="red" />
        <Label id="text2" width="30" height="80" text="2" backgroundColor="green" />
        <Label id="text3" width="100" height="80" text="3" backgroundColor="blue" />
    </FlexboxLayout>`
	);

export const testWrap_parentPadding_horizontal = test(activity_wrap_parent_padding_horizontal_test, noop, ({ flexbox, text1, text2, text3 }) => {
	isBelow(text2, text1);
	isRightOf(text3, text2);
	closeEnough(height(flexbox), Length.toDevicePixels(flexbox.style.paddingTop, 0) + Length.toDevicePixels(flexbox.style.paddingBottom, 0) + height(text1) + height(text2));
});

let activity_wrap_parent_padding_vertical_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" horizontalAlignment="left" height="360" padding="32" flexDirection="${FlexDirection.COLUMN}" flexWrap="${FlexWrap.WRAP}" alignItems="${AlignItems.FLEX_START}" backgroundColor="gray">
        <Label id="text1" width="80" height="280" text="1" backgroundColor="red" />
        <Label id="text2" width="80" height="30" text="2" backgroundColor="green" />
        <Label id="text3" width="80" height="80" text="3" backgroundColor="blue" />
    </FlexboxLayout>`
	);

export const testWrap_parentPadding_vertical = test(activity_wrap_parent_padding_vertical_test, noop, ({ flexbox, text1, text2, text3 }) => {
	isRightOf(text2, text1);
	isBelow(text3, text2);
	closeEnough(width(flexbox), Length.toDevicePixels(flexbox.style.paddingLeft, 0) + Length.toDevicePixels(flexbox.style.paddingRight, 0) + width(text1) + width(text2));
});

let activity_wrap_child_margin_horizontal_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="360" verticalAlignment="top" flexDirection="${FlexDirection.ROW}" flexWrap="${FlexWrap.WRAP}" alignItems="${AlignItems.FLEX_START}" backgroundColor="gray">
        <Label id="text1" width="280" height="80" text="1" backgroundColor="red" />
        <Label id="text2" width="30" height="80" text="2" margin="32" backgroundColor="green" />
        <Label id="text3" width="100" height="80" text="3" backgroundColor="blue" />
    </FlexboxLayout>`
	);

export const testWrap_childMargin_horizontal = test(activity_wrap_child_margin_horizontal_test, noop, ({ flexbox, text1, text2, text3 }) => {
	isBelow(text2, text1);
	isRightOf(text3, text2);
	closeEnough(height(flexbox), height(text1) + height(text2) + PercentLength.toDevicePixels(text2.style.marginTop, 0, Number.NaN) + PercentLength.toDevicePixels(text2.style.marginBottom, 0, Number.NaN));
});

let activity_first_item_large_horizontal_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="320" height="320" flexDirection="${FlexDirection.ROW}" flexWrap="${FlexWrap.WRAP}" alignItems="${AlignItems.STRETCH}" alignContent="${AlignItems.STRETCH}">
        <Label id="text1" width="500" height="60" text="1" />
        <Label id="text2" width="120" height="60" text="2" />
        <Label id="text3" width="300" height="60" text="3" />
    </FlexboxLayout>`
	);

export const testFirstItemLarge_horizontal = test(activity_first_item_large_horizontal_test, noop, ({ flexbox, text1, text2, text3 }) => {
	isTopAlignedWith(text1, flexbox);
	isLeftAlignedWith(text1, flexbox);
	isLeftAlignedWith(text2, flexbox);
	isLeftAlignedWith(text3, flexbox);
	isBottomAlignedWith(text3, flexbox);

	equal(height(flexbox), height(text1) + height(text2) + height(text3));
});

let activity_first_item_large_vertical_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" width="320" height="320" flexDirection="${FlexDirection.COLUMN}" flexWrap="${FlexWrap.WRAP}" alignItems="${AlignItems.STRETCH}" alignContent="${AlignContent.STRETCH}" backgroundColor="gray">
        <Label id="text1" width="60" height="500" text="1" backgroundColor="red" />
        <Label id="text2" width="60" height="120" text="2" backgroundColor="green" />
        <Label id="text3" width="6" height="300" text="3" backgroundColor="blue" />
    </FlexboxLayout>`
	);

export const testFirstItemLarge_vertical = test(activity_first_item_large_vertical_test, noop, ({ flexbox, text1, text2, text3 }) => {
	isTopAlignedWith(text1, flexbox);
	isLeftAlignedWith(text1, flexbox);
	isTopAlignedWith(text2, flexbox);
	isTopAlignedWith(text3, flexbox);
	isRightAlignedWith(text3, flexbox);

	equal(width(flexbox), width(text1) + width(text2) + width(text3));
});

let activity_wrap_child_margin_vertical_test = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox" horizontalAlignment="left" height="360" flexDirection="${FlexDirection.COLUMN}" flexWrap="${FlexWrap.WRAP}" alignItems="${AlignItems.FLEX_START}" backgroundColor="gray">
        <Label id="text1" width="80" height="280" text="1" backgroundColor="red" />
        <Label id="text2" width="80" height="30" margin="32" text="2" backgroundColor="green" />
        <Label id="text3" width="80" height="80" text="3" backgroundColor="blue" />
    </FlexboxLayout>`
	);

export const testWrap_childMargin_vertical = test(activity_wrap_child_margin_vertical_test, noop, ({ flexbox, text1, text2, text3 }) => {
	isRightOf(text2, text1);
	isBelow(text3, text2);
	// dips anyone?
	closeEnough(width(flexbox), width(text1) + width(text2) + PercentLength.toDevicePixels(text2.marginLeft, 0, Number.NaN) + PercentLength.toDevicePixels(text2.marginRight, 0, Number.NaN));
});

let activity_flexbox_with_proxy_view_container = () =>
	getViews(
		`<FlexboxLayout iosOverflowSafeArea="false" id="flexbox">
        <ProxyViewContainer></ProxyViewContainer>
    </FlexboxLayout>`
	);

export const testFlexboxLayout_does_not_crash_with_proxy_view_container = test(activity_flexbox_with_proxy_view_container, noop, ({ root, flexbox }) => {
	TKUnit.assert(flexbox.id === 'flexbox', 'FlexboxLayout actually there');
});

// Omit testEmptyChildren
// Omit testDivider_directionRow_verticalBeginning

// Omit divider test family, we don't draw dividers
