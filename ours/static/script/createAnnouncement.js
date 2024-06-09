// Handle form submission
document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('createAnnouncementButton').addEventListener('click', function (event) {
        event.preventDefault();
        console.log("Button clicked");
        createAnnouncement();
    });
});

function createAnnouncement() {

    // Get the date and time inputs and convert them to Date objects
    var date_begin = document.getElementById('date-begin').value;
    var time_begin = document.getElementById('time-begin').value;
    var isoDateString_begin = date_begin + "T" + time_begin;
    var dateObject_begin = new Date(isoDateString_begin);

    dateObject_begin.setHours(dateObject_begin.getHours() + 2);

    var date_stop = document.getElementById('date-end').value;
    var time_stop = document.getElementById('time-end').value;
    var isoDateString_stop = date_stop + "T" + time_stop;
    var dateObject_stop = new Date(isoDateString_stop);

    // Add 2 hours to the stop date object
    dateObject_stop.setHours(dateObject_stop.getHours() + 2);

    console.log("Form prepared");
    var formData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        date_begin: dateObject_begin,
        date_stop: dateObject_stop,
        location: document.getElementById('location').value,
        maxNumberParticipants: document.getElementById('max-participants').value
    };

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/announcement", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + localStorage.token);
    
    xhr.onload = function () {
        if (xhr.status === 201) {
            window.location.href = "/index.html";
        } else {
            alert("An error occurred during announcement creation.");
        }
    };

    xhr.send(JSON.stringify(formData));
}