const artistForm = document.getElementById("artistSearch");

artistForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const artistName = document.getElementById("artistInput").value;

    fetch("http://localhost:3000/api/artists?artistName=" + artistName, {
        method: "GET",
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    })
        .then(httpResp => httpResp.json())
        .then(data => {
            document.getElementById("artistHeaders").style.display = "table";
            document.getElementById("trackHeaders").style.display = "none";

            console.log(data);
        })
        .catch(err => {
            throw err;
        })
});

const trackForm = document.getElementById("trackSearch");

// Adds event listener for searching for a track
trackForm.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        // Gets input info
        const trackTitle = document.getElementById("trackInput").value;
        const albumName = document.getElementById("albumInput").value;
        const results = 50;

        // Sends request with query
        fetch("http://localhost:3000/api/tracks?trackTitle=" + trackTitle + "&albumName=" + albumName + "&results=" + results, {
            method: "GET",
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        })
            .then(httpResp => httpResp.json())
            .then(data => {
                document.getElementById("artistHeaders").style.display = "none";
                document.getElementById("trackHeaders").style.display = "table";

                // Appends Data
                let table = document.getElementById("infoTable");
                table.textContent = "";

                for (let track of data) {
                    table.appendChild(createTrackTableRow(track));
                }
            })
            .catch(err => {
                throw err;
            })
    }
});

// returns a table row element for given track data
function createTrackTableRow(trackData) {
    let tr = document.createElement("tr");

    // Adds track id
    let td = document.createElement("td");
    td.className = "trackID";
    td.appendChild(document.createTextNode(trackData.trackID));
    tr.appendChild(td);

    // Adds track title
    td = document.createElement("td");
    td.className = "trackTitle";
    td.appendChild(document.createTextNode(trackData.trackTitle));
    tr.appendChild(td);

    // Adds album id
    td = document.createElement("td");
    td.className = "albumID";
    td.appendChild(document.createTextNode(trackData.albumID));
    tr.appendChild(td);

    // Adds album name
    td = document.createElement("td");
    td.className = "albumName";
    td.appendChild(document.createTextNode(trackData.albumName));
    tr.appendChild(td);

    // Adds artist id
    td = document.createElement("td");
    td.className = "artistID";
    td.appendChild(document.createTextNode(trackData.artistID));
    tr.appendChild(td);

    // Adds artist name
    td = document.createElement("td");
    td.className = "artistName";
    td.appendChild(document.createTextNode(trackData.artistName));
    tr.appendChild(td);

    // Adds track tags 
    td = document.createElement("td");
    td.className = "trackTags";
    td.appendChild(document.createTextNode(trackData.trackTags));
    tr.appendChild(td);

    // Adds track date created
    td = document.createElement("td");
    td.className = "trackDateCreated";
    td.appendChild(document.createTextNode(trackData.trackDateCreated));
    tr.appendChild(td);

    // Adds track date recorded
    td = document.createElement("td");
    td.className = "trackDateRecorded";
    td.appendChild(document.createTextNode(trackData.trackDateRecorded));
    tr.appendChild(td);

    // Adds track duration
    td = document.createElement("td");
    td.className = "trackDuration";
    td.appendChild(document.createTextNode(trackData.trackDuration));
    tr.appendChild(td);

    // Adds track genres
    td = document.createElement("td");
    td.className = "trackGenres";
    // Genres are stored as stringified JSON this checks if a JSON is present than parses it if there is one otherwise set genres to an empty array 
    let genres = trackData.trackGenres !== "" ? JSON.parse(trackData.trackGenres.replaceAll("'", '"')) : [];
    // Appends all genre names
    let genreNames = "";
    for (let i = 0; i < genres.length; i++) {
        genreNames += genres[i].genre_title + (i + 1 < genres.length ? ", " : "");
    }
    td.appendChild(document.createTextNode(genreNames));
    tr.appendChild(td);

    // Adds track number (dont know what this is suppose to represent)
    td = document.createElement("td");
    td.className = "trackNum";
    td.appendChild(document.createTextNode(trackData.trackNumber));
    tr.appendChild(td);

    // Adds add to list button (NOT IMPLEMENTED)
    td = document.createElement("td");
    td.className = "addToList";
    td.appendChild(document.createTextNode(""));
    tr.appendChild(td);

    return tr;
}
