document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const _id = params.get('id');
    const model = params.get('model'); 
    
    if (_id) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/' + model + '/' + _id, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    const content = JSON.parse(xhr.responseText);
                    const container = document.getElementById('container');

                    if(model === 'event') {
                        buildEventPage(container);
                        document.getElementById('title').textContent = content.title;
                        document.getElementById('description').textContent = content.description;
                        
                        // Format the date(dd-mm-yyyy to yyyy-mm-dd)
                        if (content.date) {
                            const date = new Date(content.date);
                            if (!isNaN(date)) {
                                const formattedDate = formatDate(date);
                                document.getElementById('date').textContent = formattedDate;
                            } else {
                                console.error("Invalid birthdate format:", content.date);
                            }
                        }

                        document.getElementById('location').textContent = content.location;
                        document.getElementById('expired').textContent = content.expired;
                        document.getElementById('rating').textContent = content.rating;
                        document.getElementById('owner').textContent = content.owner.username;
                        document.getElementById('maxNumberParticipants').textContent = content.maxNumberParticipants;
                    } else if(model === 'announcement') {
                        buildAnnouncementPage(container);
                        document.getElementById('title').textContent = content.title;
                        document.getElementById('description').textContent = content.description;
                        
                        if (content.date_begin){
                            const date = new Date(content.date_begin);
                            if (!isNaN(date)) {
                                const formattedDate = formatDate(date);
                                document.getElementById('date_begin').textContent = formattedDate;
                            } else {
                                console.error("Invalid birthdate format:", content.date_begin);
                            }
                        }

                        if (content.date_stop){
                            const date = new Date(content.date_stop);
                            if (!isNaN(date)) {
                                const formattedDate = formatDate(date);
                                document.getElementById('date_stop').textContent = formattedDate;
                            } else {
                                console.error("Invalid birthdate format:", content.date_stop);
                            }
                        }

                        document.getElementById('location').textContent = content.location;
                        document.getElementById('rating').textContent = content.rating;
                        document.getElementById('owner').textContent = content.owner.username;
                        document.getElementById('maxNumberParticipants').textContent = content.maxNumberParticipants;
                    }
                } else {
                    console.error('Error fetching user profile:', xhr.statusText);
                }
            }
        };
        xhr.send();
    } else {
        console.error('User ID not found in URL');
    }
});

function formatDate(date) {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function buildEventPage(container) {
    container.innerHTML = `
                <h3 id="title"></h3>
                <div class="info-group">
                    <label for="description">Description:</label>
                    <p id="description"></p>
                </div>
                <div class="info-group">
                    <label for="date">Date:</label>
                    <p id="date"></p>
                </div>
                <div class="info-group">
                    <label for="location">Location:</label>
                    <p id="location"></p>
                </div>
                <div class="info-group">
                    <label for="expired">Expired:</label>
                    <p id="expired"></p>
                </div>
                <div class="info-group">
                    <label for="rating">Rating:</label>
                    <p id="rating"></p>
                </div>
                <div class="info-group">
                    <label for="owner">Owner:</label>
                    <p id="owner"></p>
                </div>
                <div class="info-group">
                    <label for="maxNumberParticipants">Max Number of Participants:</label>
                    <p id="maxNumberParticipants"></p>
                </div>
            `;
}

function buildAnnouncementPage(container) {
    container.innerHTML = `
                <h3 id="title"></h3>
                <div class="info-group">
                    <label for="description">Description:</label>
                    <p id="description"></p>
                </div>
                <div class="info-group">
                    <label for="date_begin">Start Date:</label>
                    <p id="date_begin"></p>
                </div>
                <div class="info-group">
                    <label for="date_stop">End Date:</label>
                    <p id="date_stop"></p>
                </div>
                <div class="info-group">
                    <label for="location">Location:</label>
                    <p id="location"></p>
                </div>
                <div class="info-group">
                    <label for="rating">Rating:</label>
                    <p id="rating"></p>
                </div>
                <div class="info-group">
                    <label for="owner">Owner:</label>
                    <p id="owner"></p>
                </div>
                <div class="info-group">
                    <label for="maxNumberParticipants">Max Number of Participants:</label>
                    <p id="maxNumberParticipants"></p>
                </div>
            `;
}
