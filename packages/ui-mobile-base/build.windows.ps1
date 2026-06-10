#Requires -Version 5.1
<#
.SYNOPSIS
    Builds the C++/WinRT NativeScript.Widgets component for Windows (x64 + ARM64)
    and ships the per-architecture artifacts from @nativescript/core.

.DESCRIPTION
    The widgets are a hand-authored C++/WinRT WinUI3 component (no DotNetBridge).
    The CLI builds the host with `dotnet build`, which cannot build a C++ .vcxproj,
    so the component is PREBUILT here with full MSBuild and its outputs are copied
    into the @nativescript/core platform payload:

        packages/core/platforms/windows/x64/NativeScript.Widgets.{dll,winmd}
        packages/core/platforms/windows/arm64/NativeScript.Widgets.{dll,winmd}

    At app build time the CLI stages these per-arch files and core's plugin.props /
    plugin.targets copy the matching-arch dll+winmd to the package root, where the
    runtime's RoGetMetaDataFile resolves the winmd and RoGetActivationFactory finds
    the in-proc server (registered in the app's Package.appxmanifest).

    Native DLLs are per-architecture (no "universal" fat binary on Windows), so we
    build x64 and ARM64 separately.

.PARAMETER SkipArm64
    Build x64 only (faster local iteration).

.PARAMETER SkipTypings
    Skip regenerating types-minimal/.../NativeScript.Widgets.d.ts from the winmd.

.PARAMETER Configuration
    MSBuild configuration (default Release).
#>
param(
    [switch]$SkipArm64,
    [switch]$SkipTypings,
    [ValidateSet("Release", "Debug")]
    [string]$Configuration = "Release"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$ScriptDir   = $PSScriptRoot
$WidgetsProj = Join-Path $ScriptDir "windows\widgets-cpp\NativeScript.Widgets.vcxproj"
$WidgetsDir  = Split-Path $WidgetsProj
$CoreWindows = (Resolve-Path (Join-Path $ScriptDir "..\core\platforms\windows")).Path

if (-not (Test-Path $WidgetsProj)) {
    Write-Error "Widgets project not found: $WidgetsProj"
    exit 1
}

# --- Locate MSBuild ---------------------------------------------------------
# Prefer the Community (or full VS) MSBuild: the Build Tools SKU lacks the PRI
# packaging task (Microsoft.Build.Packaging.Pri.Tasks.dll) that a WinUI3 C++
# component needs, so a Build-Tools-only MSBuild fails to package the .pri.
function Find-MSBuild {
    $vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
    if (Test-Path $vswhere) {
        # -requires the VC tools + restrict to a full VS product (not BuildTools)
        $found = & $vswhere -all -products "Microsoft.VisualStudio.Product.Community","Microsoft.VisualStudio.Product.Professional","Microsoft.VisualStudio.Product.Enterprise" `
            -requires Microsoft.Component.MSBuild `
            -find "MSBuild\**\Bin\MSBuild.exe" 2>$null | Select-Object -First 1
        if ($found) { return $found }
        # Fallback: any MSBuild vswhere can find
        $found = & $vswhere -all -products "*" -find "MSBuild\**\Bin\MSBuild.exe" 2>$null | Select-Object -First 1
        if ($found) { return $found }
    }
    $cmd = Get-Command "MSBuild.exe" -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    return $null
}

$MSBuild = Find-MSBuild
if (-not $MSBuild) {
    Write-Error "MSBuild.exe not found. Install Visual Studio (Community or higher) with the C++/WinRT + Windows App SDK workloads."
    exit 1
}
Write-Host "MSBuild     : $MSBuild"
Write-Host "Widgets proj: $WidgetsProj"
Write-Host "Core output : $CoreWindows"

# --- Build targets ----------------------------------------------------------
# MSBuild Platform name -> shipped per-arch folder name under platforms/windows.
$Targets = @(
    @{ Platform = "x64";   Arch = "x64"   }
)
if (-not $SkipArm64) {
    $Targets += @{ Platform = "ARM64"; Arch = "arm64" }
}

foreach ($t in $Targets) {
    $platform = $t.Platform
    $arch     = $t.Arch

    Write-Host "`n=== Building NativeScript.Widgets ($Configuration|$platform) ===" -ForegroundColor Cyan
    & $MSBuild $WidgetsProj /t:Restore /p:Configuration=$Configuration /p:Platform=$platform /nologo /v:minimal
    if ($LASTEXITCODE -ne 0) { Write-Error "MSBuild Restore failed ($platform)"; exit 1 }
    & $MSBuild $WidgetsProj /t:Rebuild /p:Configuration=$Configuration /p:Platform=$platform /nologo /v:minimal
    if ($LASTEXITCODE -ne 0) { Write-Error "MSBuild Rebuild failed ($platform)"; exit 1 }

    $outDir = Join-Path $WidgetsDir "$platform\$Configuration"
    $destDir = Join-Path $CoreWindows $arch
    New-Item -ItemType Directory -Force $destDir | Out-Null

    # Ship ONLY the component dll + its metadata winmd. NuGet runtime deps
    # (WebView2.Core, WindowsAppRuntime.Bootstrap, etc.) come from the framework
    # package dependency and must NOT be shipped here.
    foreach ($file in @("NativeScript.Widgets.dll", "NativeScript.Widgets.winmd")) {
        $src = Join-Path $outDir $file
        if (-not (Test-Path $src)) {
            Write-Error "Expected build output not found: $src"
            exit 1
        }
        Copy-Item -Force $src (Join-Path $destDir $file)
        Write-Host "  + $arch\$file"
    }
}

# --- Remove the legacy flat C# artifact if it lingers -----------------------
$legacyDll = Join-Path $CoreWindows "NativeScript.Widgets.dll"
if (Test-Path $legacyDll) {
    Remove-Item -Force $legacyDll
    Write-Host "  - removed legacy (flat) NativeScript.Widgets.dll"
}

# --- Typings ----------------------------------------------------------------
# Generate the TypeScript typings from the C++ winmd (the sole metadata source
# now that the C# project is retired).
if (-not $SkipTypings) {
    Write-Host "`n=== Generating TypeScript typings from winmd ===" -ForegroundColor Cyan
    $winmd = Join-Path $CoreWindows "x64\NativeScript.Widgets.winmd"
    $typingsOut = (Resolve-Path (Join-Path $ScriptDir "..\types-minimal\src\lib\windows")).Path
    $typingsOut = Join-Path $typingsOut "NativeScript.Widgets.d.ts"

    # typings-generator sub-tool from the windows-runtime repo. Try common
    # locations; override with $env:TYPINGS_GEN_PROJ if your layout differs.
    $candidates = @(
        $env:TYPINGS_GEN_PROJ,
        (Join-Path $ScriptDir "..\..\..\windows-runtime\typings-generator\dotnet-src\dotnet-typings-gen.csproj"),
        (Join-Path $ScriptDir "..\..\..\..\windows-runtime\typings-generator\dotnet-src\dotnet-typings-gen.csproj")
    ) | Where-Object { $_ }

    $typingsGen = $null
    foreach ($c in $candidates) {
        if (Test-Path $c) { $typingsGen = (Resolve-Path $c).Path; break }
    }

    if ($typingsGen) {
        & dotnet run --project $typingsGen -- --input $winmd --root "NativeScript" --out $typingsOut
        if ($LASTEXITCODE -ne 0) { Write-Warning "typings-gen exited $LASTEXITCODE - continuing" }
        else { Write-Host "  + NativeScript.Widgets.d.ts" }
    } else {
        Write-Warning "typings-generator not found (set `$env:TYPINGS_GEN_PROJ) - skipping typings"
    }
}

Write-Host "`nDone." -ForegroundColor Green
Get-ChildItem -Recurse $CoreWindows -Filter "*.dll" -ErrorAction SilentlyContinue |
    ForEach-Object { "  " + $_.FullName.Substring($CoreWindows.Length + 1) }
Get-ChildItem -Recurse $CoreWindows -Filter "*.winmd" -ErrorAction SilentlyContinue |
    ForEach-Object { "  " + $_.FullName.Substring($CoreWindows.Length + 1) }
