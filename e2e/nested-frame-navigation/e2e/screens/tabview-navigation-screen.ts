import { AppiumDriver } from "nativescript-dev-appium";
import { Screen } from "./screen";

export class TabViewNavigationScreen extends Screen {

    protected readonly players = "Players";
    protected readonly teams = "Teams";
    protected readonly playersTab = "Players";
    protected readonly teamsTab = "Teams";

    constructor(driver: AppiumDriver) {
        super(driver);
    }
}