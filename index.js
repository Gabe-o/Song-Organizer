const express = require('express');
const mysql = require('mysql');

// Connecting to db
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'lab3db',
    multipleStatements: true,
});



// Express
const app = express();
const port = 3000;

// For serving static front end
app.use('/', express.static('static'));
app.use(express.json());
// For logging requests
app.use((req, res, next) => { // for all routes
    console.log('Request: ', req.method, ' \tPath: ', req.url);
    next(); // keep going
});



// Gets List of all genre names, IDs and parent IDs
app.get('/api/genres', (req, res) => {
    db.query('SELECT genreTitle,genreID,genreParent FROM genres;', (err, data) => {
        if (data.length === 0) {
            res.status(404).send("Not Found");
        }
        else if (err) {
            res.status(500).send(err);
        }
        else {
            res.send(data);
        }
    });
});



// Routes requests for /api/artists
const artistRouter = express.Router();
app.use('/api/artists', artistRouter);

// Query db for given artist name
artistRouter.get('', (req, res) => {
    const artistName = req.query.artistName;

    db.query('SELECT * FROM artists WHERE artistName LIKE' + "'%" + artistName + "%';", (err, data) => {
        if (data.length === 0) {
            res.status(404).send("Not Found");
        }
        else if (err) {
            res.status(500).send(err);
        }
        else {
            res.send(data);
        }
    });
});

// Querys db for a given artist id and returns 1 result
artistRouter.get('/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM artists WHERE artistID=' + id + ' LIMIT 1;', (err, data) => {
        if (data.length === 0) {
            res.status(404).send("Not Found");
        }
        else if (err) {
            res.status(500).send(err);
        }
        else {
            res.send(data);
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
        if (data.length === 0) {
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
            if (data.length === 0) {
                res.status(404).send("Not Found");
            }
            else if (err) {
                res.status(500).send(err);
            }
            else {
                res.send(data);
            }
        });
});



// Listening for requests on given port
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});