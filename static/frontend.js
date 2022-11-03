var lists = [];

// Adds event listener for searching for an artist
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
        .then(httpResp => {
            return httpResp.json().then(data => {
                // Clears current data
                let table = document.getElementById("infoTable");
                table.textContent = "";
                if (httpResp.ok) {
                    // Toggles headers
                    document.getElementById("artistHeaders").style.display = "table";
                    document.getElementById("trackHeaders").style.display = "none";

                    // Appends Data
                    for (let artist of data) {
                        table.appendChild(createArtistTableRow(artist));
                    }
                }
                else {
                    throw new Error(httpResp.status + "\n" + JSON.stringify(data));
                }
            })
        })
        .catch(err => {
            alert(err);
        })
});

// Adds event listener for searching for a track
const trackForm = document.getElementById("trackSearch");
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
            .then(httpResp => {
                return httpResp.json().then(data => {
                    // Clears current data
                    let table = document.getElementById("infoTable");
                    table.textContent = "";

                    if (httpResp.ok) {
                        // Toggles Headers
                        document.getElementById("artistHeaders").style.display = "none";
                        document.getElementById("trackHeaders").style.display = "table";

                        // Appends Data
                        for (let track of data) {
                            table.appendChild(createTrackTableRow(track));
                        }
                    }
                    else {
                        throw new Error(httpResp.status + "\n" + JSON.stringify(data));
                    }
                })
            })
            .catch(err => {
                alert(err);
            })
    }
});

// Adds event listener for creating lists
const createListForm = document.getElementById("createList");
createListForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const listName = document.getElementById("listNameInput").value;

    fetch("http://localhost:3000/api/lists", {
        method: "POST",
        body: JSON.stringify({
            "listName": listName
        }),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    })
        .then(httpResp => {
            return httpResp.json().then(data => {
                if (httpResp.ok) {
                    populateLists();
                }
                else {
                    throw new Error(httpResp.status + "\n" + JSON.stringify(data));
                }
            })
        })
        .catch(err => {
            alert(err);
        })
});

// Populates list select boxes with data from the db
function populateLists() {
    fetch("http://localhost:3000/api/lists", {
        method: "GET",
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    })
        .then(httpResp => {
            return httpResp.json().then(data => {
                if (httpResp.ok) {
                    lists = data;
                    document.getElementById("viewListSelect").textContent = "";
                    document.getElementById("listSelect").textContent = "";

                    document.getElementById("viewListSelect").appendChild(document.createElement("option"));
                    document.getElementById("listSelect").appendChild(document.createElement("option"));

                    for (let list of lists) {
                        document.getElementById("viewListSelect").appendChild(createSelectOption(list));
                        document.getElementById("listSelect").appendChild(createSelectOption(list));
                    }
                }
                else {
                    throw new Error(httpResp.status + "\n" + JSON.stringify(data));
                }
            })
        })
        .catch(err => {
            alert(err);
        })
}

// returns a select option element for given list data
function createSelectOption(listData) {
    let option = document.createElement("option");

    option.value = listData.listName;
    option.appendChild(document.createTextNode(listData.listName));

    return option;
}

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

    return tr;
}

// returns a table row element for given artist data
function createArtistTableRow(artistData) {
    let tr = document.createElement("tr");

    // Adds artist id
    td = document.createElement("td");
    td.className = "artistID";
    td.appendChild(document.createTextNode(artistData.artistID));
    tr.appendChild(td);

    // Adds artist name
    td = document.createElement("td");
    td.className = "artistName";
    td.appendChild(document.createTextNode(artistData.artistName));
    tr.appendChild(td);

    // Adds artist location
    td = document.createElement("td");
    td.className = "artistLocation";
    td.appendChild(document.createTextNode(artistData.artistLocation));
    tr.appendChild(td);

    // Adds artist favorites
    td = document.createElement("td");
    td.className = "artistFavorites";
    td.appendChild(document.createTextNode(artistData.artistFavorites));
    tr.appendChild(td);

    // Adds artist date created
    td = document.createElement("td");
    td.className = "artistDateCreated";
    td.appendChild(document.createTextNode(artistData.artistDateCreated));
    tr.appendChild(td);

    // Adds artist website
    td = document.createElement("td");
    td.className = "artistWebsite";
    td.appendChild(document.createTextNode(artistData.artistWebsite));
    tr.appendChild(td);

    // Adds artist associated labels
    td = document.createElement("td");
    td.className = "artistAssociatedLabels";
    td.appendChild(document.createTextNode(artistData.artistAssociatedLabels));
    tr.appendChild(td);

    return tr;
}
