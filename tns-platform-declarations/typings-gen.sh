
#!/usr/bin/env bash

for i in "$@"
do
case $i in
    --binary-path=*)
    BINPATH="${i#*=}"
    shift
    ;;
    --isysroot=*)
    SDKROOT="${i#*=}"
    shift
    ;;
    --output-folder=*)
    OUTPUT_FOLDER="${i#*=}"
    shift
    ;;
    --no-apply-manual-changes)
    NO_APPLY_MANUAL_CHANGES="--no-apply-manual-changes"
    shift
    ;;
esac
done

echo "BINPATH:" $OUTPUT_FOLDER
if [ -n "$OUTPUT_FOLDER"]; then
    echo "Output path is not set."
    echo "Usage: ./typings-gen.sh --isysroot=<path to the sdk folder> --output-folder=<declarations parent folder> --binary-path=<path to the metadata generator binary"
    echo "Add --no-apply-manual-changes to disable conflicting declarations renaming."
    exit
fi


eval $BINPATH "-output-typescript" $OUTPUT_FOLDER "Xclang" "-isysroot" $SDKROOT "-arch" "x86_64" "-miphoneos-version-min=8.0" "-std=gnu99" $NO_APPLY_MANUAL_CHANGES



exit



