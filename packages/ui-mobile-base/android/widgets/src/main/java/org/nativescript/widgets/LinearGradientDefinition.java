package org.nativescript.widgets;

/**
 * Created by Vultix on 3/12/2018.
 */
public class LinearGradientDefinition {
	private final float startX;
	private final float startY;
	private final float endX;
	private final float endY;
	private final int[] colors;
	private final float[] stops;

	public float getStartX() {
		return startX;
	}

	public float getStartY() {
		return startY;
	}

	public float getEndX() {
		return endX;
	}

	public float getEndY() {
		return endY;
	}

	public int[] getColors() {
		return colors;
	}

	public float[] getStops() {
		return stops;
	}

	public LinearGradientDefinition(float startX, float startY, float endX, float endY, int[] colors, float[] stops) {
		this.startX = startX;
		this.startY = startY;
		this.endX = endX;
		this.endY = endY;
		this.colors = colors;
		this.stops = stops;
	}
}
