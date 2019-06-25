***e2e tests execution***

1. Local setup
    - install appium and all requirments related to how to use `nativescript-dev-appium` plugin
    - download images
    - each folder app has a folder with images which contains from device name-type-apiLevel etc.
    - name your device respectivly devices name and api level
2. Test executin
    - Run test compilation in separate terminal and don't kill it.
    `npm run test-watch`
    - It is higly recomened during the development to use `npm run test [android|ios]` along with `tns run [android|ios]`. This command will use already installed app on the device.
3. Debug test
    - Run `npm run test-debug [android|ios]` in separate console and don't kill the it. This command will start appium server and driver  and use the installed app on the device but it will not execute tests.
    - Go to vs code debugging and use config like:

    `{
            "type": "node",
            "request": "launch",
            "name": "Mocha Tests",
            "program": "${workspaceFolder}/node_modules/mocha/bin/_mocha",
            "args": [
                "-u",
                "tdd",
                "--colors",
                "--opts",
                "../config/mocha.opts",
                "-a",
            ],
            "internalConsoleOptions": "openOnSessionStart"
        }`

***mocha options***
- grep particular suites: "--grep=tabs-tab(s-\\w+)-suite"
- timeout

