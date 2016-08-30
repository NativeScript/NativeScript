import { EventData } from "data/observable";
import { View } from "ui/core/view";
import { Button } from "ui/button";
import { Color } from "color"; 
import { TextView } from "ui/text-view";
import { ScrollView } from "ui/scroll-view";

let red = new Color("red");
let green = new Color("green");

export function onToggle(args: EventData){
    let button = <Button>args.object;
    let target = button.page.getViewById<View>("target");
    let debugConsole = button.page.getViewById<TextView>("debugConsole");
    let scrollView = button.page.getViewById<ScrollView>("scrollView");

    if (button.text === "Color"){
        target[button.id] = target[button.id] ? undefined : red;
        debugConsole.text += `> border-color: ${target.borderColor}\n`;
    }
    else if (button.text === "Width"){
        target[button.id] = target[button.id] ? 0 : 10; 
        debugConsole.text += `> border-width: ${target.borderWidth}\n`;
    }
    else if (button.text === "Radius"){
        target[button.id] = target[button.id] ? 0 : 10; 
        debugConsole.text += `> border-radius: ${target.borderRadius}\n`;
    }
    else if (button.text === "BGColor"){
        target.backgroundColor = target.backgroundColor ? undefined : green; 
        debugConsole.text += `> background-color: ${target.backgroundColor}\n`;
    }
    else if (button.text === "BGImage"){
        target.backgroundImage = target.backgroundImage ? undefined : `~/ui-tests-app/pages/test2.png`; 
        debugConsole.text += `> background-image: ${target.backgroundImage}\n`;
    }

    scrollView.scrollToVerticalOffset(scrollView.scrollableHeight, true);
}