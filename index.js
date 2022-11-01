const express = require('express');
const mysql = require('mysql');
const fs = require('fs');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'lab3db',
    multipleStatements: true,
    connectTimeout: 30000
});

// Express
const app = express();
const port = 3000;

// For serving static front end
app.use('/', express.static('static'));

// For logging requests
app.use((req, res, next) => { // for all routes
    console.log('Request: ', req.method, ' \tPath: ', req.url);
    next(); // keep going
});

// Resets the db (THIS TAKES LIKE ~5 MINUTES TO COMPLETE IF YOU RUN IT)
app.get('/resetDB', (req, res) => {
    buildGenresDB();
    buildAlbumsDB();
    buildArtistsDB();
    buildTracksDB();
    res.redirect('index.html');
});

// Routes requests for /api/artists
const artistRouter = express.Router();
app.use('/api/artists', artistRouter);

// Querys db for a given artist id and returns 1 result
artistRouter.get('/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM artists WHERE artistID=' + id + ' LIMIT 1;', (err, data) => {
        if (data === []) {
            res.status(404).send("Not Found");
        }
        else if (err) {
            res.status(500).send(err);
        }
        else {
            res.send(data[0]);
        }
    });
});

// Routes requests for /api/tracks
const trackRouter = express.Router();
app.use('/api/tracks', trackRouter);

// Querys db for given trackTitle and/or albumName and returns specified number of results
trackRouter.get('', (req, res) => {
    const trackTitle = req.query.trackTitle;
    const albumName = req.query.albumName;
    const results = req.query.results;

    // Functions for sending response after db query
    const queryRes = (err, data) => {
        if (data === []) {
            res.status(404).send("Not Found");
        }
        else if (err) {
            res.status(500).send(err);
        }
        else {
            res.send(data);
        }
    }

    // Track title and album name was recived
    if (trackTitle !== "" && albumName !== "") {
        db.query('SELECT tracks.trackID,tracks.albumID,' +
            'albums.albumName,tracks.artistID,' +
            'artists.artistName,tracks.trackTags,' +
            'tracks.trackDateCreated,tracks.trackDateRecorded,' +
            'tracks.trackDuration,tracks.trackGenres,' +
            'tracks.trackNumber,tracks.trackTitle ' +
            'FROM tracks ' +
            'LEFT JOIN albums ON tracks.albumID=albums.albumID ' +
            'LEFT JOIN artists ON tracks.artistID=artists.artistID ' +
            'WHERE tracks.trackTitle LIKE ' + "'%" + trackTitle + "%'" +
            'AND albums.albumName LIKE ' + "'%" + albumName + "%' " +
            "LIMIT " + results + ";", queryRes);
    }
    // Album name was recived
    else if (trackTitle === "" && albumName !== "") {
        db.query('SELECT tracks.trackID,tracks.albumID,' +
            'albums.albumName,tracks.artistID,' +
            'artists.artistName,tracks.trackTags,' +
            'tracks.trackDateCreated,tracks.trackDateRecorded,' +
            'tracks.trackDuration,tracks.trackGenres,' +
            'tracks.trackNumber,tracks.trackTitle ' +
            'FROM tracks ' +
            'LEFT JOIN albums ON tracks.albumID=albums.albumID ' +
            'LEFT JOIN artists ON tracks.artistID=artists.artistID ' +
            'WHERE albums.albumName LIKE ' + "'%" + albumName + "%' " +
            "LIMIT " + results + ";", queryRes);
    }
    // Track title was recived
    else if (trackTitle !== "" && albumName === "") {
        db.query('SELECT tracks.trackID,tracks.albumID,' +
            'albums.albumName,tracks.artistID,' +
            'artists.artistName,tracks.trackTags,' +
            'tracks.trackDateCreated,tracks.trackDateRecorded,' +
            'tracks.trackDuration,tracks.trackGenres,' +
            'tracks.trackNumber,tracks.trackTitle ' +
            'FROM tracks ' +
            'LEFT JOIN albums ON tracks.albumID=albums.albumID ' +
            'LEFT JOIN artists ON tracks.artistID=artists.artistID ' +
            'WHERE tracks.trackTitle LIKE ' + "'%" + trackTitle + "%' " +
            "LIMIT " + results + ";", queryRes);
    }
});

// Querys db for given track id and returns 1 result
trackRouter.get('/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT tracks.trackID,tracks.albumID,' +
        'albums.albumName,tracks.artistID,' +
        'artists.artistName,tracks.trackTags,' +
        'tracks.trackDateCreated,tracks.trackDateRecorded,' +
        'tracks.trackDuration,tracks.trackGenres,' +
        'tracks.trackNumber,tracks.trackTitle ' +
        'FROM tracks ' +
        'LEFT JOIN albums ON tracks.albumID=albums.albumID ' +
        'LEFT JOIN artists ON tracks.artistID=artists.artistID ' +
        'WHERE tracks.trackID=' + id +
        " LIMIT 1;", (err, data) => {
            if (data === []) {
                res.status(404).send("Not Found");
            }
            else if (err) {
                res.status(500).send(err);
            }
            else {
                res.send(data[0]);
            }
        });
});

// Listening for requests on given port
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});

// Takes a CVS file and converts it to a JSON object
function csvToJSON(csvFilePath) {
    let csv = fs.readFileSync(csvFilePath);// reading csv

    // Getting the headers
    let csvAsArrayByRows = csv.toString().split("\n");
    let headers = csvAsArrayByRows[0].split(","); // extracting headers

    // Building new csv as a string without the header line
    let csvAsString = "";
    for (let i = 1; i < csvAsArrayByRows.length - 1; i++) {
        csvAsString += (csvAsArrayByRows[i] + "\n");
    }

    // Creates an array where each element is a row from the CSV file
    let valueCounter = 0;
    let inQuotes = false;
    let value = "";
    let obj = {};
    let csvAsJSON = [];
    for (let ch of csvAsString) {
        // Toggles in quotes variable whenever quotes are encountered 
        if (ch === '"') {
            inQuotes = !inQuotes;
        }
        // If we are not in quotes replace the comma with a |
        if (ch === ',' && !inQuotes) {
            obj[headers[valueCounter]] = value.trim();
            value = "";
            valueCounter++;
            continue;
        }
        // When a newline is encountered and we are on the last value in a row push the current row to the array and start over
        if (ch === '\n' && valueCounter === headers.length - 1 && !inQuotes) {
            obj[headers[headers.length - 1]] = value.trim();
            csvAsJSON.push(obj);
            obj = {};
            value = "";
            valueCounter = 0;
            continue;
        }
        // add the character to the string
        if (ch !== '"') {
            value += ch;
        }
    }

    return csvAsJSON;
}

// Builds Genres table from CSV file
function buildGenresDB() {
    // Deletes the table if one already exists
    db.query("DROP TABLE genres;", (err) => {
        if (err) {
            console.log("No Table to drop");
        }
        else {
            console.log("Dropped Table");
        }
    }
    );

    // Creates new Table
    db.query(
        "CREATE TABLE genres (\n" +
        "genreID int NOT NULL,\n" +
        "genreNumTracks int DEFAULT NULL,\n" +
        "genreParent int DEFAULT NULL,\n" +
        "genreTitle char(45) DEFAULT NULL,\n" +
        "genreTopLevel int DEFAULT NULL,\n" +
        "PRIMARY KEY (genreID)\n);\n", (err) => {
            if (err) {
                throw err;
            }
            console.log("Genre Table Created");
        }
    );

    // Adds genres from CSV file to the db
    let genres = csvToJSON("data/genres.csv");
    let i = 0;
    for (let genre of genres) {
        db.query("INSERT INTO genres VALUES (" +
            genre.genre_id + ", " +
            genre["#tracks"] + ", " +
            genre.parent + ", " +
            '"' + genre.title + '"' + ", " +
            genre.top_level + ");", (err) => {
                if (err) {
                    throw err;
                }
                console.log("Inserted genre " + genre.genre_id + " into genres table \t" + ((++i) / genres.length) * 100 + " \t%");
            });
    }
}

// Builds Albums table from CSV file
function buildAlbumsDB() {
    // Deletes the table if one already exists
    db.query("DROP TABLE albums;", (err) => {
        if (err) {
            console.log("No Table to drop");
        }
        else {
            console.log("Dropped Table");
        }
    }
    );

    // Creates new table
    db.query(
        "CREATE TABLE albums (\n" +
        "albumID int NOT NULL,\n" +
        "albumName char(100) DEFAULT NULL,\n" +
        "PRIMARY KEY (albumID)\n);\n", (err) => {
            if (err) {
                throw err;
            }
            console.log("Album Table Created");
        }
    );

    // Adds albums from CSV to the db
    let albums = csvToJSON("data/raw_albums.csv");
    let i = 0;
    for (let album of albums) {
        db.query("INSERT INTO albums VALUES (" +
            album.album_id + ", " +
            '"' + album.album_handle.replaceAll('_', ' ') + '"' + ");", (err) => {
                if (err) {
                    throw err;
                }
                console.log("Inserted album " + album.album_id + " into albums table \t" + ((++i) / albums.length) * 100 + " \t%");
            });
    }
}

// Builds Artists table from CSV file
function buildArtistsDB() {
    // Deletes the table if one already exists
    db.query("DROP TABLE artists;", (err) => {
        if (err) {
            console.log("No Table to drop");
        }
        else {
            console.log("Dropped Table");
        }
    }
    );

    // Creates new table
    db.query(
        "CREATE TABLE artists (\n" +
        "artistID int NOT NULL,\n" +
        "artistName char(100) DEFAULT NULL,\n" +
        "artistLocation char(100) DEFAULT NULL,\n" +
        "artistFavorites int DEFAULT NULL,\n" +
        "artistDateCreated char(45) DEFAULT NULL,\n" +
        "artistWebsite char(200) DEFAULT NULL,\n" +
        "artistAssociatedLabels text DEFAULT NULL,\n" +
        "PRIMARY KEY (artistID)\n);\n", (err) => {
            if (err) {
                throw err;
            }
            console.log("Artists Table Created");
        }
    );

    // Adds artists from the CSV file to the db
    let artists = csvToJSON("data/raw_artists.csv");
    let i = 0;
    for (let artist of artists) {
        db.query("INSERT INTO artists VALUES (" +
            artist.artist_id + ", " +
            '"' + artist.artist_handle.replaceAll('_', ' ') + '"' + ", " +
            '"' + artist.artist_location.split('\n')[0].slice(0, 99) + '"' + ", " +
            artist.artist_favorites + ", " +
            '"' + artist.artist_date_created + '"' + ", " +
            '"' + artist.artist_website + '"' + ", " +
            '"' + artist.artist_associated_labels + '"' + ");", (err) => {
                if (err) {
                    throw err;
                }
                console.log("Inserted artist " + artist.artist_id + " into artists table \t" + ((++i) / artists.length) * 100 + " \t%");
            });
    }
}

// Builds Tracks table from CSV file
function buildTracksDB() {
    // Deletes table if one already exists
    db.query("DROP TABLE tracks;", (err) => {
        if (err) {
            console.log("No Table to drop");
        }
        else {
            console.log("Dropped Table");
        }
    }
    );

    // Creates new table
    db.query(
        "CREATE TABLE tracks (\n" +
        "trackID int NOT NULL,\n" +
        "albumID int DEFAULT NULL,\n" +
        "artistID int DEFAULT NULL,\n" +
        "trackTags text DEFAULT NULL,\n" +
        "trackDateCreated char(45) DEFAULT NULL,\n" +
        "trackDateRecorded char(45) DEFAULT NULL,\n" +
        "trackDuration char(45) DEFAULT NULL,\n" +
        "trackGenres char(100) DEFAULT NULL,\n" +
        "trackNumber int DEFAULT NULL,\n" +
        "trackTitle char(200) DEFAULT NULL,\n" +
        "PRIMARY KEY (trackID)\n);\n", (err) => {
            if (err) {
                throw err;
            }
            console.log("Tracks Table Created");
        }
    );

    // Adds Tracks from CSV file to the db
    let tracks = csvToJSON("data/raw_tracks.csv");
    let i = 0;
    for (let track of tracks) {
        db.query("INSERT INTO tracks VALUES (" +
            track.track_id + ", " +
            ((track.album_id === '') ? "null" : track.album_id) + ", " +
            track.artist_id + ", " +
            '"' + track.tags + '"' + ", " +
            '"' + track.track_date_created + '"' + ", " +
            '"' + track.track_date_recorded + '"' + ", " +
            '"' + track.track_duration + '"' + ", " +
            '"' + track.genres + '"' + ", " +
            track.track_number + ", " +
            '"' + track.track_title.replace(/[;\\]/g, "").trim() + '"' + ");", (err) => {
                if (err) {
                    throw err;
                }
                console.log("Inserted track " + track.track_id + " into tracks table \t" + ((++i) / tracks.length) * 100 + " \t%");
            });
    }
}