// Handle form submission
document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('createAnnouncementButton').addEventListener('click', function (event) {
        event.preventDefault();
        createAnnouncement();
    });
});

function createAnnouncement() {

    // Get the date and time inputs and convert it to a Date object
    var date_begin = document.getElementById('date_begin').value;
    var time_begin = document.getElementById('time_begin').value;
    var isoDateString_begin = date_begin + "T" + time_begin;
    var dateObject_begin = new Date(isoDateString_begin);

    var date_stop = document.getElementById('date_end').value;
    var time_stop = document.getElementById('time_end').value;
    var isoDateString_stop = date_stop + "T" + time_stop;
    var dateObject_stop = new Date(isoDateString_stop);

    var formData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        date_begin: dateObject_begin,
        date_stop: dateObject_stop,
        location: document.getElementById('location').value,
        maxNumberParticipants: document.getElementById('max-participants').value
    };

    // Create a new XMLHttpRequest
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/announcement", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    // Add Authorization header
    xhr.setRequestHeader("Authorization", "Bearer " + localStorage.token);
    
    // Manage the response
    xhr.onload = function () {
        if (xhr.status === 201) {
            // Parse the response JSON
            var response = JSON.parse(xhr.responseText);
            window.location.href = "/me.html";
        } else {
            alert("An error occurred during announcement creation.");
        }
    };

    xhr.send(JSON.stringify(formData));
}