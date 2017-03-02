import { View } from "ui/core/view";

export type PropertySetter = (instance: View, propertyValue: any) => void;
export function registerSpecialProperty(name: string, setter: PropertySetter): void;
export function getSpecialPropertySetter(name: string): PropertySetter;
