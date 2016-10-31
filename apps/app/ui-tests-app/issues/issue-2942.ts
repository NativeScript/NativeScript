export function onButtonLoaded(args){
    if (args.object.android){
        args.object.android.setFocusableInTouchMode(true);
        args.object.android.setFocusable(true);
        args.object.android.setClickable(true);
    }
}

export function onListViewLoaded(args){
    args.object.items = [1];
}