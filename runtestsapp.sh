workingdir=./build/__TESTSAPP__
startdir=$(pwd)
rm -rd $workingdir
mkdir $workingdir
cd $workingdir

# Creating the emulator with:
#android create avd -t "android-21" -n Api21 -b "default/x86"

echo "------------------------------------------------"
echo "Killing the emulator..."
time pkill ".*emulator64-x86" && true

echo "------------------------------------------------"
echo "Starting the emulator..."
time emulator -avd Api19 -no-audio -no-window &

echo "------------------------------------------------"
echo "Creating the app..."
time tns create TestsApp
cd TestsApp

echo "------------------------------------------------"
echo "Removing the original template files..."
time rm app/*.*

echo "------------------------------------------------"
echo "Copying the test app files..."
time cp -r ../../../bin/dist/apps/tests/* ./app/

echo "------------------------------------------------"
echo "Adding the android platform..."
time tns platform add android #--frameworkPath=/Users/erjan/tns-android.tgz

# #DO THE REPLACEMENTS IN THE Info.plist and AndroidManifest.xml
cp /Users/erjan/work/spikes/__DEL__/AndroidManifest.xml platforms/android/src/main/

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
time adb uninstall org.nativescript.TestsApp

echo "------------------------------------------------"
echo "Installing the app..."
time adb install ./platforms/android/build/outputs/apk/TestsApp-debug.apk

echo "------------------------------------------------"
echo "Starting the app..."
time adb shell am start -n org.nativescript.TestsApp/com.tns.NativeScriptActivity

cd $startdir

echo "------------------------------------------------"
echo "Waiting for the tests to finish executing..."
time ./expect.exp

pkill ".*emulator64-x86" && true
