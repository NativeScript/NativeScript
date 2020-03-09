***e2e tests execution***

1. Local setup
    - install appium and all requirments related to how to use `nativescript-dev-appium` plugin
    - download images: 
    
        ```npm run load-images Emulator-Api23-Default```

        or load multiple folders:

        ``` npm run load-images Emulator-Api23-Default Emulator-Google-Api28```

        This command will download https://github.com/NativeScript/functional-tests-images/tree/master/uitestsapp and sparse all passed directories [emulator-name|simulator-name] [emulator-name|simulator-name] [emulator-name|simulator-name]
    - name your device so that it matches folder name, respectively api level and density of emulators. 
    
        You can also use scripts:
    
        `npm run update-emulators` to update your emulator density. 
    
        If you need to download system image and create emulator use:

        `npm run update-emulators -u`
2. Test execution
    - Run test compilation in separate terminal and don't kill it.
    
        `npm run test-watch`
    - It is highly recommended during the development to use 
    
        `npm run test [android|ios]` along with `tns run [android|ios]`. This command will use already installed app on the device.
        For example: Open terminal1 and run: `tns run android` and open new terminal2 and run: `npm run test android`
3. Debug test.
    - Run:

        `npm run test-debug [android|ios]`
in separate console and don't kill it. This command will start appium server and driver and use the installed app on the device but it will not execute tests.
    - Go to vs code debugging and use a config like:

    ```
        {
            "type": "node",
            "request": "launch",
            "name": "Debug Tests",
            "program": "${workspaceFolder}/node_modules/mocha/bin/_mocha",
            "args": [
                "-u",
                "tdd",
                "--colors",
                "--opts",
                "../config/mocha.opts",
                "--attachToDebug",
            ],
            "internalConsoleOptions": "openOnSessionStart"
        }

***mocha options***

mocha opt file is plased in "../config/mocha.opts".

       --timeout 999999
       --recursive e2e
       --reporter mochawesome 
       --reporter-options quiet=true,html=true,inline=true,autoOpen=true
       --exit


- grep particular suites: "--grep=tabs-tab(s-\\w+)-suite"