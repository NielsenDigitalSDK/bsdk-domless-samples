const readline = require('readline');
const MockVideoPlayer = require('./MockVideoPlayer');
const videoPlayer = new MockVideoPlayer();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const videoMetadata = {
    'type': 'content',
    'assetid': 'VID-123456',
    'program': 'Program1',
    'title': 'TitleEP1:S1',
    'length': '300',
    'airdate': '20210321 09:00:00',
    'isfullepisode': 'y',
    'adloadtype': '2',
    'segB': 'custom segment B', // optional
    'segC': 'custom segment C', // optional
    'crossId1': 'Standard Episode ID', // optional
    'crossId2': 'Content Originator', //optional
}

const id3 = 'www.nielsen.com/0UQ1mB-DRZMCTQ3Fr9zLjw==/EnVp4bRmgPx7KDNctoTVpQ==/AAcCEP7hk_DDqQuocAM3JRHB7raS8j8yKAM2b3Na2F9Po4yWm87KA6Ubefb3Hb6Fj_GOijXnlXw1yzgKzpc0J-cCEFEQqjGD2HHpSj5upGJyz6V0lx5j64rfFd4jyv3cxHGz_UKb-yJdHKTHKB11Iv_LJls1P1xbNT9iOo8=/10200/12000/00';

console.log("Time to test the Domless SDK va Node.js");
console.log("Commands: loadmetadata, id3, play, pause, end, blur, focus, appclose");

rl.on('line', (input) => {
    if (input === 'loadmetadata') {
        videoPlayer.loadmetadata(videoMetadata);
    } else if (input === 'play') {
        videoPlayer.play();
    } else if (input === 'pause') {
        videoPlayer.pause();
    } else if (input.includes('playheadPosition')) {
        const position = input.split(' ')[1];
        videoPlayer.playheadPosition(position);
    } else if (input === 'id3') {
        videoPlayer.sendid3(id3);
    } else if (input === 'end') {
        videoPlayer.end();
    } else if (input === 'blur') {
        videoPlayer.blur();
    } else if (input === 'focus') {
        videoPlayer.focus();
    } else if (input === 'appclose') {
        videoPlayer.appclose();
    } else {
        console.log('Invalid command');
    }
});

rl.on('close', () => {
    console.log('Exiting our Node.js player test...');
    process.exit(0);
});

