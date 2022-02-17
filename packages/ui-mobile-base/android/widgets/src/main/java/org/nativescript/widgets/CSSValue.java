package org.nativescript.widgets;

/**
 * Created by hristov on 6/16/2016.
 */
public class CSSValue {
	private final String type;
	private final String str;
	private final String unit;
	private final float value;

	public String getType() {
		return type;
	}

	public String getString() {
		return str;
	}

	public String getUnit() {
		return unit;
	}

	public float getValue() {
		return value;
	}

	public CSSValue(String type, String str, String unit, float value) {
		this.type = type;
		this.str = str;
		this.unit = unit;
		this.value = value;
	}
}
