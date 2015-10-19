workingdir=./.testsapprun
startdir=$(pwd)

emuProcId=".*emulator64-x86"
emuAvdName=Api19
androidRuntimePath=/Users/erjan/tns-android.tgz
outfile=./TestRunResult.txt

testsAppName=TestsApp
pathToApk=./platforms/android/build/outputs/apk/$testsAppName-debug.apk
deployedAppName=org.nativescript.$testsAppName
mainActivityName=com.tns.NativeScriptActivity

# Creating the emulator with:
#android create avd -t "android-21" -n Api21 -b "default/x86"

# GET THIS ONE FROM SOME PLACE...
cp /Volumes/distributions/DailyBuilds/NativeScript/android-widgets/Stable/widgets.jar platforms/android/libs/

echo "------------------------------------------------"
echo "Building the application..."
time tns build android

echo "------------------------------------------------"
echo "Killing the adb server..."
time adb kill-server

echo "------------------------------------------------"
echo "Starting the adb server..."
time adb start-server

echo "------------------------------------------------"
echo "Uninstalling the app..."
time adb uninstall $deployedAppName

echo "------------------------------------------------"
echo "Installing the app..."
time adb install $pathToApk

echo "------------------------------------------------"
echo "Starting the app..."
time adb shell am start -n $deployedAppName/$mainActivityName

cd $startdir

echo "------------------------------------------------"
echo "Waiting for the tests to finish executing..."
time ./expect.exp $outfile

rm -rd $workingdir
