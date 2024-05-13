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
            switch (value) {
                case 'Event':
                    fetchList('Event');
                    break;
                case 'Announcement':
                    fetchList('Announcement');
                    break;
                case 'User':
                    fetchList('User');
                    break;
                case 'Organisation':
                    fetchList('Organisation');
                    break;
                default:
                    // Default case
                    break;
            }
        });
    });
    
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
    usernameLabel.textContent = username;
    userProfile.classList.remove('hidden');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
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

    const dateEnd = document.createElement('div');
    dateEnd.classList.add('date-end');
    mainInfo.appendChild(dateEnd);

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
        titleText.textContent = items.title;
        if (items.expired) 
            expiredText.textContent = 'Expired';
        location.textContent = items.location;
        owner.textContent = items.owner.username;
        if (Model === 'Announcement') {
            dateBegin.textContent = items.date_begin;
            dateEnd.textContent = items.date_stop;
        } else
            dateBegin.textContent = items.date;
        description.textContent = items.description;
    } else if (Model === 'User' || Model === 'Organisation') {
        titleText.textContent = items.username;
        description.textContent = items.bio;
        email.textContent = items.email;
        phone.textContent = items.phone;
    }

    console.log(elementContainer);
    return elementContainer;
}

async function fetchList(tabName, title = '') {
    console.log('Tab selected:', tabName);

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
            console.log(itemElement);
            itemsContainer.appendChild(itemElement);
        });
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}
