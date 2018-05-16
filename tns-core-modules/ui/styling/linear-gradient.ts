import { LengthPercentUnit } from "./style-properties";
import * as parser from "../../css/parser";
import { Color } from "../../color";

export class LinearGradient {
    public angle: number;
    public colorStops: ColorStop[];

    static parse(value: parser.LinearGradient): LinearGradient {
        const result = new LinearGradient();
        result.angle = value.angle;
        result.colorStops = value.colors.map(color => {
            const offset = color.offset || null;
            let offsetUnit: LengthPercentUnit;

            if (offset && offset.unit === "%") {
                offsetUnit = {
                    unit: "%",
                    value: offset.value
                };
            }

            return {
                color: new Color(color.argb),
                offset: offsetUnit
            }
        });
        return result;
    }

    static equals(first: LinearGradient, second: LinearGradient): boolean {
        if (!first && !second) {
            return true;
        } else if (!first || !second) {
            return false
        }

        if (first.angle !== second.angle) {
            return false;
        }

        if (first.colorStops.length !== second.colorStops.length) {
            return false;
        }

        for (let i = 0; i < first.colorStops.length; i++) {
            const firstStop = first.colorStops[i];
            const secondStop = second.colorStops[i];
            if (firstStop.offset !== secondStop.offset) {
                return false;
            }
            if (!Color.equals(firstStop.color, secondStop.color)) {
                return false;
            }
        }

        return true;
    }
}

export interface ColorStop {
    color: Color;
    offset?: LengthPercentUnit;
}