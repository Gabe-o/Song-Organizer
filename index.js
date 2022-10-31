const express = require('express');
const mysql = require('mysql');
const fs = require('fs');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'lab3db'
});

buildDB();

const app = express();
const port = 3000;

app.use('/', express.static('static'));

app.get('/', (req, res) => {
    res.send('Hello World!');
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
    let csvAsArrayByValues = [];
    let valueCounter = 0;
    let inQuotes = false;
    let valueRow = "";
    for (let ch of csvAsString) {
        // Toggles in quotes variable whenever quotes are encountered 
        if (ch === '"') {
            inQuotes = !inQuotes;
        }
        // If we are not in quotes replace the comma with a |
        if (ch === ',' && !inQuotes) {
            ch = '|'
            valueCounter++;
        }
        // When a newline is encountered and we are on the last value in a row push the current row to the array and start over
        if (ch === '\n' && valueCounter === headers.length-1 && !inQuotes) {
            valueCounter = 0;
            csvAsArrayByValues.push(valueRow);
            valueRow = "";
            continue;
        }
        // If the character is not a qoute than add the character to the string
        if (ch !== '"') {
            valueRow += ch
        }
    }

    // Creating JSON objects out of each row and adding them to and array that will contain all data in the CSV
    let csvAsJSON = [];
    for (let i = 0; i < csvAsArrayByValues.length; i++) {
        let obj = {};
        let properties = csvAsArrayByValues[i].split("|");
        // Adds headers and properties to object and add it to JSON list
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = properties[j];
        }
        csvAsJSON.push(obj);
    }

    return csvAsJSON;
}

function buildDB() {
    db.connect();

    let genres = csvToJSON("data/genres.csv");
    let albums = csvToJSON("data/raw_albums.csv");
    let artists = csvToJSON("data/raw_artists.csv");
    let tracks = csvToJSON("data/raw_tracks.csv");

}