/**
 * @module "ui/styling/gradient"
 */ /** */

import { LengthPercentUnit } from "./style-properties";
import { Color } from "../../color";
import { LinearGradient as LinearGradientDefinition } from "../../css/parser";

export class LinearGradient {
    public angle: number;
    public colorStops: ColorStop[];

    public static parse(value: LinearGradientDefinition): LinearGradientDefinition;

    public static equals(first: LinearGradientDefinition, second: LinearGradientDefinition): boolean;
}

export interface ColorStop {
    color: Color;
    offset?: LengthPercentUnit;
}
