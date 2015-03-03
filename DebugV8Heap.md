###NOTE: This works for Android ONLY!!!

* There is the global function

```js
heapSnapshot();
```

* The function will save a V8's heap dump file in the application private files folder - e.g.

```js
data/data/com.telerik.tns.unittestapp/files/xxx.xxx.heapsnapshot
```

* Open command prompt and go the location of your ADB - e.g. [PathToADT]/sdk/platform-tools/
* Run `adb shell`
* Go to `/data/data/com.telerik.tns.unittestapp/files/`
* Run `ls` to list the files in the folder and find the *.heapsnapshot file(s).
* Run `exit` to return back to the command prompt
* Run `adb pull /data/data/com.telerik.tns.unittestapp/files/xxx.xxx.heapsnapshot LocalPath/To/Snapshot`
* Open Chrome Developer Tools (Ctrl + Shift + I within Chrome)
* Go to `Profiles` tab on the top of the tools window
* Select `Record Heap Allocations` and load the locally saved *.heapsnapshot file.
