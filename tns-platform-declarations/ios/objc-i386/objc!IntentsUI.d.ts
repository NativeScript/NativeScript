
declare const enum INUIHostedViewContext {

	SiriSnippet = 0,

	MapsCard = 1
}

interface INUIHostedViewControlling extends NSObjectProtocol {

	configureViewForParametersOfInteractionInteractiveBehaviorContextCompletion?(parameters: NSSet<INParameter>, interaction: INInteraction, interactiveBehavior: INUIInteractiveBehavior, context: INUIHostedViewContext, completion: (p1: boolean, p2: NSSet<INParameter>, p3: CGSize) => void): void;

	configureWithInteractionContextCompletion?(interaction: INInteraction, context: INUIHostedViewContext, completion: (p1: CGSize) => void): void;
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

declare const enum INUIInteractiveBehavior {

	None = 0,

	NextView = 1,

	Launch = 2,

	GenericAction = 3
}

declare var IntentsUIVersionNumber: number;

declare var IntentsUIVersionString: interop.Reference<number>;
