export function pageLoaded(args) {
	var page = args.object;
	page.bindingContext = {
		items: [
			{
				text: '1',
				tapItem: function () {
					console.log('1');
				},
			},
			{
				text: '2',
				tapItem: function () {
					console.log('2');
				},
			},
		],
		parentViewProperty: 'Parent View Property',
	};
}
