
Used to store strings, booleans and numbers in built-in key/value store
Uses SharedPreferences on Android and NSUserDefaults on iOS

Sample code:

```
UserPreferences.setBoolean("boolKey", false);
var bValue = UserPreferences.getBoolean("boolKey");

var sValue = UserPreferences.getString("noSuchStringKey", "No string value");
// will return "No string value" if there is no such value

var weHaveKey = UserPreferences.hasKey("boolKey");

if (weHaveKey) {
	UserPreferences.remove("boolKey");
}
```