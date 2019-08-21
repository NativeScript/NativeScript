import { AppiumDriver } from "nativescript-dev-appium";
import { Screen } from "./screen";

export class TabNavigationScreen extends Screen {

    protected readonly players = "Players";
    protected readonly teams = "Teams";
    protected readonly playersTab = "playersTabNavigation";
    protected readonly teamsTab = "teamsTabNavigation";

    constructor(driver: AppiumDriver) {
        super(driver);
    }
}