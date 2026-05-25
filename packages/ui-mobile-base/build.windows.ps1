#Requires -Version 5.1
param(
    [string]$Tag = ""
)

$ErrorActionPreference = 'Stop'

Write-Host "Set exit on errors"

# Check dotnet
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Write-Error "'dotnet' not found on PATH. Install the .NET SDK from https://dotnet.microsoft.com/download"
    exit 1
}
Write-Host "Using .NET SDK $(dotnet --version)"

Write-Host "Clean dist/package/platforms/windows"
if (Test-Path "dist\package\platforms\windows") {
    Remove-Item -Recurse -Force "dist\package\platforms\windows"
}
New-Item -ItemType Directory -Force "dist\package\platforms\windows" | Out-Null

Write-Host "Build Windows widgets"
$proj = "windows\widgets\NativeScript.Widgets.csproj"
& dotnet build $proj -c Release
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Copy artifacts"
$outDir  = "windows\widgets\bin\Release\net10.0-windows10.0.26100.0"
$destDir = "dist\package\platforms\windows"

foreach ($file in @("NativeScript.Widgets.dll")) {
    $src = Join-Path $outDir $file
    if (-not (Test-Path $src)) {
        Write-Error "Expected build output not found: $src"
        exit 1
    }
    Copy-Item $src $destDir
    Write-Host "  + $file"
}

Write-Host "Generate TypeScript typings"
# Resolve the typings-generator sub-tool path relative to this script.
# Assumes windows-runtime repo is a sibling of the NativeScript repo, or adjust
# $TypingsGenProj to point to the dotnet-src project on your machine.
$scriptDir      = $PSScriptRoot
$TypingsGenProj = Join-Path $scriptDir "..\..\..\..\windows-runtime\typings-generator\dotnet-src\dotnet-typings-gen.csproj"
$WidgetDll      = Join-Path $outDir "NativeScript.Widgets.dll"
$TypingsOut     = Join-Path $scriptDir "..\..\types-minimal\src\lib\windows\NativeScript.Widgets.d.ts"

if (Test-Path $TypingsGenProj) {
    $genArgs = @('--input', $WidgetDll, '--root', 'NativeScript', '--out', $TypingsOut)
    & dotnet run --project $TypingsGenProj -- @genArgs
    if ($LASTEXITCODE -ne 0) { Write-Warning "typings-gen exited $LASTEXITCODE - continuing" }
    else { Write-Host "  + NativeScript.Widgets.d.ts" }
} else {
    Write-Warning "typings-generator not found at $TypingsGenProj - skipping typings generation"
}

if ($Tag) {
    Write-Host "Suffix package.json version with tag: $Tag"
    $pkgJson = Get-Content "dist\package\package.json" -Raw
    $pkgJson = $pkgJson -replace '("version"\s*:\s*"[^"]*)"', ('$1-' + $Tag + '"')
    Set-Content "dist\package\package.json" $pkgJson -Encoding UTF8
}

if ($env:SKIP_PACK) {
    Write-Host "SKIP pack"
} else {
    Write-Host "Copy NPM artifacts"
    Copy-Item ".npmignore", "README.md", "package.json" "dist\package\"
    Copy-Item "..\..\LICENSE" "dist\package\"

    Write-Host "NPM pack"
    Push-Location "dist\package"
    $package = & npm pack
    Pop-Location
    Move-Item "dist\package\$package" "dist\$package" -Force
    Write-Host "Output: dist\$package"
}
