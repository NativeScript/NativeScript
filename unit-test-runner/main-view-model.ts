import observable = require("data/observable");
import observableArray = require('data/observable-array');
import http = require('http');
import platform = require('platform');
import frameModule = require('ui/frame');
import stopProcess = require('./stop-process');

interface IHostConfiguration {
    port: number;
    ips: string[];
}

interface INetworkConfiguration extends IHostConfiguration {
    reachableIp: string;
}

interface IKarmaContext {
    files: string[];
}

interface IScriptInfo {
    url: string;
    localPath?: string;
    contents?: string;
}

//function enableSocketIoDebugging() {
//    global.localStorage = {
//        debug: "*"
//    };

//    global.window = global;
//}

var config: INetworkConfiguration = require('./config');

export class TestBrokerViewModel extends observable.Observable {
    private startEmitted: boolean;
    private executed: boolean;
    private hasError: boolean;
    private karmaRequestedRun: boolean;
    private baseUrl: string;
    private testResults: observableArray.ObservableArray<any>;

    private socket: any; //socket.io socket
    private config: any; //karma config
    private networkConfig: INetworkConfiguration;

    constructor() {
        super();

        // used in engine.io-parser
        global.navigator = {
            userAgent: 'nativescript',
        };
        global.document = {
            documentElement: {
                style: {}
            }
        };

        global.__karma__ = this;

        //enableSocketIoDebugging();
        //debugger;

        this.testResults = new observableArray.ObservableArray();
        this.set('testResults', this.testResults);
        this.set('serverInfo', 'disconnected');
        this.set('goToTestsText', 'Run Tests');
        this.set('isConnected', false);
        this.set('testsPassed', '-');
        this.set('testsFailed', '-');
        this.set('testsRan', 0);
        this.set('testsTotal', 0);

        this.startEmitted = false;

        this.networkConfig = config;

        this.resolveKarmaHost()
            .then(() => {
                if (this.networkConfig.reachableIp) {
                    this.connectToKarma();
                }
            }).catch(e => console.log(e.toString()));
    }

    public resolveKarmaHost() {
        var successfulResolution = new Promise<string>((resolve, reject) => {
            var foundKarma = false;
            var resolvers = config.ips.map(ip => {
                var karmaClientUrl = 'http://' + ip + ':' + config.port + '/context.json';
                console.log('UTR: fetching ' + karmaClientUrl);
                return http.getString(karmaClientUrl)
                    .then(() => {
                        console.log('UTR: got something from ' + ip);
                        if (!foundKarma) {
                            foundKarma = true;
                            resolve(ip);
                        }
                    }, () => undefined)
            });
            Promise.all(resolvers)
                .then(() => {
                    if (!foundKarma) {
                        resolve(null);
                    }
                })
        });

        return successfulResolution
            .then(result => {
                console.log('UTR: and the results are in...');

                if (result) {
                    this.set('serverInfo', 'found karma at ' + result);
                    this.networkConfig.reachableIp = result;
                } else {
                    this.set('serverInfo', 'no reachable hosts');
                }
            });
    }

    private updateBanner(message: string): (err?: any) => void {
        return err => {
            this.set('serverInfo', message);
            if (err) {
                console.log('socket.io: ' + err.toString());
            }
        }
    }

    public connectToKarma() {
        console.log('UTR: connecting to karma');

        var io = require('./socket.io');
        this.baseUrl = 'http://' + this.networkConfig.reachableIp + ':' + this.networkConfig.port;
        this.set('serverInfo', 'connecting to ' + this.baseUrl);
        var socket = this.socket = io.connect(this.baseUrl, {
            forceBase64: true
        });

        function formatName() {
            return `NativeScript / ${ platform.device.sdkVersion } (${ platform.device.osVersion }; ${ platform.device.model })`;
        }

        var connected = this.updateBanner('connected');

        socket.on('connect', err => {
            console.log('UTR: connected to karma!!!');

            connected();

            this.set('isConnected', true);

            socket.emit('register', {
                id: 'NativeScriptUnit-' + (0 | (Math.random() * 10000)),
                name: formatName(),
            });
        });
        socket.on('disconnect', this.updateBanner('disconnected'));
        socket.on('reconnecting', this.updateBanner('reconnecting in $ ms...'));
        socket.on('reconnect', connected);
        socket.on('reconnect_failed', this.updateBanner('failed to reconnect'));
        socket.on('info', this.updateBrowsersInfo.bind(this));
        socket.on('connect_failed', this.updateBanner('connection failed'));
        socket.on('disconnect', () => this.updateBrowsersInfo([]));

        socket.on('connect_error', data => console.log('socket.io error on connect: ' + data));

        socket.on('execute', this.onKarmaExecute.bind(this));
    }

    public viewTestRunDetails() {
        frameModule.topmost().navigate('run-details');
    }

    public beginLocalRun() {
        this.config = this.config || { args: [] };

        frameModule.topmost().navigate('tns_modules/unit-test-runner/test-run-page');
    }

    public onKarmaExecute(cfg) {
        this.karmaRequestedRun = true;
        this.config = cfg;

        this.beginLocalRun();
    }

    public executeTestRun() {
        if (this.executed) {
            console.log('disregarding second execution');
            return;
        }
        this.executed = true;

        this.set('goToTestsText', 'View Test Run');

        this.startEmitted = false;
        this.hasError = false;
        var contextUrl = this.baseUrl + '/context.json';
        console.log("Downloading " + contextUrl);
        http.getString(contextUrl)
            .then(content => {
                var parsedContent: IKarmaContext = JSON.parse(content);
                return parsedContent.files;
            })
            .then(scriptUrls => {
                return Promise.all(scriptUrls.map((url): Promise<IScriptInfo> => {
                    var appPrefix = '/base/app/';
                    if (url.startsWith(appPrefix)) {
                        var paramsStart = url.indexOf('?');
                        var relativePath = url.substring(appPrefix.length, paramsStart);
                        return Promise.resolve({
                            url: url,
                            localPath: '../../' + relativePath,
                        });
                    } else {
                        return http.getString(this.baseUrl + url)
                            .then(contents => {
                                return {
                                    url: url,
                                    contents: contents,
                                };
                            });
                    }
                }));
            })
            .then(scriptsContents => setTimeout(() => this.runTests(scriptsContents), 0));
    }

    public runTests(testScripts) {
        testScripts.forEach((script, i) => {
            if (script.localPath) {
                console.log('require script ' + script.url + ' from ' + script.localPath);
                require(script.localPath);
            } else {
                console.log('eval script ' + script.url);
                this.loadShim(script.url);
                //call eval indirectly to execute the scripts in the global scope
                var geval = eval;
                geval(script.contents);
            }
        });

        console.log('beginning test run');
        this.start(this.config);
    }

    public updateBrowsersInfo(browsers) {
        //console.dir(browsers);
    }

    public start(cfg: any) {
        this.error("You need to include a test adapter for the testing framework you're using");
    }

    public info(data) {
        if (!this.startEmitted) {
            this.socketEmit('start', data);
            this.startEmitted = true;
        } else {
            this.socketEmit('info', data);
        }

        this.set('testsRunning', true);
        this.set('testsPassed', 0);
        this.set('testsFailed', 0);
        this.set('testsRan', 0);
        this.set('testsTotal', data.total);
    }

    public result(data) {
        if (!this.startEmitted) {
            this.socketEmit('start', { total: null });
            this.startEmitted = true;
        }

        this.socketEmit('result', data);

        var countVar = data.success ? 'testsPassed' : 'testsFailed';
        this.set(countVar, this.get(countVar) + 1);
        this.set('testsRan', this.get('testsRan') + 1);

        this.testResults.push(data);
    }

    public complete(data?: any) {
        console.log("Completed test run.");
        this.set('testsRunning', false);

        delete this.start;

        this.socketEmit('complete', data || {}, () => {
            console.log('completeAck');
            this.socketEmit('disconnect');
            setTimeout(() => stopProcess(), 500);
        });
    }

    public error(msg: string, url?: string, line?: number) {
        this.hasError = true;
        var fullMsg = url ? msg + '\nat ' + url + (line ? ':' + line : '') : msg;
        console.log("this.error: " + fullMsg);
        this.socketEmit('error', fullMsg);
        this.complete();
        return false;
    }

    public socketEmit(...args: any[]) {
        if (this.karmaRequestedRun) {
            this.socket.emit.apply(this.socket, arguments);
        }
    }

    private loadShim(url: string) {
        if (url.indexOf('mocha') !== -1) {
            if (!global.window) {
                global.window = global;
            }
            if (!global.location) {
                global.location = {};
            }
            if (!global.location.href) {
                global.location.href = '/';
            }
            if (!global.document.getElementById) {
                global.document.getElementById = id => null;
            }
        }
    }
}

export var mainViewModel = new TestBrokerViewModel();

require('application').onUncaughtError = error => {
    console.log("!!!!!!!!!!!!!!!!!!!!!!!error!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    mainViewModel.error(error.message);
}
