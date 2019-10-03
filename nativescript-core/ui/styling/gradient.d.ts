/**
 * @module "ui/styling/gradient"
 */ /** */

import { LengthPercentUnit } from "./style-properties";
import { Color } from "../../color";
import { LinearGradient } from "../../css/parser";

export class LinearGradient {
    public angle: number;
    public colorStops: ColorStop[];

    public static parse(value: LinearGradient): LinearGradient;

    public static equals(first: LinearGradient, second: LinearGradient): boolean;
}

export interface ColorStop {
    color: Color;
    offset?: LengthPercentUnit;
}
