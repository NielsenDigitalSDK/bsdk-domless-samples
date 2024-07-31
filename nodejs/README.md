# lite-nodejs-test-player

## Requirements
Node 18+ is required to run this app

## Getting started
Install packages
```
npm install
```

## Description
This is a simple CLI app that mimicks a video player and processes the events from the player and calls the respective events for the Nielsen SDK. The app is written in Node.js and uses the readline module to listen for commands in the CLI.

- MockVideoPlayer.js mimicks a video player and contains our SDK instance and processes the calls from the player and calls the respective events for the Nielsen SDK
- App.js listens for commands in the CLI, processes them and calls the respective events in MockVideoPlayer.js

## Current events processed at CLI

Once the app is running, you can call the following events in the CLI:

- loadmetadata - Must be called first to load the metadata
- id3
- play
- pause
- end

The below events can be passed to CLI as well and are processed by the exposed processEvent API call
- blur
- focus
- appclose

## How to Run the app

Simply call:
```
node App.js
```

To end the session, call end. This will fire end to the SDK and close the CLI session
