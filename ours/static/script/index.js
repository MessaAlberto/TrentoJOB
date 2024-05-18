let map;

document.addEventListener('DOMContentLoaded', function () {    
    // Check if user ID is present in localStorage
    var userId = localStorage.getItem('userId');
    if (userId) {
        var username = localStorage.getItem('username');
        if (username) {
            displayUserProfile(username);
        }
    }

    var usernameLabel = document.getElementById('usernameLabel');
    if (usernameLabel) {
        usernameLabel.addEventListener('click', function () {
            window.location.href = "/me.html"; // Redirect to /me page
        });
    }
    var profileIcon = document.getElementById('profileIcon');
    if (profileIcon) {
        profileIcon.addEventListener('click', function () {
            toggleSidebar();
        });
    }

    document.body.addEventListener('click', function (event) {
        const sidebar = document.getElementById('sidebar');
        const profileIcon = document.getElementById('profileIcon');

        // Check if the clicked element is not the sidebar or profile icon
        if (!sidebar.contains(event.target) && !profileIcon.contains(event.target)) {
            sidebar.classList.add('hidden');
        }
    });


    // show Trento
    map = L.map('map').setView([46.066422, 11.125760], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    // Add the event listener to the radio buttons
    const radioButtons = document.querySelectorAll('.tabs input[type="radio"]');

    radioButtons.forEach(radioButton => {
        radioButton.addEventListener('click', function () {
            const value = this.value;
            const title = document.getElementById('searchInput').value.trim();
            fetchList(value, title);
            document.getElementById('searchInput').value = '';
        });
    });

    fetchList('Event');
});


async function getCoordinatesFromLocation(location) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
        const data = await response.json();
        const latitude = parseFloat(data[0].lat);
        const longitude = parseFloat(data[0].lon);

        return [longitude, latitude];
    } catch (error) {
        console.error('Errore durante il recupero delle coordinate dalla località:', error);
        return null;
    }
}


async function fetchAndDisplayItems(model, map, items) {
    try {
        // clean the map
        map.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        if (model === 'Event') {
            var icon = new L.AwesomeMarkers.icon({
                icon: 'group',
                markerColor: 'blue',
                prefix: 'fa'
            });
        } else if (model === 'Announcement') {
            var icon = new L.AwesomeMarkers.icon({
                icon: 'handshake-o',
                markerColor: 'green',
                prefix: 'fa'
            });
        }

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        items.forEach(async item => {
            const location = item.location;
            const coordinates = await getCoordinatesFromLocation(location);

            if (coordinates) {
                const [longitude, latitude] = coordinates;
                const { title } = item;
                L.marker([latitude, longitude], { icon }).addTo(map).bindPopup(title);
            }
        });
    } catch (error) {
        console.error('Error during items fetch:', error);
    }
}

function signUp() {
    window.location.href = "registration.html";
}

function login() {
    window.location.href = "login.html";
}

function logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('token');

    // Call the delete /auth
    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", "/auth", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function () {
        if (xhr.status === 200) {
            window.location.href = "/index.html";
        } else {
            alert("Si è verificato un errore durante il logout.");
        }
    };
    xhr.send();
}


function displayUserProfile(username) {
    const singInUp = document.getElementById('sign-in-up');
    const userProfile = document.getElementById('profile-icon');
    const usernameLabel = document.getElementById('usernameLabel');

    singInUp.classList.add('hidden');
    usernameLabel.innerHTML = username;
    userProfile.classList.remove('hidden');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
}

function searchInputBar(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        const title = document.getElementById('searchInput').value.trim();
        const radioButtons = document.querySelectorAll('.tabs input[type="radio"]');
        radioButtons.forEach(radioButton => {
            if (radioButton.checked) {
                fetchList(radioButton.value, title);
                document.getElementById('searchInput').value = '';
            }
        });
    }
}

function searchButton() {
    const title = document.getElementById('searchInput').value.trim();
    const radioButtons = document.querySelectorAll('.tabs input[type="radio"]');
    radioButtons.forEach(radioButton => {
        if (radioButton.checked) {
            fetchList(radioButton.value, title);
            document.getElementById('searchInput').value = '';
        }
    }
    );
}

function displayCreateButton() {
    // Only logged in users can create notices
    var userId = localStorage.getItem('userId');
    if (userId) {
        var createButton = document.getElementById('createNotice');
        createButton.classList.remove('hidden');
    }
}

function createNotices() {
    // Check if it is logged in
    var userId = localStorage.getItem('userId');
    if (!userId) {
        alert("You must be logged in to create a notice.");
        return;
    }

    // Send user to the correct page
    // User --> createAnnouncement
    // Organisation --> createEvent
    var userRole = localStorage.role;
    if (userRole === 'user')
        window.location.href = "/createAnnouncement.html";
    else if (userRole === 'organisation')
        window.location.href = "/createEvent.html";
    else
        alert("You must be logged in to create a notice.");

}


function createItemList(model, items) {
    const elementContainer = document.createElement('div');
    elementContainer.classList.add('element-container');

    const titleElement = document.createElement('h3');
    titleElement.classList.add('title-container');
    elementContainer.appendChild(titleElement);

    const titleText = document.createElement('div');
    titleText.classList.add('title');
    titleElement.appendChild(titleText);

    const expiredText = document.createElement('div');
    expiredText.classList.add('expired');
    titleElement.appendChild(expiredText);

    const infoContainer = document.createElement('div');
    infoContainer.classList.add('info-container');
    elementContainer.appendChild(infoContainer);

    const mainInfo = document.createElement('div');
    mainInfo.classList.add('main-info');
    infoContainer.appendChild(mainInfo);

    const dateBegin = document.createElement('div');
    dateBegin.classList.add('date-begin');
    mainInfo.appendChild(dateBegin);

    const hourBegin = document.createElement('div');
    hourBegin.classList.add('hour-begin');
    mainInfo.appendChild(hourBegin);

    const dateEnd = document.createElement('div');
    dateEnd.classList.add('date-end');
    mainInfo.appendChild(dateEnd);

    const hourEnd = document.createElement('div');
    hourEnd.classList.add('hour-end');
    mainInfo.appendChild(hourEnd);

    const location = document.createElement('div');
    location.classList.add('location');
    mainInfo.appendChild(location);

    const owner = document.createElement('div');
    owner.classList.add('owner');
    mainInfo.appendChild(owner);

    const email = document.createElement('div');
    email.classList.add('email');
    mainInfo.appendChild(email);

    const phone = document.createElement('div');
    phone.classList.add('phone');
    mainInfo.appendChild(phone);

    const description = document.createElement('div');
    description.classList.add('description');
    infoContainer.appendChild(description);

    if (model === 'Event' || model === 'Announcement') {
        titleText.innerHTML = items.title || 'No title';
        if (items.expired) expiredText.innerHTML = 'Expired';
        location.innerHTML = "<b>Where:</b><br>" + (items.location || 'Unknown location');
        owner.innerHTML = "<b>Owner:</b><br>" + (items.owner?.username || 'Unknown owner');
        if (model === 'Announcement') {
            dateBegin.innerHTML = "<b>Starts:</b><br>" + (items.date_begin?.split('T')[0] || 'Unknown start date');
            hourBegin.innerHTML = items.date_begin ? items.date_begin.split('T')[1].split('.')[0] : 'Unknown start time';
            dateEnd.innerHTML = "<b>Ends:</b><br>" + (items.date_stop?.split('T')[0] || 'Unknown end date');
            hourEnd.innerHTML = items.date_stop ? items.date_stop.split('T')[1].split('.')[0] : 'Unknown end time';
        } else {
            dateBegin.innerHTML = "<b>On:</b><br>" + (items.date_begin?.split('T')[0] || 'Unknown date');
            hourBegin.innerHTML = items.date_begin ? items.date_begin.split('T')[1].split('.')[0] : 'Unknown time';
        }
        description.innerHTML = "<b>Description:</b><br>" + (items.description || 'No description available');
    } else if (model === 'User' || model === 'Organisation') {
        titleText.innerHTML = items.username || 'No username';
        if (items.bio !== undefined) description.innerHTML = "<b>Bio:</b><br>" + items.bio;
        email.innerHTML = items.email || 'No email';
        phone.innerHTML = items.phone || 'No phone';
    }

    owner.addEventListener('click', function (event) {
        event.preventDefault();
        fecthObject('User', items.owner.id);
    });


    return elementContainer;
}

async function fetchList(model, title = '') {
    const url = '/' + model.toLowerCase() + '/?input=' + title;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const items = await response.json();
        const itemsContainer = document.getElementById('dynamicList');
        itemsContainer.innerHTML = '';

        items.forEach(item => {
            const itemElement = createItemList(model, item);
            itemsContainer.appendChild(itemElement);
        });

        // show markers on the map
        fetchAndDisplayItems(model, map, items);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

async function fecthObject(model, ownerId) {
    const url = '/' + model.toLowerCase() + '/' + ownerId;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const item = await response.json();
        const itemContainer = document.getElementById('showObject');

        const itemElement = createItemList(model, item);
        itemElement.classList.add('single-item-container');

        const closeButton = document.createElement('button');
        closeButton.classList.add('close-button');
        closeButton.innerHTML = 'Close';

        closeButton.addEventListener('click', function () {
            itemContainer.classList.add('hidden');
        });
        itemContainer.addEventListener('click', function (event) {
            if (event.target === itemContainer) {
                itemContainer.classList.add('hidden');
            }
        });

        itemContainer.appendChild(itemElement);
        itemContainer.appendChild(closeButton);

        itemContainer.classList.remove('hidden');

    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}