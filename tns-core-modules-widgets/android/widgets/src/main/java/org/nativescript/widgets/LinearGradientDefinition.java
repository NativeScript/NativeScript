package org.nativescript.widgets;

/**
 * Created by Vultix on 3/12/2018.
 */
public class LinearGradientDefinition {
    private float startX;
    private float startY;
    private float endX;
    private float endY;
    private int[] colors;
    private float[] stops;

    public float getStartX() { return startX; }
    public float getStartY() { return startY; }
    public float getEndX() { return endX; }
    public float getEndY() { return endY; }
    public int[] getColors() { return colors; }
    public float[] getStops() { return stops; }

    public LinearGradientDefinition(float startX, float startY, float endX, float endY, int[] colors, float[] stops) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.colors = colors;
        this.stops = stops;
    }
}
