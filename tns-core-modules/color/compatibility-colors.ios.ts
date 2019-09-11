import { ios } from "../utils/utils";

const majorVersion = ios.MajorVersion;

export const activityIndicatorViewStyle = () => majorVersion <= 12 ? UIActivityIndicatorViewStyle.Gray : UIActivityIndicatorViewStyle.Medium;

// UI Element Colors
export const backgroundColor = () => majorVersion <= 12 ? UIColor.whiteColor : UIColor.systemBackgroundColor;
export const labelColor = () => majorVersion <= 12 ? UIColor.blackColor : UIColor.labelColor;

// Standard Colors
export const blueColor = () => majorVersion <= 12 ? UIColor.blueColor : UIColor.systemBlueColor;
