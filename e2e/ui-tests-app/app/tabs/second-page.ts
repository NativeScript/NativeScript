import { EventData } from "tns-core-modules/data/observable";
import { Button } from "tns-core-modules/ui/button/button";

export function goToFirst(args: EventData) {
  console.log("---> goToFirst Page");
  const button = <Button>args.object;
  button.page.frame.navigate("tabs/first-page");
}

export function goBack(args: EventData) {
  console.log("---> goBack");
  const button = <Button>args.object;
  button.page.frame.goBack();
}
