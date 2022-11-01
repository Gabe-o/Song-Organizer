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

app.use('/', express.static('static'));

// Resets the db
app.get('/resetDB', (req, res) => {
    buildGenresDB();
    buildAlbumsDB();
    buildArtistsDB();
    buildTracksDB();
    res.redirect('static/index.html');
});

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
        "id int NOT NULL,\n" +
        "numTracks int DEFAULT NULL,\n" +
        "parent int DEFAULT NULL,\n" +
        "title char(45) DEFAULT NULL,\n" +
        "top_level int DEFAULT NULL,\n" +
        "PRIMARY KEY (id)\n);\n", (err) => {
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
        "id int NOT NULL,\n" +
        "name char(100) DEFAULT NULL,\n" +
        "PRIMARY KEY (id)\n);\n", (err) => {
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
        "id int NOT NULL,\n" +
        "name char(100) DEFAULT NULL,\n" +
        "location char(100) DEFAULT NULL,\n" +
        "favorites int DEFAULT NULL,\n" +
        "dateCreated char(45) DEFAULT NULL,\n" +
        "website char(200) DEFAULT NULL,\n" +
        "associatedLabels text DEFAULT NULL,\n" +
        "PRIMARY KEY (id)\n);\n", (err) => {
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
        "id int NOT NULL,\n" +
        "albumID int DEFAULT NULL,\n" +
        "artistID int DEFAULT NULL,\n" +
        "tags text DEFAULT NULL,\n" +
        "dateCreated char(45) DEFAULT NULL,\n" +
        "dateRecorded char(45) DEFAULT NULL,\n" +
        "duration char(45) DEFAULT NULL,\n" +
        "genres char(100) DEFAULT NULL,\n" +
        "number int DEFAULT NULL,\n" +
        "title char(200) DEFAULT NULL,\n" +
        "PRIMARY KEY (id)\n);\n", (err) => {
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