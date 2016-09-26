
declare const enum INUIHostedViewContext {

	SiriSnippet = 0,

	MapsCard = 1
}

interface INUIHostedViewControlling extends NSObjectProtocol {

	configureWithInteractionContextCompletion(interaction: INInteraction, context: INUIHostedViewContext, completion: (p1: CGSize) => void): void;
}
declare var INUIHostedViewControlling: {

	prototype: INUIHostedViewControlling;
};

interface INUIHostedViewSiriProviding extends NSObjectProtocol {

	displaysMap?: boolean;

	displaysMessage?: boolean;

	displaysPaymentTransaction?: boolean;
}
declare var INUIHostedViewSiriProviding: {

	prototype: INUIHostedViewSiriProviding;
};

declare var IntentsUIVersionNumber: number;

declare var IntentsUIVersionString: interop.Reference<number>;
