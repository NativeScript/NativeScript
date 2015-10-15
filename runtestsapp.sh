workingdir=./.testsapprun
startdir=$(pwd)

emuProcId=".*emulator64-x86"
emuAvdName=Api19
androidRuntimePath=/Users/erjan/tns-android.tgz

testsAppName=TestsApp
pathToApk=./platforms/android/build/outputs/apk/$testsAppName-debug.apk
deployedAppName=org.nativescript.$testsAppName
mainActivityName=com.tns.NativeScriptActivity

rm -rd $workingdir
mkdir $workingdir
cd $workingdir

# Creating the emulator with:
#android create avd -t "android-21" -n Api21 -b "default/x86"

echo "------------------------------------------------"
echo "Killing the emulator..."
time pkill $emuProcId && true

echo "------------------------------------------------"
echo "Starting the emulator..."
time emulator -avd $emuAvdName -no-audio -no-window &

echo "------------------------------------------------"
echo "Creating the app..."
time tns create $testsAppName
cd $testsAppName

echo "------------------------------------------------"
echo "Removing the original template files..."
time rm app/*.*

echo "------------------------------------------------"
echo "Copying the test app files..."
time cp -r ../../bin/dist/apps/tests/* ./app/

echo "------------------------------------------------"
echo "Adding the android platform..."
time tns platform add android --frameworkPath=$androidRuntimePath

# #DO THE REPLACEMENTS IN THE Info.plist and AndroidManifest.xml
cp /Users/erjan/work/spikes/__DEL__/AndroidManifest.xml platforms/android/src/main/

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
time ./expect.exp

pkill $emuProcId && true

rm -rd $workingdir
