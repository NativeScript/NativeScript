/*
 * Copyright 2014 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.nativescript.widgets;

import android.widget.LinearLayout;
import android.widget.TextView;

public interface TabbableBar {
    void setTabTextColor(int color);
    int getTabTextColor();
    void setSelectedTabTextColor(int color);
    int getSelectedTabTextColor();
    void setTabTextFontSize(float fontSize);
    float getTabTextFontSize();
    void updateItemAt(int position, TabItemSpec tabItem);
    TextView getTextViewForItemAt(int index);
    LinearLayout getViewForItemAt(int index);
    int getItemCount();
}