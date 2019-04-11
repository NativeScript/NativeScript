import { Button } from "tns-core-modules/ui/button/button";
import { EventData } from "tns-core-modules/ui/page/page";

export function buttonTap(args: EventData) {
    let btn: Button = args.object as Button;
    btn.text = btn.className ? "elevation 10" : "no elevation (default)";
    btn.className = btn.className ? "" : "elevation-10";
    
}