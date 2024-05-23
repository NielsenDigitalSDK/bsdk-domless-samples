const {BsdkInstance} = require('bsdk-domless');


class MockVideoPlayer {
    constructor() {
        this.isPlaying = false;
        this.playheadPosition = 0;
        this.playerTimer = null;
        this.nSdkInstance = null; 
        this.loadMetadatCalled = false;

        this.initialize();
    }

    initialize = async () => {
        const sdkReady = await new BsdkInstance(
            'T4C09597F-ED21-4439-A627-EE6091D30C1A', // AppId
            'myInstance0', // instanceName
            // metadata
            {
                appName: 'myAppName',
                appVersion: 'myAppVersion',
                deviceID: 'myDeviceID',
                deviceType: 'myDeviceType',
                deviceVersion: 'myDeviceVersion',
                osType: 'windows',
                osVersion: 'myOsVersion',
                sfcode: 'qat4',
                optout: 'false',
                protocol: 'https',
                //nol_sdkDebug: 'debug',
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
                    set: function (key, value) {
                      console.log('Setting key via Storage: ', key, ' with value: ', value);
                    },
                    get: function (key) {
                      console.log('Getting key via Storage: ', key);
                    },
                    remove: function (key) {
                      console.log('Removing key via Storage: ', key);
                    },
                    clear: function () {
                      console.log('Clearin storage: ');
                    }
                  },
                Fetch: async function (url, options) {
                    console.log('Fetching from url: ', url);
                    const response = await fetch(url, options);
                    if (response.ok) {
                      console.log('Response is OK');
                      return response;
                    }
                  },
                SetTimeout: async function (args) {
                    setTimeout(...args);
                  },
                ClearTimeout(args) {
                    clearTimeout(...args);
                  },
                SetInterval(args) {
                    setInterval(...args);
                  },
                ClearInterval(args) {
                    clearInterval(...args);
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
        if(this.loadMetadatCalled === false){
            console.log('Please load metadata before playing video...');
            return false;
        }
        return true;
    }

    loadmetadata = (meta) => {
        if(this.nSdkInstance !== null) {
            this.loadMetadatCalled = true;
            this.nSdkInstance.ggPM('loadmetadata', meta);
            console.log('metadata loaded for video...');
        }
    }

    play = () => {
        if(this.loadMetadataHasBeenCalled() === false) {
            return;
        }
        if(!this.isPlaying && this.nSdkInstance !== null) {
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
        if(this.loadMetadataHasBeenCalled() === false) {
            return;
        }
        if(this.isPlaying) {
            this.isPlaying = false;
            console.log('pausing video...');
            clearInterval(this.playerTimer);
            this.nSdkInstance.ggPM('pause', this.playheadPosition);
        }
    }

    end = () => {
        if(this.loadMetadataHasBeenCalled() === false) {
            return;
        }
        if(this.isPlaying) {
            this.isPlaying = false;
            console.log('end video...');
            clearInterval(this.playerTimer);
            this.nSdkInstance.ggPM('end', this.playheadPosition);
            this.playheadPosition = 0;
            process.exit(0);
        } else {
            console.log('end video...');
            this.nSdkInstance.ggPM('end', this.playheadPosition);
            this.playheadPosition = 0;
            process.exit(0);
        }
    }

    processPlayheadPosition = (position) => {
        console.log(`playhead at position ${position}`);
        this.nSdkInstance.ggPM('playheadPosition', this.playheadPosition);
    }

    // Additional methods for testing processEvent
    blur = () => {
        if(this.isPlaying) {
            console.log('firing blur...');
            if(this.loadMetadataHasBeenCalled() === false) {
                return;
            }
            this.nSdkInstance.processEvent({'type': 'Blur', 'timestamp': Date.now()});
        }
    }

    focus = () => {
        if(this.isPlaying) {
            console.log('firing focus...');
            if(this.loadMetadataHasBeenCalled() === false) {
                return;
            }
            this.nSdkInstance.processEvent({'type': 'Focus', 'timestamp': Date.now()});
        }
    }

    appclose = () => {
        if(this.isPlaying) {
            console.log('firing app close...');
            if(this.loadMetadataHasBeenCalled() === false) {
                process.exit(0);
            }
            this.nSdkInstance.processEvent({'type': 'AppClose', 'timestamp': Date.now()});
            process.exit(0);
        }
    }

}

module.exports = MockVideoPlayer;