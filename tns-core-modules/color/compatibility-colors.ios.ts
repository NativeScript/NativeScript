import { ios } from "../utils/utils";

const majorVersion = ios.MajorVersion;

export const activityIndicatorViewStyle = () => { return majorVersion <= 12 ? UIActivityIndicatorViewStyle.Gray : UIActivityIndicatorViewStyle.Medium };
export const backgroundColor = () => { return majorVersion <= 12 ? UIColor.whiteColor : UIColor.systemBackgroundColor };
