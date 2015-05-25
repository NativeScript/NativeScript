export function pageLoaded(args) {
    var page = args.object;

    var itemsArr = [];
    for (var i = 1; i <= 64; i++) {
        itemsArr.push({ title: "List item " + i });
    }

    page.bindingContext = { items: itemsArr };
}