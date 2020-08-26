/**
 * 
 */
package org.nativescript.widgets;

/**
 * @author hhristov
 *
 */
public class ItemSpec {

    private int _value;
    private GridUnitType _unitType;

	public ItemSpec() {
		this(1, GridUnitType.star);
	}

	public ItemSpec(int value, GridUnitType unitType) {
		this._value = value;
        this._unitType = unitType;
    }

    GridLayout owner;
    int _actualLength = 0;
    
    @Override
    public boolean equals(Object o) {
    	if (!(o instanceof ItemSpec)) {
    		return false;
    	}
    	
    	ItemSpec other = (ItemSpec)o;
    	 return (this._unitType == other._unitType) && (this._value == other._value) && (this.owner == other.owner);
    }

    public GridUnitType getGridUnitType() {
        return this._unitType;
    }

    public boolean getIsAbsolute() {
        return this._unitType == GridUnitType.pixel;
    }

    public boolean getIsAuto() {
        return this._unitType == GridUnitType.auto;
    }

    public boolean getIsStar() {
        return this._unitType == GridUnitType.star;
    }

    public int getValue() {
        return this._value;
    }
    
    public int getActualLength() {
        return this._actualLength;
    }
}