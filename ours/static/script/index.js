let map;

document.addEventListener('DOMContentLoaded', function () {    
    // show Trento on the map
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
        console.error('Error during coordinates fetch:', error);
        return null;
    }
}


async function fetchAndDisplayItems(model, items) {
    try {
        console.log('Fetching items:', items);
        // clean the map
        map.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        let icon;
        if (model === 'Event') {
            console.log('Event');
            icon = new L.AwesomeMarkers.icon({
                icon: 'group',
                markerColor: 'blue',
                prefix: 'fa'
            });
        } else if (model === 'Announcement') {
            console.log('Announcement');
            icon = new L.AwesomeMarkers.icon({
                icon: 'handshake-o',
                markerColor: 'green',
                prefix: 'fa'
            });
            if (icon) {
                console.log('Icon:', icon);
            }

        }

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        console.log('Items:', items);
        items.forEach(async item => {
            const location = item.location;
            const coordinates = await getCoordinatesFromLocation(location);
            console.log('Coordinates:', coordinates);
            if (coordinates) {
                const [longitude, latitude] = coordinates;
                const { title } = item;
                console.log('Title:', title);
                L.marker([latitude, longitude], { icon }).addTo(map).bindPopup(title);
            }
        });
    } catch (error) {
        console.error('Error during items fetch:', error);
    }
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


function createItemList(model, item) {
    const elementContainer = document.createElement('div');
    elementContainer.classList.add('element-container');

    const titleElement = document.createElement('h3');
    titleElement.classList.add('title-container');
    elementContainer.appendChild(titleElement);

    const titleText = document.createElement('div');
    titleText.classList.add('title');
    titleElement.appendChild(titleText);

    const infoContainer = document.createElement('div');
    infoContainer.classList.add('info-container');
    elementContainer.appendChild(infoContainer);

    const mainInfo = document.createElement('div');
    mainInfo.classList.add('main-info');
    infoContainer.appendChild(mainInfo);

    const description = document.createElement('div');
    description.classList.add('description');
    infoContainer.appendChild(description);

    if (model === 'Event' || model === 'Announcement') {
        const expiredText = document.createElement('div');
        expiredText.classList.add('expired');
        titleElement.appendChild(expiredText);

        titleText.innerHTML = item.title || 'No title';
        if (item.expired) expiredText.innerHTML = 'Expired';

        const descriptionKey = document.createElement('div');
        descriptionKey.classList.add('key');
        descriptionKey.innerHTML = 'Description:';
        const descriptionValue = document.createElement('div');
        descriptionValue.classList.add('value');
        descriptionValue.innerHTML = item.description || 'No description available';
        description.appendChild(descriptionKey);
        description.appendChild(descriptionValue);

        const location = document.createElement('div');
        location.classList.add('location');
        mainInfo.appendChild(location);
        const locationKey = document.createElement('div');
        locationKey.classList.add('key');
        locationKey.innerHTML = 'Location:';
        const locationValue = document.createElement('div');
        locationValue.classList.add('value');
        locationValue.innerHTML = item.location || 'Unknown location';
        location.appendChild(locationKey);
        location.appendChild(locationValue);

        const owner = document.createElement('div');
        owner.classList.add('owner');
        mainInfo.appendChild(owner);
        const ownerKey = document.createElement('div');
        ownerKey.classList.add('key');
        ownerKey.innerHTML = 'Owner:';
        const ownerValue = document.createElement('div');
        ownerValue.classList.add('value');
        ownerValue.classList.add('clickable');
        ownerValue.innerHTML = item.owner?.username || 'Unknown owner';
        owner.appendChild(ownerKey);
        owner.appendChild(ownerValue);

        if (model === 'Announcement') {
            ownerValue.addEventListener('click', function (event) {
                event.preventDefault();
                fecthObject('User', item.owner.id);
            });

            if (item.date_begin) {
                const dateBegin = document.createElement('div');
                dateBegin.classList.add('date-begin');
                mainInfo.appendChild(dateBegin);
                const dateBeginKey = document.createElement('div');
                dateBeginKey.classList.add('key');
                dateBeginKey.innerHTML = 'Starts:';
                const dateBeginValue = document.createElement('div');
                dateBeginValue.classList.add('value');
                dateBeginValue.innerHTML = item.date_begin.split('T')[0];
                dateBegin.appendChild(dateBeginKey);
                dateBegin.appendChild(dateBeginValue);

                const hourBegin = document.createElement('div');
                hourBegin.classList.add('hour-begin');
                mainInfo.appendChild(hourBegin);
                const hourBeginKey = document.createElement('div');
                hourBeginKey.classList.add('key');
                hourBeginKey.innerHTML = 'At:';
                const hourBeginValue = document.createElement('div');
                hourBeginValue.classList.add('value');
                hourBeginValue.innerHTML = item.date_begin.split('T')[1].split('.')[0].slice(0, 5);
                hourBegin.appendChild(hourBeginKey);
                hourBegin.appendChild(hourBeginValue);
            }
            if (item.date_stop) {
                const dateEnd = document.createElement('div');
                dateEnd.classList.add('date-end');
                mainInfo.appendChild(dateEnd);
                const dateEndKey = document.createElement('div');
                dateEndKey.classList.add('key');
                dateEndKey.innerHTML = 'Ends:';
                const dateEndValue = document.createElement('div');
                dateEndValue.classList.add('value');
                dateEndValue.innerHTML = item.date_stop.split('T')[0];
                dateEnd.appendChild(dateEndKey);
                dateEnd.appendChild(dateEndValue);

                const hourEnd = document.createElement('div');
                hourEnd.classList.add('hour-end');
                mainInfo.appendChild(hourEnd);
                const hourEndKey = document.createElement('div');
                hourEndKey.classList.add('key');
                hourEndKey.innerHTML = 'At:';
                const hourEndValue = document.createElement('div');
                hourEndValue.classList.add('value');
                hourEndValue.innerHTML = item.date_stop.split('T')[1].split('.')[0].slice(0, 5);
                hourEnd.appendChild(hourEndKey);
                hourEnd.appendChild(hourEndValue);
            }
        } else {
            ownerValue.addEventListener('click', function (event) {
                event.preventDefault();
                fecthObject('Organisation', item.owner.id);
            });

            const dateBegin = document.createElement('div');
            dateBegin.classList.add('date-begin');
            mainInfo.appendChild(dateBegin);
            const dateBeginKey = document.createElement('div');
            dateBeginKey.classList.add('key');
            dateBeginKey.innerHTML = 'On:';
            const dateBeginValue = document.createElement('div');
            dateBeginValue.classList.add('value');
            dateBeginValue.innerHTML = item.date.split('T')[0];
            dateBegin.appendChild(dateBeginKey);
            dateBegin.appendChild(dateBeginValue);

            const hourBegin = document.createElement('div');
            hourBegin.classList.add('hour-begin');
            mainInfo.appendChild(hourBegin);
            const hourBeginKey = document.createElement('div');
            hourBeginKey.classList.add('key');
            hourBeginKey.innerHTML = 'At:';
            const hourBeginValue = document.createElement('div');
            hourBeginValue.classList.add('value');
            hourBeginValue.innerHTML = item.date.split('T')[1].split('.')[0].slice(0, 5);
            hourBegin.appendChild(hourBeginKey);
            hourBegin.appendChild(hourBeginValue);
        }
    } else if (model === 'User' || model === 'Organisation') {
        titleText.innerHTML = item.username || 'No username';

        const email = document.createElement('div');
        email.classList.add('email');
        mainInfo.appendChild(email);
        const emailKey = document.createElement('div');
        emailKey.classList.add('key');
        emailKey.innerHTML = 'Email:';
        const emailValue = document.createElement('div');
        emailValue.classList.add('value');
        emailValue.innerHTML = item.email || 'No email';
        email.appendChild(emailKey);
        email.appendChild(emailValue);

        const phone = document.createElement('div');
        phone.classList.add('phone');
        mainInfo.appendChild(phone);
        const phoneKey = document.createElement('div');
        phoneKey.classList.add('key');
        phoneKey.innerHTML = 'Phone:';
        const phoneValue = document.createElement('div');
        phoneValue.classList.add('value');
        phoneValue.innerHTML = item.phone || 'No phone';
        phone.appendChild(phoneKey);
        phone.appendChild(phoneValue);

        if (item.bio !== undefined) {
            // add to description
            const bioKey = document.createElement('div');
            bioKey.classList.add('key');
            bioKey.innerHTML = 'Bio:';
            const bioValue = document.createElement('div');
            bioValue.classList.add('value');
            bioValue.innerHTML = item.bio;
            description.appendChild(bioKey);
            description.appendChild(bioValue);
        }
    }

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
        fetchAndDisplayItems(model, items);
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