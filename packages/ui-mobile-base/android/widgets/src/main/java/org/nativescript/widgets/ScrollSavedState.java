package org.nativescript.widgets;

import android.os.Build;
import android.os.Parcel;
import android.os.Parcelable;
import android.view.View.BaseSavedState;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

/**
 * @author CatchABus
 */
class ScrollSavedState extends BaseSavedState {
  public int scrollOffsetFromStart;

  ScrollSavedState(Parcelable superState) {
    super(superState);
  }

  public ScrollSavedState(Parcel source) {
    super(source);
    scrollOffsetFromStart = source.readInt();
  }

  @RequiresApi(Build.VERSION_CODES.N)
  public ScrollSavedState(Parcel source, ClassLoader loader) {
    super(source, loader);
    scrollOffsetFromStart = source.readInt();
  }

  @Override
  public void writeToParcel(Parcel dest, int flags) {
    super.writeToParcel(dest, flags);
    dest.writeInt(scrollOffsetFromStart);
  }

  @NonNull
  @Override
  public String toString() {
    return "ScrollSavedState{"
      + Integer.toHexString(System.identityHashCode(this))
      + " scrollPosition=" + scrollOffsetFromStart
      + "}";
  }

  public static final Creator<ScrollSavedState> CREATOR = new ClassLoaderCreator<ScrollSavedState>() {
    public ScrollSavedState createFromParcel(Parcel in, ClassLoader loader)
    {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.N ? new ScrollSavedState(in, loader) : new ScrollSavedState(in);
    }

    @Override
    public ScrollSavedState createFromParcel(Parcel in)
    {
        return createFromParcel(in, null);
    }

    public ScrollSavedState[] newArray(int size) {
      return new ScrollSavedState[size];
    }
  };
}