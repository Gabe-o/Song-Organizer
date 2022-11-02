const mysql = require('mysql2');
const fs = require('fs');
const csv = require('csv-parser');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'lab3db',
    multipleStatements: true
});

buildGenresDB();
buildAlbumsDB();
buildArtistsDB();
buildTracksDB();
buildListsDB();
buildListTrackDetailsDB();

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
        "genreTitle varchar(45) DEFAULT NULL,\n" +
        "genreTopLevel int DEFAULT NULL,\n" +
        "PRIMARY KEY (genreID)\n);\n", (err) => {
            if (err) {
                throw err;
            }
            console.log("Genre Table Created");
        }
    );

    // Adds genres from CSV file to the db
    let genres = [];
    fs.createReadStream('data/genres.csv')
        .pipe(csv())
        .on('data', (data) => genres.push(data))
        .on('end', () => {
            let i = 0;
            for (let genre of genres) {
                db.query("INSERT INTO genres VALUES (" +
                    genre.genre_id + ", " +
                    genre["#tracks"] + ", " +
                    genre.parent + ", " +
                    '"' + genre.title.replaceAll('"', "") + '"' + ", " +
                    genre.top_level + ");", (err) => {
                        if (err) {
                            throw err;
                        }
                        console.log("Inserted genre " + genre.genre_id + " into genres table \t" + ((++i) / genres.length) * 100 + " \t%");
                    });
            }
        });
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
        "albumName varchar(100) DEFAULT NULL,\n" +
        "PRIMARY KEY (albumID)\n);\n", (err) => {
            if (err) {
                throw err;
            }
            console.log("Album Table Created");
        }
    );

    // Adds albums from CSV to the db
    let albums = [];
    fs.createReadStream('data/raw_albums.csv')
        .pipe(csv())
        .on('data', (data) => albums.push(data))
        .on('end', () => {
            let i = 0;
            for (let album of albums) {
                db.query("INSERT INTO albums VALUES (" +
                    album.album_id + ", " +
                    '"' + album.album_handle.replace(/[_"]/g, ' ').trim() + '"' + ");", (err) => {
                        if (err) {
                            throw err;
                        }
                        console.log("Inserted album " + album.album_id + " into albums table \t" + ((++i) / albums.length) * 100 + " \t%");
                    });
            }
        });
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
        "artistName varchar(100) DEFAULT NULL,\n" +
        "artistLocation varchar(100) DEFAULT NULL,\n" +
        "artistFavorites int DEFAULT NULL,\n" +
        "artistDateCreated varchar(45) DEFAULT NULL,\n" +
        "artistWebsite varchar(200) DEFAULT NULL,\n" +
        "artistAssociatedLabels text DEFAULT NULL,\n" +
        "PRIMARY KEY (artistID)\n);\n", (err) => {
            if (err) {
                throw err;
            }
            console.log("Artists Table Created");
        }
    );

    // Adds artists from the CSV file to the db
    let artists = [];
    fs.createReadStream('data/raw_artists.csv')
        .pipe(csv())
        .on('data', (data) => artists.push(data))
        .on('end', () => {
            let i = 0;
            for (let artist of artists) {
                db.query("INSERT INTO artists VALUES (" +
                    artist.artist_id + ", " +
                    '"' + artist.artist_handle.replace(/[_"]/g, ' ').trim() + '"' + ", " +
                    '"' + artist.artist_location.replaceAll('"', "").split('\n')[0].slice(0, 99) + '"' + ", " +
                    artist.artist_favorites + ", " +
                    '"' + artist.artist_date_created.replaceAll('"', "") + '"' + ", " +
                    '"' + artist.artist_website.replaceAll('"', "") + '"' + ", " +
                    '"' + artist.artist_associated_labels.replaceAll('"', "") + '"' + ");", (err) => {
                        if (err) {
                            throw err;
                        }
                        console.log("Inserted artist " + artist.artist_id + " into artists table \t" + ((++i) / artists.length) * 100 + " \t%");
                    });
            }
        });
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
        "trackDateCreated varchar(45) DEFAULT NULL,\n" +
        "trackDateRecorded varchar(45) DEFAULT NULL,\n" +
        "trackDuration varchar(45) DEFAULT NULL,\n" +
        "trackGenres text DEFAULT NULL,\n" +
        "trackNumber int DEFAULT NULL,\n" +
        "trackTitle varchar(200) DEFAULT NULL,\n" +
        "PRIMARY KEY (trackID)\n);\n", (err) => {
            if (err) {
                throw err;
            }
            console.log("Tracks Table Created");
        }
    );

    // Adds Tracks from CSV file to the db
    let tracks = [];
    fs.createReadStream('data/raw_tracks.csv')
        .pipe(csv())
        .on('data', (data) => tracks.push(data))
        .on('end', () => {
            let i = 0;
            for (let track of tracks) {
                db.query("INSERT INTO tracks VALUES (" +
                    track.track_id + ", " +
                    ((track.album_id === '') ? "null" : track.album_id) + ", " +
                    track.artist_id + ", " +
                    '"' + track.tags.replaceAll('"', "") + '"' + ", " +
                    '"' + track.track_date_created.replaceAll('"', "") + '"' + ", " +
                    '"' + track.track_date_recorded.replaceAll('"', "") + '"' + ", " +
                    '"' + track.track_duration.replaceAll('"', "") + '"' + ", " +
                    '"' + track.track_genres.replaceAll('"', "") + '"' + ", " +
                    track.track_number + ", " +
                    '"' + track.track_title.replace(/[;\\"]/g, "").trim() + '"' + ");", (err) => {
                        if (err) {
                            throw err;
                        }
                        console.log("Inserted track " + track.track_id + " into tracks table \t" + ((++i) / tracks.length) * 100 + " \t%");
                    });
            }
        });
}

// Builds Lists table
function buildListsDB() {
    // Deletes the table if one already exists
    db.query("DROP TABLE lists;", (err) => {
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
        "CREATE TABLE lists (\n" +
        "listID int NOT NULL AUTO_INCREMENT,\n" +
        "listName VARCHAR(255) NOT NULL,\n" +
        "numTracks int DEFAULT NULL,\n" +
        "totalDuration int DEFAULT NULL,\n" +
        "PRIMARY KEY (listID),\n" +
        "UNIQUE KEY listName_UNIQUE (listName));\n", (err) => {
            if (err) {
                throw err;
            }
            console.log("Lists Table Created");
        }
    );
}

// Build List Track DB table
function buildListTrackDetailsDB() {
    // Deletes the table if one already exists
    db.query("DROP TABLE listTrackDetails;", (err) => {
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
        "CREATE TABLE listTrackDetails (\n" +
        "listID int NOT NULL,\n" +
        "trackID int NOT NULL,\n" +
        "PRIMARY KEY (listID,trackID)\n);\n", (err) => {
            if (err) {
                throw err;
            }
            console.log("List Track Details Table Created");
        }
    );
}