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
            console.log(data);
        })
        .catch(err => {
            throw err;
        })
});

const trackForm = document.getElementById("trackSearch");

trackForm.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const trackTitle = document.getElementById("trackInput").value;
        const albumName = document.getElementById("albumInput").value;
        const results = 50;

        console.log(trackTitle + " " + albumName);

        fetch("http://localhost:3000/api/tracks?trackTitle=" + trackTitle + "&albumName=" + albumName + "&results=" + results, {
            method: "GET",
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        })
            .then(httpResp => httpResp.json())
            .then(data => {
                console.log(data);

                let table = document.getElementById("infoTable");
                table.textContent = "";

                for(let track of data) {
                    table.appendChild(createTrackTableRow(track));
                }
            })
            .catch(err => {
                throw err;
            })
    }
});

function createTrackTableRow(trackData) {
    let tr = document.createElement("tr");

    let td = document.createElement("td");
    td.className = "trackID";
    td.appendChild(document.createTextNode(trackData.trackID));
    tr.appendChild(td);

    td = document.createElement("td");
    td.className = "trackTitle";
    td.appendChild(document.createTextNode(trackData.trackTitle));
    tr.appendChild(td);

    td = document.createElement("td");
    td.className = "albumID";
    td.appendChild(document.createTextNode(trackData.albumID));
    tr.appendChild(td);

    td = document.createElement("td");
    td.className = "albumName";
    td.appendChild(document.createTextNode(trackData.albumName));
    tr.appendChild(td);

    td = document.createElement("td");
    td.className = "artistID";
    td.appendChild(document.createTextNode(trackData.artistID));
    tr.appendChild(td);

    td = document.createElement("td");
    td.className = "artistName";
    td.appendChild(document.createTextNode(trackData.artistName));
    tr.appendChild(td);

    td = document.createElement("td");
    td.className = "trackTags";
    td.appendChild(document.createTextNode(trackData.trackTags));
    tr.appendChild(td);

    td = document.createElement("td");
    td.className = "trackDateCreated";
    td.appendChild(document.createTextNode(trackData.trackDateCreated));
    tr.appendChild(td);

    td = document.createElement("td");
    td.className = "trackDateRecorded";
    td.appendChild(document.createTextNode(trackData.trackDateRecorded));
    tr.appendChild(td);

    td = document.createElement("td");
    td.className = "trackDuration";
    td.appendChild(document.createTextNode(trackData.trackDuration));
    tr.appendChild(td);

    td = document.createElement("td");
    td.className = "trackGenres";
    td.appendChild(document.createTextNode(""));
    tr.appendChild(td);

    td = document.createElement("td");
    td.className = "trackNum";
    td.appendChild(document.createTextNode(trackData.trackNumber));
    tr.appendChild(td);

    td = document.createElement("td");
    td.className = "addToList";
    td.appendChild(document.createTextNode(""));
    tr.appendChild(td);
            
    return tr;
}