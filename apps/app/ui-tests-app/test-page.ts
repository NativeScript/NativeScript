import { getRootView } from "tns-core-modules/application/application";
import { TabView } from "tns-core-modules/ui/tab-view/tab-view";


export function navigatingTo(args) {
  console.log("navigatingTo: " + args.object)
}

export function navigatedTo(args) {
  console.log("navigatedTo: " + args.object)
}


// export function navigationTo(args) {
//   console.log("navigationTo: " + args.object)
// }


// export function navigationTo(args) {
//   console.log("navigationTo: " + args.object)
// }

export function changeTab(){ 
  (<TabView>getRootView()).selectedIndex = (<TabView>getRootView()).selectedIndex + 1;
}