import { topmost } from "ui/frame";

export function onTap(args){
    topmost().goBack();
}