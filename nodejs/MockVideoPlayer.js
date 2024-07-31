const { BsdkInstance } = require('bsdk-domless');
const fs = require('fs');
const path = require('path');

const storageFilePath = path.resolve(__dirname, 'localStorage.json');
let isWriting = false;


const readStorage = async () => {
    try {
      const data = await fs.promises.readFile(storageFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  };

  const writeStorage = async (data) => {
    while (isWriting) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100 milliseconds
    }
    isWriting = true;
    try {
      await fs.promises.writeFile(storageFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('Error writing to storage file:', error);
    } finally {
      isWriting = false;
    }
  };

class MockVideoPlayer {
    constructor() {
        this.isPlaying = false;
        this.playheadPosition = 0;
        this.playerTimer = null;
        this.nSdkInstance = null;
        this.loadMetadataCalled = false;
        this.dtvrNotEnabled = true;
        this.id3Position = 0;
        this.id3Timer = null;

        this.initialize();
    }

    initialize = async () => {
        const TAG = 'SDKNodeJS: '
        const sdkReady = await new BsdkInstance(
            'T4C09597F-ED21-4439-A627-EE6091D30C1A', // AppId
            'myInstance0', // instanceName
            // metadata
            {
                appName: 'myAppName',
                appVersion: 'myAppVersion',
                deviceId: 'myDeviceID',
                deviceType: 'myDeviceType',
                deviceVersion: 'myDeviceVersion',
                osType: 'windows',
                osVersion: 'myOsVersion',
                sfcode: 'qat4',
                optout: 'false',
                protocol: 'https',
                domlessEnv: '3',
                nol_sdkDebug: 'debug',
            },
            // implementationHooks
            {
                Log: {
                    info: function (log) {
                        console.info(log);
                    },
                    debug: function (log) {
                        console.debug(log);
                    },
                    warn: function (log) {
                        console.warn(log);
                    },
                    error: function (error) {
                        console.error(error);
                    }
                },
                /* Storage is not implemented yet */
                Storage: {
                    setItem: async function (key, value) {
                        console.log(`Setting key via Storage: ${key} with value: ${value}`);
                        const data = await readStorage();
                        data[key] = value;
                        await writeStorage(data);
                    },
                    getItem: async function (key) {
                        console.log('Getting Storage at key: ', key);
                        const data = await readStorage();
                        console.log(`Retrieved data from storage at key : ${key} - data is ${data[key]}`);
                        return data[key] || null;
                    },
                    removeItem: async function (key) {
                        console.log(`Removing item via key ${key} in Storage`);
                        const data = await readStorage();
                        delete data[key];
                        await writeStorage(data);
                    }
                },
                Fetch: async function (url, options) {
                    const response = await fetch(url, options);
                    if (response.ok) {
                        console.log(TAG + 'Response is OK');
                        return response;
                    } else {
                        throw new Error('Request failed');
                    }
                },
                SetTimeout: function (callback, timeout) {
                    return setTimeout(callback, timeout);
                },
                SetInterval: function (callback, interval) {
                    return setInterval(callback, interval);
                },
                ClearTimeout: function (timeout) {
                    clearTimeout(timeout);
                },
                ClearInterval: function (interval) {
                    clearInterval(interval);
                }
            }
        ).then(instance => {
            console.log('SDK initialized...');
            if (instance !== undefined) {
                this.nSdkInstance = instance;
                return instance;
            } else {
                console.error('Error initializing SDK: ', instance);
            }
        }).catch(error => {
            console.error('Error initializing SDK: ', error);
        });
    }

    loadMetadataHasBeenCalled = () => {
        if (this.loadMetadataCalled === false) {
            console.log('Please load metadata before playing video...');
            return false;
        }
        return true;
    }

    loadmetadata = (meta) => {
        if (this.nSdkInstance !== null) {
            this.loadMetadataCalled = true;
            this.nSdkInstance.ggPM('loadmetadata', meta);
            console.log('metadata loaded for video...');
        }
    }

    sendid3 = (id3) => {
        if (this.nSdkInstance !== null) {
            this.isPlaying = true;
            this.dtvrNotEnabled = false;
            const parsedId3 = id3.toString().split('/');

            this.nSdkInstance.ggPM('sendid3', id3);

            this.id3Timer = setInterval(() => {
                this.id3Position += 1;
                console.log(`id3 tick: ${this.id3Position}`);
                if (this.id3Position % 10 === 0) {
                    parsedId3[4] = (parseInt(parsedId3[4]) + 10).toString(); // set pc value
                    parsedId3[5] = (parseInt(parsedId3[5]) + 10).toString(); // set fd value
                    id3 = parsedId3.join('/');
                    console.log('sending id3 tag...');
                    this.nSdkInstance.ggPM('sendid3', id3);
                }
            }, 1000);
        }
    }

    play = () => {
        if (this.loadMetadataHasBeenCalled() === false) {
            return;
        }
        if (!this.isPlaying && this.nSdkInstance !== null) {
            this.isPlaying = true;
            console.log('playing video...');
            this.playerTimer = setInterval(() => {
                this.playheadPosition += 1;
                this.processPlayheadPosition(this.playheadPosition);
                this.nSdkInstance.ggPM('play', this.playheadPosition);
            }, 1000);
        }
    }

    pause = () => {
        if (this.loadMetadataHasBeenCalled() === false) {
            return;
        }
        if (this.isPlaying) {
            this.isPlaying = false;
            console.log('pausing video...');
            clearInterval(this.playerTimer);
            clearInterval(this.id3Timer);
            this.nSdkInstance.ggPM('pause', this.playheadPosition);
        }
    }

    end = () => {
        if (this.loadMetadataHasBeenCalled() === false && this.dtvrNotEnabled) {
            return;
        }
        if (this.isPlaying) {
            this.isPlaying = false;
            console.log('end video...');
            clearInterval(this.playerTimer);
            clearInterval(this.id3Timer);
            this.nSdkInstance.ggPM('end', this.playheadPosition);
            this.playheadPosition = 0;
            this.id3Position = 0;
            process.exit(0);
        } else {
            console.log('end video...');
            this.nSdkInstance.ggPM('end', this.playheadPosition);
            this.playheadPosition = 0;
            this.id3Position = 0;
            process.exit(0);
        }
    }

    processPlayheadPosition = (position) => {
        console.log(`playhead at position ${position}`);
        this.nSdkInstance.ggPM('playheadPosition', this.playheadPosition);
    }

    // Additional methods for testing processEvent
    blur = () => {
        if (this.isPlaying) {
            console.log('firing blur...');
            if (this.loadMetadataHasBeenCalled() === false) {
                return;
            }
            this.nSdkInstance.processEvent({ 'type': 'Blur', 'timestamp': Date.now() });
        }
    }

    focus = () => {
        if (this.isPlaying) {
            console.log('firing focus...');
            if (this.loadMetadataHasBeenCalled() === false) {
                return;
            }
            this.nSdkInstance.processEvent({ 'type': 'Focus', 'timestamp': Date.now() });
        }
    }

    appclose = () => {
        if (this.isPlaying) {
            console.log('firing app close...');
            if (this.loadMetadataHasBeenCalled() === false) {
                process.exit(0);
            }
            this.nSdkInstance.processEvent({ 'type': 'AppClose', 'timestamp': Date.now() });
            process.exit(0);
        }
    }

}

module.exports = MockVideoPlayer;