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

    const eventsAPI = '/event';

    fetchAndDisplayEvents(eventsAPI);

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


async function fetchAndDisplayEvents(eventsAPI) {
    try {
        const response = await fetch(eventsAPI);
        const events = await response.json();
        const map = L.map('map').setView([51.505, -0.09], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        events.forEach(event => {
            const { latitude, longitude, title } = event;
            L.marker([latitude, longitude]).addTo(map).bindPopup(title);
        });
    } catch (error) {
        console.error('Errore durante il recupero degli eventi:', error);
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
        }
    }
    );
}


function createItemList(Model, items) {
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

    if (Model === 'Event' || Model === 'Announcement') {
        titleText.innerHTML = items.title;
        if (items.expired) 
            expiredText.innerHTML = 'Expired';
        location.innerHTML = "<b>Where:</b><br>" + items.location;
        owner.innerHTML = "<b>Owner:</b><br>" + items.owner.username;
        if (Model === 'Announcement') {
            dateBegin.innerHTML = "<b>Starts:</b><br>" + items.date_begin.split('T')[0];
            hourBegin.innerHTML = items.date_begin.split('T')[1].split('.')[0];
            dateEnd.innerHTML = "<b>Ends:</b><br>" + items.date_stop.split('T')[0]; 
            hourEnd.innerHTML = items.date_stop.split('T')[1].split('.')[0];
        } else
        dateBegin.innerHTML = "<b>On:</b><br>" + items.date.split('T')[0];
        hourBegin.innerHTML = items.date.split('T')[1].split('.')[0];
        description.innerHTML = "<b>Description:</b><br>" + items.description;
    } else if (Model === 'User' || Model === 'Organisation') {
        titleText.innerHTML = items.username;
        if (items.bio !== undefined) 
            description.innerHTML = "<b>Bio:</b><br>" + items.bio;
        email.innerHTML = items.email;
        phone.innerHTML = items.phone;
    }

    owner.addEventListener('click', function(event) {
        event.preventDefault();
        fecthObject('User', items.owner.id);
    });


    return elementContainer;
}

async function fetchList(tabName, title = '') {
    const url = '/' + tabName.toLowerCase() + '/?input=' + title;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const items = await response.json();
        const itemsContainer = document.getElementById('dynamicList');
        itemsContainer.innerHTML = '';

        items.forEach(item => {
            const itemElement = createItemList(tabName, item);
            itemsContainer.appendChild(itemElement);
        });
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

        closeButton.addEventListener('click', function() {
            itemContainer.classList.add('hidden');
        });
        itemContainer.addEventListener('click', function(event) {
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