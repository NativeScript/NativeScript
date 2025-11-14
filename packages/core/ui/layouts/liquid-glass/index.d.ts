import { LiquidGlassCommon } from './liquid-glass-common';

export class LiquidGlass extends LiquidGlassCommon {}

/**
 * Convert GlassEffectVariant to corresponding platform glass style.
 * @param value GlassEffectVariant | undefined
 * @returns 0 | 1 | UIGlassEffectStyle
 */
export function toUIGlassStyle(value?: GlassEffectVariant): 0 | 1 | UIGlassEffectStyle;
