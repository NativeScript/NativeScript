import { Observable } from '@nativescript/core';

export declare class FontScaleObservable extends Observable {
  public static readonly FONT_SCALE: 'fontScale';
  public static readonly IS_EXTRA_SMALL: 'isExtraSmall';
  public static readonly IS_EXTRA_LARGE: 'isExtraSmall';

  public static readonly VALID_FONT_SCALES: number[];

  public readonly fontScale: number;
  public readonly isExtraSmall: boolean;
  public readonly isExtraLarge: boolean;
}
