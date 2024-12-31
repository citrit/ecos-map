const fs = require('fs');
const gpxParser = require('gpxparser');

function parseGPX(filePath) {
    const gpx = new gpxParser();
    const data = fs.readFileSync(filePath, 'utf8');
    gpx.parse(data);
    return gpx.tracks[0].points;
}

function averageGPX(tracks) {
    const averageTrack = [];
    const trackLength = tracks[0].length;

    for (let i = 0; i < trackLength; i++) {
        const latSum = tracks.reduce((sum, track) => sum + track[i].lat, 0);
        const lonSum = tracks.reduce((sum, track) => sum + track[i].lon, 0);
        const eleSum = tracks.reduce((sum, track) => sum + track[i].ele, 0);
        
        averageTrack.push({
            lat: latSum / tracks.length,
            lon: lonSum / tracks.length,
            ele: eleSum / tracks.length
        });
    }

    return averageTrack;
}

// Load and parse GPX files
const track1 = parseGPX('path/to/your/first.gpx');
const track2 = parseGPX('path/to/your/second.gpx');

// Average the tracks
const averagedTrack = averageGPX([track1, track2]);

console.log('Averaged Track:', averagedTrack);
