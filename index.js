const express = require('express');
const mysql = require('mysql2');
const Joi = require('Joi');

// Connecting to db
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'lab3db',
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
            res.status(404).json("Genre Not Found");
        }
        else if (err) {
            res.status(500).json(err);
        }
        else {
            res.json(data);
        }
    });
});



// Routes requests for /api/artists
const artistRouter = express.Router();
app.use('/api/artists', artistRouter);

// Query db for given artist name
artistRouter.get('', (req, res) => {
    // Input validation
    const schema = Joi.object({
        artistName: Joi.string().required()
    });
    const result = schema.validate(req.query);
    if (result.error) {
        res.status(400).json(result.error.details[0].message);
        return;
    }

    // Query using prepared statement to prevent injection attacks
    const artistName = "%" + req.query.artistName + "%";
    db.query("SELECT * FROM artists WHERE artistName LIKE ?;", [artistName], (err, data) => {
        if (err) {
            res.status(500).json(err);
        }
        else if (data.length === 0) {
            res.status(404).json("Artist Not Found");
        }
        else {
            res.json(data);
        }
    });
});

// Querys db for a given artist id and returns 1 result
artistRouter.get('/:id', (req, res) => {
    // Input validation
    const schema = Joi.object({
        id: Joi.number().required()
    });
    const result = schema.validate({ id: parseInt(req.params.id) });
    if (result.error) {
        res.status(400).json(result.error.details[0].message);
        return;
    }

    // Query using prepared statement to prevent injection attacks
    const id = req.params.id;
    db.query('SELECT * FROM artists WHERE artistID= ? LIMIT 1;', [id], (err, data) => {
        if (err) {
            res.status(500).json(err);
        }
        else if (data.length === 0) {
            res.status(404).json("Artist Not Found");
        }
        else {
            res.json(data);
        }
    });
});



// Routes requests for /api/tracks
const trackRouter = express.Router();
app.use('/api/tracks', trackRouter);

// Querys db for given trackTitle and/or albumName and returns specified number of results
trackRouter.get('', (req, res) => {
    // Input validation
    const schema = Joi.object({
        trackTitle: Joi.string().allow(""),
        albumName: Joi.when("trackTitle", { is: "", then: Joi.string(), otherwise: Joi.string().allow("") }),
        results: Joi.number().required()
    })
        .or("trackTitle", "albumName");
    const result = schema.validate(req.query);
    if (result.error) {
        res.status(400).json(result.error.details[0].message);
        return;
    }

    const trackTitle = req.query.trackTitle;
    const albumName = req.query.albumName;
    const results = parseInt(req.query.results);

    // Functions for sending response after db query
    const queryRes = (err, data) => {
        if (err) {
            res.status(500).json(err);
        }
        else if (data.length === 0) {
            res.status(404).json("Track Not Found");
        }
        else {
            res.json(data);
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
            'WHERE tracks.trackTitle LIKE ? ' +
            'AND albums.albumName LIKE ? ' +
            "LIMIT ?;", ["%" + trackTitle + "%", "%" + albumName + "%", results], queryRes);
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
            'WHERE albums.albumName LIKE ? ' +
            "LIMIT ?;", ["%" + albumName + "%", results], queryRes);
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
            'WHERE tracks.trackTitle LIKE ? ' +
            "LIMIT ?;", ["%" + trackTitle + "%", results], queryRes);
    }
});

// Querys db for given track id and returns 1 result
trackRouter.get('/:id', (req, res) => {
    // Input validation
    const schema = Joi.object({
        id: Joi.number().required()
    });
    const result = schema.validate({ id: parseInt(req.params.id) });
    if (result.error) {
        res.status(400).json(result.error.details[0].message);
        return;
    }

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
        'WHERE tracks.trackID=?' +
        " LIMIT 1;", [id], (err, data) => {
            if (data.length === 0) {
                res.status(404).json("Track Not Found");
            }
            else if (err) {
                res.status(500).json(err);
            }
            else {
                res.json(data);
            }
        });
});



// Routes requests for /api/lists
const listRouter = express.Router();
app.use('/api/lists', listRouter);

// Create a new list with a given list name. Return an error if name exists.
listRouter.post('', (req, res) => {
    // Input Validation
    const schema = Joi.object({
        listName: Joi.string().required()
    });
    const result = schema.validate(req.body);
    if (result.error) {
        res.status(400).json(result.error.details[0].message);
        return;
    }

    const listName = req.body.listName;

    db.query("INSERT INTO lists VALUES (?,?,?)", [listName, 0, "00:00"], (err, data) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(422).json(err.sqlMessage);
                return;
            }
            else {
                res.status(500).json(err);
                return;
            }
        }
        else {
            res.json(data);
            return;
        }
    });
});

// Get a list of list names, number of tracks that are saved in each list and the total play time of each list.
listRouter.get('', (req, res) => {
    db.query("SELECT * FROM lists", (err, data) => {
        if (err) {
            res.status(500).json(err);
        }
        else if (data.length === 0) {
            res.status(404).json("No Lists Found");
        }
        else {
            res.json(data);
        }
    });
});

// Get list of track ids for a given list
listRouter.get('/:listName', (req, res) => {
    // Input Validation
    const schema = Joi.object({
        listName: Joi.string().required()
    });
    const result = schema.validate(req.params);
    if (result.error) {
        res.status(400).json(result.error.details[0].message);
        return;
    }

    const listName = req.params.listName;

    db.query("SELECT listName FROM lists WHERE listName=? LIMIT 1", [listName], (err, data) => {
        if (err) {
            res.status(500).json(err);
            return;
        }
        // if list doesn't exist
        else if (data.length === 0) {
            res.status(404).json("List Not Found");
            return;
        }

        db.query("SELECT trackID FROM listtrackdetails WHERE listName=?", [listName], (err, data) => {
            if (err) {
                res.status(500).json(err);
                return;
            }
            else {
                res.json(data);
                return;
            }
        });

    });
});

// Adding list of tracks to a given list
listRouter.put('/:listName', (req, res) => {
    // Input Validation
    const schema = Joi.object({
        listName: Joi.string().required(),
    });
    const result = schema.validate(req.params);
    if (result.error) {
        res.status(400).json(result.error.details[0].message);
        return;
    }

    const listName = req.params.listName;
    let tracks = req.query.tracks.split(",").map(id => parseInt(id)).filter(Boolean);

    // Checks if a list exists
    db.query("SELECT listName FROM lists WHERE listName=? LIMIT 1;", [listName], (err, data) => {
        if (err) {
            res.status(500).json(err);
            return;
        }
        else if (data.length === 0) {
            res.status(404).json("List doesn't Exist");
            return;
        }

        // Deletes existing data
        db.query("DELETE FROM listtrackdetails WHERE listName=?;", [listName], (err) => {
            if (err) {
                res.status(500).json(err);
                return;
            }

            // Checks to see if the user acctually input any tracks
            if (tracks.length !== 0) {
                // Checks if the ids given exist in track db and gets ones that do along with there duration
                db.query("SELECT trackID,trackDuration FROM tracks WHERE trackID IN (?);", [tracks], (err, data) => {
                    if (err) {
                        res.status(500).json(err);
                        return;
                    }

                    // Filters tracks requested with tracks that acctually exist in db
                    let foundIDs = data.map(track => track.trackID);
                    tracks = tracks.filter(track => foundIDs.includes(track));

                    // Adds duration property to list of filtered tracks
                    tracks = tracks.map(trackID => {
                        return {
                            trackID: trackID,
                            trackDuration: data[foundIDs.indexOf(trackID)].trackDuration
                        }
                    });

                    // For total duration calc
                    let totalDuration = 0;
                    // Inserts each track
                    for (let track of tracks) {
                        db.query("INSERT INTO listtrackdetails VALUES (?,?);", [listName, track.trackID], (err) => {
                            if (err) {
                                res.status(500).json(err);
                                return;
                            }
                        });

                        // Calculation for total duration of list
                        let trackDur = track.trackDuration.split(":");
                        totalDuration += parseInt(trackDur[0]) * 60 + parseInt(trackDur[1]);
                    }

                    // Formoting total duration to string for display
                    totalDuration = `${parseInt(totalDuration / 60)}:${totalDuration % 60}`;

                    // Updating lists db with new info about that list
                    db.query("UPDATE lists SET numTracks=?,totalDuration=? WHERE listName=?;", [tracks.length, totalDuration, listName], (err) => {
                        if (err) {
                            res.status(500).json(err);
                            return;
                        }
                        res.json();
                    });
                });
            }
            else {
                // Updating lists db with new info about that list
                db.query("UPDATE lists SET numTracks=?,totalDuration=? WHERE listName=?;", [0, "00:00", listName], (err) => {
                    if (err) {
                        res.status(500).json(err);
                        return;
                    }
                    res.json();
                });
            }
        });
    });
});

// Delete a list
listRouter.delete('/:listName', (req, res) => {
    // Input Validation
    const schema = Joi.object({
        listName: Joi.string().required()
    });
    const result = schema.validate(req.params);
    if (result.error) {
        res.status(400).json(result.error.details[0].message);
        return;
    }

    const listName = req.params.listName;

    // Checks if list exists
    db.query("SELECT listName FROM lists WHERE listName=? LIMIT 1", [listName], (err, data) => {
        if (err) {
            res.status(500).json(err);
            return;
        }
        // if list doesn't exist
        else if (data.length === 0) {
            res.status(404).json("List Not Found");
            return;
        }

        // Deletes from list db
        db.query("DELETE FROM lists WHERE listName=?", [listName], (err, data) => {
            if (err) {
                res.status(500).json(err);
                return;
            }

            // Deletes from list track details db
            db.query("DELETE FROM listtrackdetails WHERE listName=?", [listName], (err) => {
                if (err) {
                    res.status(500).json(err);
                    return;
                }
                res.json()
            });
        });
    });
});

// Listening for requests on given port
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});