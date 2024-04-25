const readline = require('readline');
const fs = require('fs');
const MockVideoPlayer = require('./MockVideoPlayer');
const videoPlayer = new MockVideoPlayer();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const videoMetadata = {
    'type': 'content',
    'length': '300',
    'censuscategory': 'Enlisted',
    'title': 'Channel1',
    'assetid': '204558915991',
    'section': 'ProgramAsset8',
    'tv': 'true',
    'adModel': '0',
    'dataSrc': 'cms'
}

console.log("Time to test the Domless SDK va Node.js");
console.log("Commands: loadmetadata, play, pause, end, blur, focus, appclose");

rl.on('line', (input) => {
    if (input === 'loadmetadata') {
        videoPlayer.loadmetadata(videoMetadata);
    } else if (input === 'play') {
        videoPlayer.play();
    } else if (input === 'stop') {
        videoPlayer.stop();
    } else if (input === 'pause') {
        videoPlayer.pause();
    } else if (input.includes('playheadPosition')) {
        const position = input.split(' ')[1];
        videoPlayer.playheadPosition(position);
    } else if (input === 'end') {
        videoPlayer.end();
    } else if (input === 'blur'){
        videoPlayer.blur();
    } else if (input === 'focus'){
        videoPlayer.focus();
    } else if (input === 'appclose'){
        videoPlayer.appclose();
    } else {
        console.log('Invalid command');
    }
});

rl.on('close', () => {
    console.log('Exiting our Node.js player test...');
    process.exit(0);
});

