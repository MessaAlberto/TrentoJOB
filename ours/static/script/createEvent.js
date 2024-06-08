// Handle form submission
document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('createEventButton').addEventListener('click', function (event) {
        event.preventDefault();
        createEvent();
    });
});


function createEvent() {

    // Get the date and time inputs and convert it to a Date object
    var date = document.getElementById('date').value;
    var time = document.getElementById('time').value;
    var isoDateString = date + "T" + time;
    var dateObject = new Date(isoDateString);

    var formData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        date: dateObject,
        location: document.getElementById('location').value,
        maxNumberParticipants: document.getElementById('max-participants').value
    };

    // Create a new XMLHttpRequest
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/event", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + localStorage.token);

    xhr.onload = function () {
        if (xhr.status === 201) {
            window.location.href = "/index.html";
        } else {
            alert("An error occurred during event creation.");
        }
    };

    xhr.send(JSON.stringify(formData));
}